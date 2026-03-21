"use client";

import AdminLayout from "@/components/admin/Layout";
import {
  getSystemUpdateStatus,
  runSystemUpdate,
  type SystemUpdateStatus,
} from "@/lib/api";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminUpdatePage() {
  const [status, setStatus] = useState<SystemUpdateStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [runLoading, setRunLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runSuccess, setRunSuccess] = useState<{
    migrate_output: string;
    cache_output: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const s = await getSystemUpdateStatus();
      setStatus(s);
    } catch (e) {
      setStatus(null);
      setStatusError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleRun = async () => {
    setRunLoading(true);
    setRunError(null);
    setRunSuccess(null);
    try {
      const result = await runSystemUpdate();
      setRunSuccess(result);
      await loadStatus();
    } catch (e) {
      setRunError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <AdminLayout title="System update" fullPage>
      <div className="flex flex-1 flex-col min-h-0">
        {/* Full-width top bar */}
        <div className="shrink-0 flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-border bg-card/40">
          <div>
            <h2 className="text-2xl font-bold text-foreground">System update</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Super Admin only — apply pending database migrations and refresh application caches
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full font-medium border border-red-500/20">
            <Shield className="w-3.5 h-3.5" />
            Restricted
          </div>
        </div>

        {/* Body: fills remaining viewport */}
        <div className="flex flex-1 flex-col min-h-0 lg:flex-row">
          {/* Left column — controls & context */}
          <div className="flex flex-col gap-6 shrink-0 border-border lg:w-[min(100%,420px)] lg:border-r overflow-y-auto p-6">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1 min-w-0">
                <p className="text-amber-600 dark:text-amber-400 font-medium">What this does</p>
                <ul className="text-amber-600/80 dark:text-amber-400/80 list-disc pl-4 space-y-1">
                  <li>
                    Runs{" "}
                    <strong className="font-medium text-amber-700 dark:text-amber-300">only pending</strong>{" "}
                    Laravel migrations (
                    <code className="text-xs font-mono bg-muted px-1 rounded">php artisan migrate</code>
                    ). It does{" "}
                    <strong className="font-medium text-amber-700 dark:text-amber-300">not</strong> drop or
                    rebuild tables when migrations are written correctly.
                  </li>
                  <li>
                    Clears config, route, view, and application caches (
                    <code className="text-xs font-mono bg-muted px-1 rounded">optimize:clear</code>).
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 min-h-0 flex-1 lg:flex-none">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-foreground font-semibold">Migration status</h3>
                <button
                  type="button"
                  onClick={() => void loadStatus()}
                  disabled={statusLoading}
                  className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-ring transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {statusLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Refresh
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                This calls a protected API.{" "}
                <Link
                  href="/admin/login"
                  className="text-foreground underline underline-offset-2 hover:text-sidebar-primary"
                >
                  Sign in
                </Link>{" "}
                with a <strong className="font-medium text-foreground">Super Admin</strong> account so a token is
                stored; then refresh status.
              </p>

              {statusError && (
                <p className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2 whitespace-pre-wrap">
                  {statusError}
                </p>
              )}

              {statusLoading && !status && !statusError && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              )}

              {status && (
                <div className="flex flex-col gap-3 min-h-0 flex-1">
                  {!status.repository_exists && status.note && (
                    <p className="text-sm text-muted-foreground">{status.note}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{status.pending_count}</span> pending
                    migration
                    {status.pending_count === 1 ? "" : "s"}
                  </p>
                  {status.pending_migrations.length > 0 ? (
                    <ul className="text-xs font-mono bg-muted border border-border rounded-xl p-3 flex-1 min-h-[120px] max-h-[40vh] lg:max-h-none lg:flex-1 overflow-y-auto space-y-1">
                      {status.pending_migrations.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Database is up to date with all local migration files.
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => void handleRun()}
                  disabled={runLoading || statusLoading}
                  className={cn(
                    "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity",
                    "bg-foreground text-background hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
                  )}
                >
                  {runLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running update…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Run update
                    </>
                  )}
                </button>
              </div>
            </div>

            {runError && (
              <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                {runError}
              </div>
            )}
          </div>

          {/* Right column — command output (full remaining space) */}
          <div className="flex flex-1 flex-col min-h-0 min-w-0 border-t border-border lg:border-t-0 bg-background/60">
            <div className="shrink-0 px-6 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Command output</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Appears here after you run an update
              </p>
            </div>

            <div className="flex flex-1 flex-col min-h-0 gap-4 p-6 overflow-hidden">
              {!runSuccess && (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Output from <code className="font-mono text-xs">migrate</code> and{" "}
                    <code className="font-mono text-xs">optimize:clear</code> will show in this panel.
                  </p>
                </div>
              )}

              {runSuccess && (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Update finished successfully
                  </div>
                  <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="flex min-h-0 flex-col gap-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                        Migrations
                      </p>
                      <pre className="text-xs font-mono bg-muted border border-border rounded-xl p-4 flex-1 min-h-[8rem] overflow-auto whitespace-pre-wrap">
                        {runSuccess.migrate_output}
                      </pre>
                    </div>
                    <div className="flex min-h-0 flex-col gap-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                        Cache clear
                      </p>
                      <pre className="text-xs font-mono bg-muted border border-border rounded-xl p-4 flex-1 min-h-[8rem] overflow-auto whitespace-pre-wrap">
                        {runSuccess.cache_output}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
