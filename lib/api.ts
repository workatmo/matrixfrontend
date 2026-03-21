// lib/api.ts
import { apiBaseUrl } from "@/lib/config";

const BASE_URL = apiBaseUrl;

/** Sanctum token from POST /admin/login — stored for Bearer auth. */
export const ADMIN_TOKEN_STORAGE_KEY = "matrix_admin_token";

export interface ApiSettingResource {
  id: number;
  key_name: string;
  label: string;
  description: string;
  icon_type: string;
  value: string | null; // masked on backend
  has_key: boolean;
  is_enabled: boolean;
  updated_at: string | null;
}

export interface AdminUserPayload {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string } | null;
  permissions: string[];
}

function parseJsonRecord(text: string): Record<string, unknown> {
  if (!text.trim()) {
    return {};
  }
  try {
    const v = JSON.parse(text) as unknown;
    return v !== null && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function messageFromApiPayload(json: Record<string, unknown>): string | null {
  const msg = json.message;
  if (typeof msg === "string" && msg.trim()) {
    return msg.trim();
  }
  const errors = json.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const v of Object.values(errors as Record<string, unknown>)) {
      if (Array.isArray(v) && typeof v[0] === "string") {
        return v[0];
      }
      if (typeof v === "string") {
        return v;
      }
    }
  }
  return null;
}

function describeHttpFailure(status: number, text: string): string {
  if (status === 401) {
    return "Not signed in. Use /admin/login with a Super Admin account, then try again.";
  }
  if (status === 403) {
    return "You do not have permission for this action (Super Admin required for system update).";
  }
  if (status === 404) {
    return "API route not found. Check NEXT_PUBLIC_API_URL and Laravel routes.";
  }
  if (status === 422) {
    return "Validation error from the API.";
  }
  if (status >= 500) {
    return "Server error from the API. Check Laravel logs.";
  }
  const trimmed = text.trim();
  if (trimmed.startsWith("<")) {
    return `The API returned HTML instead of JSON (HTTP ${status}). Check the API URL and proxy.`;
  }
  if (trimmed.length > 0 && trimmed.length <= 280) {
    return trimmed;
  }
  return `Request failed (HTTP ${status}).`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const url = `${BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
  } catch (e) {
    const hint = BASE_URL.startsWith("/")
      ? " Check that Laravel is running (e.g. php artisan serve) — Next proxies /api-backend to it."
      : " Check CORS settings on the API and that the Laravel server is reachable.";
    if (e instanceof TypeError) {
      throw new Error(`Cannot reach the API at ${url}.${hint}`);
    }
    throw e;
  }

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      window.location.assign("/admin/login");
    }
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  return json as T;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; user: AdminUserPayload }> {
  const url = `${BASE_URL}/admin/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Cannot reach the API at ${url}. Is Laravel running?`);
    }
    throw e;
  }

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as
    | { token?: string; user?: AdminUserPayload }
    | undefined;
  const token = data?.token;
  const user = data?.user;
  if (!token || !user) {
    throw new Error("Unexpected login response from the API.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  }

  return { token, user };
}

export async function adminLogout(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (token) {
    try {
      await fetch(`${BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Still clear local session if the API is unreachable.
    }
  }
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export interface SystemUpdateStatus {
  repository_exists: boolean;
  pending_migrations: string[];
  pending_count: number;
  note?: string;
}

export interface SystemUpdateResult {
  migrate_output: string;
  cache_output: string;
}

export async function getSystemUpdateStatus(): Promise<SystemUpdateStatus> {
  const data = await request<{ data: SystemUpdateStatus }>("/admin/system-update");
  return data.data;
}

export async function runSystemUpdate(): Promise<SystemUpdateResult> {
  const data = await request<{ data: SystemUpdateResult; message?: string }>(
    "/admin/system-update",
    { method: "POST" }
  );
  return data.data;
}

// ── API Settings ────────────────────────────────────────────────────────────

export async function getApiSettings(): Promise<ApiSettingResource[]> {
  const data = await request<{ data: { settings: ApiSettingResource[] } }>(
    "/admin/api-settings"
  );
  return data.data.settings;
}

export async function toggleApiSetting(id: number): Promise<ApiSettingResource> {
  const data = await request<{ data: ApiSettingResource }>(
    `/admin/api-settings/${id}/toggle`,
    { method: "PATCH" }
  );
  return data.data;
}

export async function updateApiKey(id: number, value: string): Promise<ApiSettingResource> {
  const data = await request<{ data: ApiSettingResource }>(
    `/admin/api-settings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ value }),
    }
  );
  return data.data;
}
