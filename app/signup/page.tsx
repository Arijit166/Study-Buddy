"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  // ✅ Move hooks here (correct)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      firstName: formData.get("first-name") as string,
      lastName: formData.get("last-name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setIsLoading(false);
      setError("Please enter a valid email address.");
      return;
    }

    const passRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passRegex.test(data.password)) {
      setIsLoading(false);
      setError("Password must be at least 8 characters long and include at least one special character.");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || "Signup failed");
        setIsLoading(false);
        return; // This should stop execution
      }

      // Only reach here if signup was successful
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };
  const handleGoogleSignup = () => {
    setIsLoading(true);
    setError("");
    // Redirect to Google OAuth with signup flag
    window.location.href = '/api/auth/google?signup=true';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Study Buddy</h1>
          <p className="text-sm text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle>Join us</CardTitle>
            <CardDescription>Start your smarter learning journey today</CardDescription>
          </CardHeader>

          <CardContent>
            {/* FORM START */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}

              <Label>First Name</Label>
              <Input name="first-name" required />

              <Label>Last Name</Label>
              <Input name="last-name" required />

              <Label>Email</Label>
              <Input name="email" type="email" required />

              <Label>Password</Label>
              <Input name="password" type="password" required />

              <Button type="submit" disabled={isLoading} className="w-full h-10">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full h-10 mt-4"
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
                Sign up with Google
              </Button>
            </form>
            {/* FORM END */}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/" className="text-accent hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
