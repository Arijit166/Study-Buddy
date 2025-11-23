import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Generate study questions from text using Groq Llama-3.1
 */
export async function generateStudyQuestions(text: string, count: number = 6): Promise<string[]> {
  try {
    // Limit text length to avoid token limits
    const textSample = text.slice(0, 3000)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert educator who creates insightful study questions. 
Your task is to generate ${count} diverse, thought-provoking questions that help students understand and review the material.

Rules:
- Create questions that test understanding, not just recall
- Mix question types: conceptual, application-based, comparison, and analytical
- Questions should be clear and specific
- Each question should be self-contained and understandable
- Format: Return ONLY the questions, one per line, numbered 1-${count}
- NO additional text, explanations, or formatting`
        },
        {
          role: 'user',
          content: `Generate ${count} study questions based on this text:\n\n${textSample}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse questions from response
    const questions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+[\.)]\s*/, '')) // Remove numbering
      .filter(q => q.length > 10 && q.includes('?'))
      .slice(0, count)

    // Fallback questions if generation fails
    if (questions.length === 0) {
      return [
        'What are the main concepts discussed in this material?',
        'How can you apply these concepts in practice?',
        'What are the key takeaways from this content?',
        'What questions do you still have about this topic?'
      ].slice(0, count)
    }

    return questions
  } catch (error) {
    console.error('Question generation error:', error)
    
    // Return default questions on error
    return [
      'What are the main topics covered in this document?',
      'Can you explain the key concepts in your own words?',
      'How does this material relate to other topics you\'ve studied?',
      'What examples or applications can you think of?',
      'What aspects need more clarification?',
      'How would you summarize this content to someone else?'
    ].slice(0, count)
  }
}