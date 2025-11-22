import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');

    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(userSession.value);
    const { name, avatar } = await request.json();

    await connectDB();

    const nameParts = name?.trim().split(' ') || [];
    const firstName = nameParts[0] || sessionData.name?.split(' ')[0];
    const lastName = nameParts.slice(1).join(' ') || sessionData.name?.split(' ').slice(1).join(' ') || '';

    const updateFields: any = {
      firstName,
      lastName,
    };

    let updatedUser;
    if (avatar === null) {
    updatedUser = await User.findByIdAndUpdate(
        sessionData.userId,
        {
        firstName,
        lastName,
        $unset: { avatar: "" }
        },
        { new: true, runValidators: true }
    ).select('-password');
    } else {
    // Add or update avatar (including when avatar is a string)
    updatedUser = await User.findByIdAndUpdate(
        sessionData.userId,
        {
        firstName,
        lastName,
        ...(avatar && { avatar })
        },
        { new: true, runValidators: true }
    ).select('-password');
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedSession = {
      userId: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      email: updatedUser.email,
      avatar: updatedUser.avatar || undefined,
      createdAt: updatedUser.createdAt,
    };

    cookieStore.set('user_session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ 
      user: updatedSession,
      message: 'Profile updated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}