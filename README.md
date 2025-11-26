# 📚 Study Buddy – AI-Powered Learning Assistant

Study Buddy is an AI-enhanced learning platform that helps students organize their notes, create flashcards, generate quizzes, and have intelligent study conversations.
The system combines a modern Next.js frontend with Python microservices for OCR, PDF extraction, RAG-based retrieval, and quiz generation.

## 🔐 Authentication

- 🔑 Email/Password login

- 🌐 Google OAuth (GAuth)

- 🔒 Secure session management with NextAuth

##  📝 Notes Upload & Management

- Upload notes as PDF files or plain text

- Text extracted using:

  - 📄 PyMuPDF (for native PDFs)

  - 🔍 OCR.Space API (for scanned PDFs)

- Notes stored and indexed for retrieval

- Used as the exclusive knowledge base for AI Chat
(No external content, no hallucinations)

## 🗂 Flashcards 

- Create and upload your own flashcards

- Organized by subject or topic

- Can be used to generate quizzes

## 🤖 AI Chat (Powered by Your Notes Only)

- AI reads only your uploaded notes

- Responses generated through:

  - 🧠 RAG (Retrieval-Augmented Generation)

  - 🔗 LangChain embeddings + vector search

- Ensures accurate, grounded answers

- ✨ Also suggests important questions extracted from your notes
(great for revision)

## 🗓️ AI-Generated Study Plan

Study Buddy can generate a personalized study plan based on your uploaded notes and selected subjects.

- 📘 Analyses all your uploaded notes

- ⏳ Creates a structured study schedule based on difficulty

- 🎯 Breaks chapters into manageable tasks

- 🪄 Uses RAG + LangChain for context-aware planning

- 📆 Supports daily, weekly, and exam-focused plans

## ❓ Quiz Generator

You can generate quizzes from:

- 📄 Your notes

- 🗂 Your flashcards

- ✍️ Any custom text you provide

 The quiz microservice uses:

- PyMuPDF for PDF parsing

- RAG for topic-aware question generation

- LangChain for structured MCQ / short-answer creation

## 🐍 Python Microservices
### OCR & Note Extraction Service

**Location: open-service**<br>
Run:
```
cd open-service
python open_service.py
```
- Will run on localhost 5000
### Quiz Generator & Study Plan Service

**Location: python-service**
<br>
Run:
```
cd python-service
python app.py 
```
- Will run on localhost 8000
  
### Both services integrate with the main Next.js application using REST APIs.

## 🔑 Environment Variables
### .env.local (Root)
```
MONGODB_URI
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GROQ_API_KEY
HUGGINGFACE_API_KEY
OCR_SPACE_API_KEY
OCR_SERVICE_URL
PYTHON_SERVICE_URL
```
### python-service/.env
```
GROQ_API_KEY
PYTHON_SERVICE_URL
```
### To start the server:
- Run
  ```
  npm install
  npm run dev
  ```
 - Will run on localhost 3000
## 🚀 Technology Stack

- Next.js 14

- TypeScript

- Tailwind CSS + ShadCN

- MongoDB + Mongoose

- NextAuth (Email & Google OAuth)

- Python (Flask/FastAPI microservices)

- LangChain + PyMuPDF + RAG

- OCR.Space API

- HuggingFace + Groq API (LLM)
## 📄 License

This project is licensed under Apache 2.0 License.
