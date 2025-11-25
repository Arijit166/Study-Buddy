import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get('user_session');
  
  // If no session cookie, redirect to login
  if (!userSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/flashcards/:path*",
    "/notes/:path*",
    "/profile/:path*",
    "/quizzes/:path*",
  ],
};