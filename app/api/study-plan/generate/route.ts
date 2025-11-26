import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, startDate, endDate, selectedNotes } = await req.json();

    if (!topic || !startDate || !endDate || !selectedNotes || selectedNotes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database and fetch notes
    await connectDB();
    
    const notes = await Note.find({
      _id: { $in: selectedNotes },
      userId: user.userId,
    });

    if (notes.length === 0) {
      return NextResponse.json(
        { error: 'No valid notes found' },
        { status: 404 }
      );
    }

    // Extract text content from each note by calling the Python extraction service
    const notesContent = await Promise.all(
      notes.map(async (note) => {
        try {
          // Convert Buffer to base64 string
          const base64Data = note.fileData.toString('base64');
          
          // Call Python extraction service
          const extractResponse = await fetch(`${PYTHON_SERVICE_URL}/extract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64Data,
              mimeType: note.fileType,
            }),
          });

          if (!extractResponse.ok) {
            console.error(`Failed to extract text from note: ${note.name}`);
            return {
              name: note.name,
              content: '',
            };
          }

          const extractData = await extractResponse.json();
          
          return {
            name: note.name,
            content: extractData.text || '',
          };
        } catch (error) {
          console.error(`Error extracting note ${note.name}:`, error);
          return {
            name: note.name,
            content: '',
          };
        }
      })
    );

    // Filter out notes with no content
    const validNotes = notesContent.filter(note => note.content.trim().length > 0);

    if (validNotes.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from any of the selected notes' },
        { status: 400 }
      );
    }

    console.log(`Extracted text from ${validNotes.length} notes`);

    // Call Python service to generate study plan
    const response = await fetch(`${PYTHON_SERVICE_URL}/generate-study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        startDate,
        endDate,
        notes: validNotes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python service error:', errorText);
      throw new Error(`Failed to generate study plan: ${errorText}`);
    }

    const studyPlanData = await response.json();

    return NextResponse.json({
      topic,
      startDate,
      endDate,
      ...studyPlanData,
    });

  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}