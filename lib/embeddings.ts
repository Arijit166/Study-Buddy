import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '')

export interface Embedding {
  vector: number[]
  model: string
}

export async function generateEmbedding(text: string): Promise<Embedding> {
  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text
    })

    // Normalize response → always number[]
    let vector: number[] = []

    if (Array.isArray(response)) {
      if (Array.isArray(response[0])) {
        // number[][]
        vector = response[0] as number[]
      } else {
        // number[]
        vector = response as number[]
      }
    }

    return {
      vector,
      model: 'all-MiniLM-L6-v2'
    }
  } catch (error) {
    console.error('Embedding generation error:', error)

    return {
      vector: new Array(384).fill(0),
      model: 'all-MiniLM-L6-v2-fallback'
    }
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (normA * normB)
}

export function findSimilarChunks(
  queryEmbedding: number[],
  chunkEmbeddings: { content: string; embedding: number[]; index: number }[],
  topK: number = 3
) {
  const similarities = chunkEmbeddings.map(chunk => ({
    content: chunk.content,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    index: chunk.index
  }))

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}
