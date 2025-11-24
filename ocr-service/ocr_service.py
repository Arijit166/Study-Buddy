from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
from PIL import Image
import io
import base64
import pytesseract
import os

app = Flask(__name__)
CORS(app)

def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF using PyMuPDF with OCR fallback"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = []
        total_confidence = 0
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc[page_num]
            
            # Try direct text extraction first
            text = page.get_text()
            
            # If no text or very little text, use OCR
            if not text or len(text.strip()) < 50:
                # Render page as image at high DPI for better OCR
                pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                
                # OCR with Tesseract
                ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                text = " ".join([word for word in ocr_data['text'] if word.strip()])
                
                # Calculate confidence
                confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
                page_confidence = sum(confidences) / len(confidences) if confidences else 0
                total_confidence += page_confidence
            else:
                total_confidence += 95  # High confidence for direct extraction
            
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
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Enhance image for better OCR
        img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
        
        # OCR with confidence
        ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        text = " ".join([word for word in ocr_data['text'] if word.strip()])
        
        # Calculate average confidence
        confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            'text': text,
            'confidence': round(avg_confidence, 2),
            'pages': 1
        }
    
    except Exception as e:
        raise Exception(f"Image extraction failed: {str(e)}")


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200


@app.route('/extract', methods=['POST'])
def extract_text():
    try:
        data = request.json
        
        if not data or 'file' not in data or 'mimeType' not in data:
            return jsonify({'error': 'Missing file or mimeType'}), 400
        
        # Decode base64 file
        file_data = base64.b64decode(data['file'])
        mime_type = data['mimeType']
        
        # Process based on file type
        if mime_type == 'application/pdf':
            result = extract_text_from_pdf(file_data)
        elif mime_type.startswith('image/'):
            result = extract_text_from_image(file_data)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)