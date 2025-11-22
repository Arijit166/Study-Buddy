import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { IUser } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { firstName, lastName, email, password } = await req.json();

    // Check if user already exists
    const existingUser: IUser | null = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: IUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create session data
    const sessionData = {
      userId: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: sessionData,
      },
      { status: 201 }
    );

    // Set session cookie
    response.cookies.set('user_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}