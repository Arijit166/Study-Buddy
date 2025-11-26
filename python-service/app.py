from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  
from PIL import Image
import io
import base64
import pytesseract
import os
from dotenv import load_dotenv
load_dotenv() 
import json
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from datetime import datetime, timedelta
import re

app = Flask(__name__)
CORS(app)

# Initialize Groq LLM
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.7
)

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF using PyMuPDF with OCR fallback"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = []
        total_confidence = 0
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc[page_num]
            text = page.get_text()
            
            if not text or len(text.strip()) < 50:
                pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                text = " ".join([word for word in ocr_data['text'] if word.strip()])
                confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
                page_confidence = sum(confidences) / len(confidences) if confidences else 0
                total_confidence += page_confidence
            else:
                total_confidence += 95
            
            full_text.append(text)
        
        doc.close()
        avg_confidence = total_confidence / page_count if page_count > 0 else 0
        
        return {
            'text': '\n\n'.join(full_text),
            'confidence': round(avg_confidence, 2),
            'pages': page_count
        }
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")

def extract_text_from_image(image_bytes):
    """Extract text from image using Tesseract OCR"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
        ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        text = " ".join([word for word in ocr_data['text'] if word.strip()])
        confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            'text': text,
            'confidence': round(avg_confidence, 2),
            'pages': 1
        }
    except Exception as e:
        raise Exception(f"Image extraction failed: {str(e)}")

def create_vector_store(text):
    """Create FAISS vector store from text"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    vectorstore = FAISS.from_texts(chunks, embeddings)
    return vectorstore

def generate_quiz_questions(content, topic, question_count, difficulty, question_types):
    """Generate quiz questions using RAG"""
    try:
        # Create vector store
        vectorstore = create_vector_store(content)
        
        # Build question types string
        types_str = ", ".join(question_types)
        
        # Create prompt template - simplified to only use {context} and {question}
        prompt_template = """You are an expert quiz generator. Based on the following content, generate quiz questions.

Content: {context}

Generate questions in the following JSON format:
{{
  "questions": [
    {{
      "question": "Question text here",
      "type": "mcq" or "true-false" or "short-answer",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"] (only for mcq),
      "correctAnswer": "Correct answer here"
    }}
  ]
}}

Rules:
1. For MCQ: Provide 4 options, one correct answer
2. For True/False: Options should be ["True", "False"]
3. For Short Answer: Provide a concise correct answer
4. Mix question types if multiple are requested
5. Base ALL questions on the provided content
6. Return ONLY valid JSON, no other text

Question: {question}"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create retrieval chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": prompt}
        )
        
        # Generate questions with all details in the query
        query = f"Generate {question_count} {difficulty} difficulty quiz questions about {topic}. Question types: {types_str}"
        
        result = qa_chain.invoke({"query": query})
        
        # Parse result
        result_text = result.get('result', '')
        
        # Try to extract JSON from the result
        try:
            # Find JSON in the response
            start_idx = result_text.find('{')
            end_idx = result_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = result_text[start_idx:end_idx]
                quiz_data = json.loads(json_str)
                return quiz_data
        except json.JSONDecodeError:
            pass
        
        # If parsing fails, generate a fallback response
        return generate_fallback_questions(topic, question_count, difficulty, question_types)
        
    except Exception as e:
        print(f"Quiz generation error: {str(e)}")
        return generate_fallback_questions(topic, question_count, difficulty, question_types)

def generate_fallback_questions(topic, question_count, difficulty, question_types):
    """Generate fallback questions when RAG fails"""
    questions = []
    
    for i in range(question_count):
        q_type = question_types[i % len(question_types)]
        
        if q_type == 'mcq':
            questions.append({
                "question": f"Question {i+1} about {topic}?",
                "type": "mcq",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option A"
            })
        elif q_type == 'true-false':
            questions.append({
                "question": f"Statement {i+1} about {topic} is correct.",
                "type": "true-false",
                "options": ["True", "False"],
                "correctAnswer": "True"
            })
        else:
            questions.append({
                "question": f"Explain concept {i+1} related to {topic}.",
                "type": "short-answer",
                "correctAnswer": f"Answer related to {topic}"
            })
    
    return {"questions": questions}

def generate_fallback_study_plan(topic, start_date, end_date, days):
    """Generate a basic fallback study plan"""
    start = datetime.strptime(start_date, '%Y-%m-%d')
    
    daily_schedule = []
    for i in range(min(days, 14)):  # Cap at 14 days for fallback
        current_date = start + timedelta(days=i)
        daily_schedule.append({
            "day": i + 1,
            "date": current_date.strftime('%A, %B %d, %Y'),
            "topics": [f"Topic {i + 1} - {topic}"],
            "activities": [
                "Review materials",
                "Complete practice exercises",
                "Take notes"
            ],
            "duration": "2-3 hours"
        })
    
    return {
        "studyPlan": {
            "overview": f"A {days}-day study plan for {topic}. This plan is structured to help you progressively build your understanding through daily focused study sessions.",
            "dailySchedule": daily_schedule,
            "milestones": [
                f"Complete foundational concepts by day {days // 4}",
                f"Finish intermediate topics by day {days // 2}",
                f"Master advanced concepts by day {3 * days // 4}",
                f"Complete review and practice by day {days}"
            ],
            "tips": [
                "Take regular breaks every 25-30 minutes",
                "Review previous day's content before starting new topics",
                "Practice active recall and spaced repetition",
                "Create your own examples for each concept",
                "Join study groups or discussion forums"
            ]
        },
        "mindmap": {
            "central": topic,
            "branches": [
                {
                    "name": "Fundamentals",
                    "subbranches": ["Basic Concepts", "Core Principles", "Terminology"]
                },
                {
                    "name": "Key Topics",
                    "subbranches": ["Topic A", "Topic B", "Topic C"]
                },
                {
                    "name": "Applications",
                    "subbranches": ["Use Cases", "Examples", "Projects"]
                }
            ]
        }
    }

def generate_study_plan_with_mindmap(notes_content, topic, start_date, end_date):
    """Generate comprehensive study plan and mindmap using RAG"""
    try:
        # Combine all notes content
        combined_content = "\n\n".join([
            f"Note: {note['name']}\n{note['content']}" 
            for note in notes_content
        ])
        
        # Create vector store
        vectorstore = create_vector_store(combined_content)
        
        # Calculate study duration
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days + 1
        
        # Create prompt template - ONLY use {context} and {question}
        study_plan_prompt = """You are an expert study planner and educational consultant. Based on the following content, create a detailed study plan.

Content: {context}

Create a comprehensive study plan in JSON format with the following structure:
{{
  "studyPlan": {{
    "overview": "Brief overview of the study plan (2-3 sentences)",
    "dailySchedule": [
      {{
        "day": 1,
        "date": "formatted date",
        "topics": ["topic1", "topic2"],
        "activities": ["activity1", "activity2"],
        "duration": "2-3 hours"
      }}
    ],
    "milestones": ["milestone1", "milestone2", "milestone3"],
    "tips": ["tip1", "tip2", "tip3", "tip4"]
  }},
  "mindmap": {{
    "central": "Main topic",
    "branches": [
      {{
        "name": "Branch 1",
        "subbranches": ["sub1", "sub2", "sub3"]
      }}
    ]
  }}
}}

Requirements:
1. Create a daily study schedule with proper progression
2. Base the plan on the actual content provided
3. Include specific topics, activities, and time estimates
4. Provide 4-5 key milestones
5. Give 4-6 practical study tips
6. Create a mindmap with 3-5 main branches, each with 3-5 subbranches
7. Return ONLY valid JSON, no other text
8. Extract all formulas/equations from the content and include them as a dedicated branch in the mindmap under "Formulas".

Question: {question}"""

        prompt = PromptTemplate(
            template=study_plan_prompt,
            input_variables=["context", "question"]  # ONLY these two
        )
   
        # Create retrieval chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
            chain_type_kwargs={"prompt": prompt}
        )
        
        # Generate study plan - include all details in the query string
        query = f"Create a comprehensive study plan for '{topic}' covering {days} days from {start_date} to {end_date}. Ensure the daily schedule has {days} entries with proper dates and times."
        
        result = qa_chain.invoke({"query": query})  # ONLY pass query
        
        # Parse result
        result_text = result.get('result', '')
        
        # Extract JSON
        try:
            start_idx = result_text.find('{')
            end_idx = result_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = result_text[start_idx:end_idx]
                plan_data = json.loads(json_str)
                
                # Add formatted dates to daily schedule
                current_date = start
                if 'studyPlan' in plan_data and 'dailySchedule' in plan_data['studyPlan']:
                    for day_plan in plan_data['studyPlan']['dailySchedule']:
                        day_plan['date'] = current_date.strftime('%A, %B %d, %Y')
                        current_date += timedelta(days=1)
                
                return plan_data
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            pass
        
        # Fallback
        return generate_fallback_study_plan(topic, start_date, end_date, days)
        
    except Exception as e:
        print(f"Study plan generation error: {str(e)}")
        return generate_fallback_study_plan(topic, start_date, end_date, days)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/extract', methods=['POST'])
def extract_text():
    try:
        data = request.json
        if not data or 'file' not in data or 'mimeType' not in data:
            return jsonify({'error': 'Missing file or mimeType'}), 400
        
        file_data = base64.b64decode(data['file'])
        mime_type = data['mimeType']
        
        if mime_type == 'application/pdf':
            result = extract_text_from_pdf(file_data)
        elif mime_type.startswith('image/'):
            result = extract_text_from_image(file_data)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
       
@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        
        content = data.get('content', '')
        topic = data.get('topic', 'General')
        question_count = data.get('questionCount', 10)
        difficulty = data.get('difficulty', 'medium')
        question_types = data.get('questionTypes', ['mcq'])
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        quiz_data = generate_quiz_questions(
            content, topic, question_count, difficulty, question_types
        )
        
        return jsonify(quiz_data), 200
        
    except Exception as e:
        print(f"Error in generate_quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/generate-study-plan', methods=['POST'])
def generate_study_plan():
    try:
        data = request.json
        
        topic = data.get('topic', '')
        start_date = data.get('startDate', '')
        end_date = data.get('endDate', '')
        notes = data.get('notes', [])
        
        if not topic or not start_date or not end_date or not notes:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate study plan and mindmap
        plan_data = generate_study_plan_with_mindmap(
            notes, topic, start_date, end_date
        )
        
        return jsonify(plan_data), 200
        
    except Exception as e:
        print(f"Error in generate_study_plan: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)