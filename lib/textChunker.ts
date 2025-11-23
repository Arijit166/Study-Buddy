export interface TextChunk {
  content: string
  index: number
  tokens: number
}

/**
 * Split text into manageable chunks with overlap
 */
export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): TextChunk[] {
  // Clean and normalize text
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  // Split into sentences (basic approach)
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText]
  
  const chunks: TextChunk[] = []
  let currentChunk = ''
  let chunkIndex = 0
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    const potentialChunk = currentChunk + ' ' + sentence
    
    // Rough token count (1 token ≈ 4 characters)
    const tokenCount = Math.ceil(potentialChunk.length / 4)
    
    if (tokenCount >= chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        tokens: Math.ceil(currentChunk.length / 4)
      })
      
      // Start new chunk with overlap
      const lastSentences = sentences.slice(Math.max(0, i - overlap), i).join(' ')
      currentChunk = lastSentences + ' ' + sentence
      chunkIndex++
    } else {
      currentChunk = potentialChunk
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      tokens: Math.ceil(currentChunk.length / 4)
    })
  }
  
  return chunks
}

/**
 * Simple stopwords list for topic extraction
 */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'this', 'they', 'their', 'them', 'these',
  'those', 'than', 'then', 'there', 'when', 'where', 'which', 'who',
  'what', 'how', 'can', 'could', 'would', 'should', 'may', 'might',
  'been', 'being', 'have', 'had', 'do', 'does', 'did', 'but', 'or',
  'if', 'because', 'so', 'such', 'no', 'not', 'only', 'own', 'same',
  'too', 'very', 'also', 'just', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over'
])

/**
 * Calculate TF-IDF scores manually (without natural library)
 */
function calculateTFIDF(text: string): Map<string, number> {
  // Tokenize and clean
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOPWORDS.has(word) && !/^\d+$/.test(word))
  
  // Calculate term frequency
  const termFreq = new Map<string, number>()
  words.forEach(word => {
    termFreq.set(word, (termFreq.get(word) || 0) + 1)
  })
  
  // Calculate TF-IDF (simplified - treating entire text as one document)
  const totalWords = words.length
  const tfidf = new Map<string, number>()
  
  termFreq.forEach((count, term) => {
    const tf = count / totalWords
    // Simple IDF approximation based on frequency
    const idf = Math.log(1 + (totalWords / count))
    tfidf.set(term, tf * idf)
  })
  
  return tfidf
}

/**
 * Extract key topics from text using simple TF-IDF
 */
export function extractTopics(text: string, maxTopics: number = 6): string[] {
  const tfidf = calculateTFIDF(text)
  
  // Sort by score and get top terms
  const sortedTerms = Array.from(tfidf.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([term]) => term.charAt(0).toUpperCase() + term.slice(1))
  
  return sortedTerms
}