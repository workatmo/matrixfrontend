"use client";

import AdminLayout from "@/components/admin/Layout";
import { runDvlaTestLookup, type DvlaTestResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Loader2, Shield } from "lucide-react";
import { FormEvent, useState } from "react";

function str(v: unknown, fallback = "N/A"): string {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s === "" ? fallback : s;
}

export default function AdminTestDvlaPage() {
  const [vrm, setVrm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DvlaTestResult | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await runDvlaTestLookup(vrm);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const vehicle = result?.vehicle;
  const tyre = result?.tyre;
  const tyreErr = result?.tyre_error;
  const sizes =
    tyre && Array.isArray(tyre.likely_sizes)
      ? (tyre.likely_sizes as unknown[]).filter((x) => typeof x === "string")
      : [];
  const notes =
    tyre && Array.isArray(tyre.notes)
      ? (tyre.notes as unknown[]).filter((x) => typeof x === "string")
      : [];

  return (
    <AdminLayout title="Test DVLA">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Test DVLA</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Super Admin only — vehicle enquiry via API Settings DVLA key; tyre hints via Workatmo Tyre
              API when enabled
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full font-medium border border-red-500/20">
            <Shield className="w-3.5 h-3.5" />
            Restricted
          </div>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vrm" className="text-xs font-medium text-muted-foreground">
              Registration (VRM)
            </label>
            <input
              id="vrm"
              name="vrm"
              value={vrm}
              onChange={(e) => setVrm(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CDE"
              maxLength={16}
              required
              className="w-[min(100%,280px)] rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono uppercase tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Check"
            )}
          </button>
        </form>

        {error ? (
          <div
            className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-medium",
                result.dvla_success
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
              )}
            >
              {result.dvla_success ? "DVLA success" : "DVLA failed"} — HTTP{" "}
              {result.dvla_http_code}
              {result.dvla_error ? ` — ${result.dvla_error}` : null}
            </div>

            {vehicle && typeof vehicle === "object" ? (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground">Vehicle details</h3>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {(
                      [
                        ["Registration", str(vehicle.registrationNumber ?? vrm)],
                        ["Make", str(vehicle.make)],
                        ["Year", str(vehicle.yearOfManufacture)],
                        ["Fuel type", str(vehicle.fuelType)],
                        ["Colour", str(vehicle.colour)],
                        ["MOT status", str(vehicle.motStatus)],
                        ["MOT expiry", str(vehicle.motExpiryDate)],
                        ["Tax status", str(vehicle.taxStatus)],
                      ] as const
                    ).map(([label, val]) => (
                      <tr key={label} className="border-t border-border first:border-t-0">
                        <th className="text-left text-muted-foreground font-medium w-[38%] px-5 py-2.5 align-top">
                          {label}
                        </th>
                        <td className="px-5 py-2.5 text-foreground">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Tyre recommendation</h3>
              </div>
              {tyre && typeof tyre === "object" ? (
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-t border-border">
                      <th className="text-left text-muted-foreground font-medium w-[38%] px-5 py-2.5 align-top">
                        Likely tyre sizes
                      </th>
                      <td className="px-5 py-2.5 text-foreground">
                        {sizes.length ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {sizes.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <th className="text-left text-muted-foreground font-medium px-5 py-2.5">
                        Front pressure (PSI)
                      </th>
                      <td className="px-5 py-2.5">
                        {str(tyre.recommended_pressure_psi_front)}
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <th className="text-left text-muted-foreground font-medium px-5 py-2.5">
                        Rear pressure (PSI)
                      </th>
                      <td className="px-5 py-2.5">
                        {str(tyre.recommended_pressure_psi_rear)}
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <th className="text-left text-muted-foreground font-medium px-5 py-2.5 align-top">
                        Notes
                      </th>
                      <td className="px-5 py-2.5">
                        {notes.length ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {notes.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-4 text-sm">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Tyre recommendation unavailable.
                  </p>
                  {tyreErr && typeof tyreErr.error === "string" ? (
                    <p className="text-muted-foreground text-xs mt-2">{tyreErr.error}</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
