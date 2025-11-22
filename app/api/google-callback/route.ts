import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state'); // 'signup' or null
    
    if (error || !code) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }
    
    // Exchange code for token
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', process.env.GOOGLE_CLIENT_ID as string);
    tokenParams.append('client_secret', process.env.GOOGLE_CLIENT_SECRET as string);
    tokenParams.append('code', code);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google-callback`);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }
    
    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();
    
    // Check if user exists
    let user = await User.findOne({
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    const isSignupFlow = state === 'signup';

    // If user doesn't exist and it's signup flow, create new user
    if (!user && isSignupFlow) {
      const nameParts = googleUser.name.split(' ');
      const firstName = nameParts[0] || googleUser.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        firstName,
        lastName,
        avatar: googleUser.picture,
      });
    } 
    // If user doesn't exist and it's login flow, redirect with error
    else if (!user && !isSignupFlow) {
      return NextResponse.redirect(new URL('/?error=user_not_found', request.url));
    }
    // If user exists, update Google ID and avatar if needed
    else if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (!user.avatar) {
        user.avatar = googleUser.picture;
      }
      await user.save();
    }
    
    // Create session
    const sessionData = {
        userId: user!._id.toString(),
        email: user!.email,
        name: `${user!.firstName} ${user!.lastName}`,
        avatar: user!.avatar,
        };

        // Use absolute URL for redirect
        const dashboardUrl = new URL('/dashboard', request.nextUrl.origin);
        const response = NextResponse.redirect(dashboardUrl.toString());

        response.cookies.set('user_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
        });

        return response;
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}