import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');

    if (!userSession) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionData = JSON.parse(userSession.value);
    
    // Ensure the session data has all required fields
    const user = {
      userId: sessionData.userId,
      firstName: sessionData.firstName,
      lastName: sessionData.lastName,
      name: sessionData.name || `${sessionData.firstName} ${sessionData.lastName}`.trim(),
      email: sessionData.email,
      avatar: sessionData.avatar,
      createdAt: sessionData.createdAt, // Add this
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}