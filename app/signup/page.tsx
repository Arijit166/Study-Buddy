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

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get("first-name"),
      lastName: formData.get("last-name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Signup failed");

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) throw new Error(signInResult.error);

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/dashboard" });
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
