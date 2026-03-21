"use client";

import { adminLogin } from "@/lib/api";
import {
  buildWorkatmoWhatsAppUrl,
  getWorkatmoInstagramUrl,
} from "@/lib/workatmo-public";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Shield, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [workatmoOpen, setWorkatmoOpen] = useState(false);
  const workatmoTitleId = useId();
  const workatmoInstagramUrl = getWorkatmoInstagramUrl();
  const workatmoWhatsAppUrl = buildWorkatmoWhatsAppUrl();
  const workatmoCreditInteractive =
    Boolean(workatmoInstagramUrl) || Boolean(workatmoWhatsAppUrl);

  useEffect(() => {
    if (!workatmoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWorkatmoOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [workatmoOpen]);

  useEffect(() => {
    if (!workatmoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [workatmoOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/admin/") && !next.startsWith("/admin/login")
          ? next
          : "/admin/dashboard";
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Matrix Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access the admin dashboard
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your admin email and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-4"
            >
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Email address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="credit text-center text-xs text-muted-foreground/60">
          Developed by{" "}
          {workatmoCreditInteractive ? (
            <button
              type="button"
              onClick={() => setWorkatmoOpen(true)}
              className="border-b border-primary/30 font-medium text-primary/90 underline-offset-2 transition-colors hover:border-primary/55 hover:text-primary focus-visible:rounded-sm focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Workatmo Technologies Pvt Ltd
            </button>
          ) : (
            "Workatmo Technologies Pvt Ltd"
          )}
        </p>

        {workatmoOpen && workatmoCreditInteractive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close contact dialog"
              onClick={() => setWorkatmoOpen(false)}
            />
            <div
              className="relative z-10 w-full max-w-[19rem] rounded-[1.15rem] border border-border bg-card p-5 pt-6 text-center shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby={workatmoTitleId}
            >
              <button
                type="button"
                onClick={() => setWorkatmoOpen(false)}
                className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <h2
                id={workatmoTitleId}
                className="text-base font-semibold tracking-tight"
              >
                Contact Workatmo
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Message us on WhatsApp (with a short prefilled note), or open our
                Instagram profile.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {workatmoWhatsAppUrl ? (
                  <a
                    className="block rounded-xl border border-white/15 bg-gradient-to-br from-[#25d366] to-[#128c7e] py-2.5 text-center text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    href={workatmoWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {workatmoInstagramUrl ? (
                  <a
                    className="block rounded-xl border border-[#e1306c]/35 bg-[#e1306c]/10 py-2.5 text-center text-sm font-semibold text-foreground transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    href={workatmoInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
