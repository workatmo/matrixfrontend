"use client";

import AdminLayout from "@/components/admin/Layout";
import { listAdminUsers, type AdminUserListItem } from "@/lib/api";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function formatRole(name: string | undefined): string {
  if (!name) return "—";
  return name.replace(/_/g, " ");
}

function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: rows, meta } = await listAdminUsers(1, 100);
      setUsers(rows);
      setTotal(meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.role?.name ?? "").toLowerCase().includes(q),
      )
    : users;

  return (
    <AdminLayout title="Users">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Users</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Admin API users from the database ({total} total)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, email, or role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["User", "Role", "Created"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-sm text-muted-foreground text-center">
                      Loading users…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-sm text-muted-foreground text-center">
                      No users match.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-foreground text-sm font-medium">{user.name}</p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground capitalize">
                        {formatRole(user.role?.name)}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatJoined(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
