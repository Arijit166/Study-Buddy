import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account exists with this email" },
        { status: 401 }
      );
    }
    
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "Please sign in with Google" },
        { status: 401 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Create session
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
    };
    
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: sessionData
      },
      { status: 200 }
    );
    
    response.cookies.set('user_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}