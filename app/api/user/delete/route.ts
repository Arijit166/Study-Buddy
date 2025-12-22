import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionData = JSON.parse(userSession.value);
    
    await connectDB();
    
    // Find the user first to get avatar URL
    const user = await User.findById(sessionData.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete avatar from Vercel Blob if it exists
    if (user.avatar) {
      try {
        await del(user.avatar);
      } catch (error) {
        console.error('Failed to delete avatar:', error);
      }
    }

    // Delete the user from database
    await User.findByIdAndDelete(sessionData.userId);
    
    // Clear the session cookie
    const response = NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );
    
    response.cookies.delete('user_session');
    
    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}