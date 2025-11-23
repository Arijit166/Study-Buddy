import sharp from 'sharp'
import FormData from 'form-data'
import fetch from 'node-fetch'

interface OCRResult {
  text: string
  confidence: number
  pages: number
}

/**
 * Pre-process image for better OCR accuracy
 */
async function preprocessImage(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize({ width: 2000, withoutEnlargement: false })
    .greyscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer()
}

/**
 * Extract text using OCR.space API (Free tier: 25,000 requests/month)
 */
async function extractTextWithOCRSpace(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    const processedImage = await preprocessImage(imageBuffer)
    const base64Image = processedImage.toString('base64')
    
    const formData = new FormData()
    formData.append('base64Image', `data:image/png;base64,${base64Image}`)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('OCREngine', '2')
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': process.env.OCR_SPACE_API_KEY || 'K87899142388957',
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed')
    }
    
    const text = result.ParsedResults?.[0]?.ParsedText || ''
    
    return {
      text: text.trim(),
      confidence: 85
    }
  } catch (error) {
    console.error('OCR.space extraction error:', error)
    throw new Error('Failed to extract text from image')
  }
}

/**
 * Extract text from PDF using OCR.space API directly
 */
async function extractTextFromPDFWithOCR(pdfBuffer: Buffer): Promise<OCRResult> {
  try {
    const base64Pdf = pdfBuffer.toString('base64')
    
    const formData = new FormData()
    formData.append('base64Image', `data:application/pdf;base64,${base64Pdf}`)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('OCREngine', '2')
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': process.env.OCR_SPACE_API_KEY || 'K87899142388957',
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed')
    }
    
    const text = result.ParsedResults?.[0]?.ParsedText || ''
    
    return {
      text: text.trim(),
      confidence: 85,
      pages: result.ParsedResults?.length || 1
    }
  } catch (error) {
    console.error('PDF OCR error:', error)
    throw new Error('Failed to extract text from PDF with OCR')
  }
}

/**
 * Extract text from PDF (tries direct extraction first, then OCR)
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
  try {
    const pdfParse = require('pdf-parse')
    
    // Try direct PDF text extraction first
    try {
      const data = await pdfParse(pdfBuffer)
      
      if (data.text && data.text.trim().length > 100) {
        console.log('✅ Extracted text directly from PDF (not scanned)')
        return {
          text: data.text,
          confidence: 95,
          pages: data.numpages
        }
      }
    } catch (e) {
      console.log('Direct PDF extraction failed, will use OCR...')
    }
    
    // If direct extraction fails, use OCR.space API directly on PDF
    console.log('⚠️ PDF appears to be scanned. Using OCR.space API...')
    
    return await extractTextFromPDFWithOCR(pdfBuffer)
    
  } catch (error) {
    console.error('PDF text extraction error:', error)
    throw new Error('Failed to extract text from PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Extract text from image file
 */
export async function extractTextFromImageFile(imageBuffer: Buffer): Promise<OCRResult> {
  try {
    const { text, confidence } = await extractTextWithOCRSpace(imageBuffer)
    
    return {
      text,
      confidence,
      pages: 1
    }
  } catch (error) {
    console.error('Image text extraction error:', error)
    throw new Error('Failed to extract text from image')
  }
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