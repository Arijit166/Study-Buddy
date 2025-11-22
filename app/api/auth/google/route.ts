import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isSignup = searchParams.get('signup'); // Check if it's from signup page
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: 'http://localhost:3000/api/google-callback',
    scope: 'openid profile email',
    response_type: 'code',
    access_type: 'offline',
    prompt: 'select_account',
    ...(isSignup && { state: 'signup' }) // Pass signup flag as state
  });
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?${params}`;
  return NextResponse.redirect(googleAuthUrl);
}