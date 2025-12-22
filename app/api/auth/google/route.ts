import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isSignup = searchParams.get('signup'); 
  const baseUrl = process.env.NEXTAUTH_URL
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: `${baseUrl}/api/google-callback`,
    scope: 'openid profile email',
    response_type: 'code',
    access_type: 'offline',
    prompt: 'select_account',
    ...(isSignup && { state: 'signup' })
  });
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?${params}`;
  return NextResponse.redirect(googleAuthUrl);
}