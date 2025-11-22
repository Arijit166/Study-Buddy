import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';

export async function DELETE(
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
    const { id } = await params; // ADD await here
    await connectDB();

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: sessionData.userId,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Note deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

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
    const { id } = await params; // ADD await here
    await connectDB();

    const note = await Note.findOne({
      _id: id,
      userId: sessionData.userId,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Return file as base64
    const base64Data = note.fileData.toString('base64');
    
    return NextResponse.json({
      id: note._id.toString(),
      name: note.name,
      fileName: note.fileName,
      fileType: note.fileType,
      fileSize: note.fileSize,
      fileData: base64Data,
      createdAt: note.createdAt,
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch note error:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}