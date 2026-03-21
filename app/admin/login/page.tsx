"use client";

import { adminLogin } from "@/lib/api";
import { Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matrix Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in with an admin account stored in the database (email and password).
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xl"
        >
          {error && (
            <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity",
              "bg-foreground text-background hover:opacity-90 disabled:opacity-50"
            )}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

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
