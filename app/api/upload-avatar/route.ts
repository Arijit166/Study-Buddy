import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}