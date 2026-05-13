"use client";

import { customerForgotPassword } from "@/lib/customer-api";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await customerForgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password</h1>
          <p className="text-sm text-muted-foreground">Enter your booking email to receive a password reset link.</p>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reset password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitted ? (
              <div className="flex items-start gap-2.5 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>If an account exists for this email, a reset link has been sent.</span>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/account/login" className={buttonVariants({ variant: "default" })}>
                Back to sign in
              </Link>
              <Link href="/account/register" className={buttonVariants({ variant: "outline" })}>
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

