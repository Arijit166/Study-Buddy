'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Study Buddy</h1>
          <p className="text-sm text-muted-foreground mt-2">Your AI-powered study companion</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue learning</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required className="mt-2"/>
              </div>

              <div>
                <Label>Password</Label>
                <Input name="password" type="password" required className="mt-2"/>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-lg">
                {isLoading ? 'Signing in...' : 'Continue'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-11 rounded-lg border-2 border-border hover:bg-accent/100 transition-colors bg-transparent"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
