import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(userSession.value);
    await connectDB();

    const notes = await Note.find({ userId: sessionData.userId })
      .select('-fileData') // Exclude file data for list view
      .sort({ createdAt: -1 });

    return NextResponse.json({ notes }, { status: 200 });

  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}