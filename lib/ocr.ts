import fetch from 'node-fetch'

interface OCRResult {
  text: string
  confidence: number
  pages: number
}

/**
 * Extract text using PyMuPDF microservice
 */
async function extractTextWithPyMuPDF(fileBuffer: Buffer, mimeType: string): Promise<OCRResult> {
  try {
    const base64File = fileBuffer.toString('base64')
    
    const response = await fetch('http://localhost:5000/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        mimeType: mimeType
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'OCR processing failed')
    }
    
    const result = await response.json()
    
    return {
      text: result.text.trim(),
      confidence: result.confidence,
      pages: result.pages
    }
  } catch (error) {
    console.error('PyMuPDF extraction error:', error)
    throw new Error('Failed to extract text: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Extract text from PDF
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
  return extractTextWithPyMuPDF(pdfBuffer, 'application/pdf')
}

/**
 * Extract text from image file
 */
export async function extractTextFromImageFile(imageBuffer: Buffer): Promise<OCRResult> {
  return extractTextWithPyMuPDF(imageBuffer, 'image/png')
}

/**
 * Main function to extract text based on file type
 */
export async function extractText(fileBuffer: Buffer, mimeType: string): Promise<OCRResult> {
  console.log(`Processing file type: ${mimeType}`)
  
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(fileBuffer)
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImageFile(fileBuffer)
  } else {
    throw new Error('Unsupported file type for OCR extraction')
  }
}