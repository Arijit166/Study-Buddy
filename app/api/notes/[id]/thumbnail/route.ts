import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(userSession.value);
    const { id } = await params;
    await connectDB();

    const note = await Note.findOne({
      _id: id,
      userId: sessionData.userId,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Return base64 encoded thumbnail
    if (note.fileType.includes('image')) {
      // For images, return the image data directly
      return NextResponse.json({
        thumbnail: note.fileData.toString('base64'),
        type: note.fileType
      });
    } else if (note.fileType.includes('pdf')) {
      return NextResponse.json({
        thumbnail: null,
        type: 'pdf'
      });
    }

    return NextResponse.json({ thumbnail: null, type: 'unknown' });

  } catch (error) {
    console.error('Thumbnail error:', error);
    return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 });
  }
}