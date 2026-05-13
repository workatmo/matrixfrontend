"use client";

import { customerLogin, getCustomerToken } from "@/lib/customer-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCustomerToken()) {
      router.replace("/account");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await customerLogin(email.trim(), password);
      const next = searchParams.get("next");
      const target =
        next &&
        next.startsWith("/account") &&
        !next.startsWith("/account/login") &&
        !next.startsWith("/account/register")
          ? next
          : "/account";
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 sm:py-14">
      <div className="w-full max-w-md space-y-7">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">My account</h1>
            <p className="text-base text-neutral-400">
              Sign in with the email you used at checkout and your account password.
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-white/10 bg-neutral-950/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl text-white">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="customer-email" className="text-xl text-white">
                  Email
                </Label>
                <Input
                  id="customer-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-password" className="text-xl text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="customer-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/15 bg-white/5 pr-10 text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-white/30"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <a
                    href="/account/forgot-password"
                    className="text-sm underline underline-offset-4 text-neutral-400 hover:text-white"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-base font-semibold bg-white text-black hover:bg-neutral-200"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-neutral-400">
          <Link href="/account/register" className="underline underline-offset-4 hover:text-white">
            Create an account
          </Link>
          {" · "}
          <Link href="/" className="underline underline-offset-4 hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
