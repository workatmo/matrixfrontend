// lib/api.ts
// Base URL — set NEXT_PUBLIC_API_URL in .env.local for production
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export interface ApiSettingResource {
  id: number;
  key_name: string;
  label: string;
  description: string;
  icon_type: string;
  value: string | null;  // masked on backend
  has_key: boolean;
  is_enabled: boolean;
  updated_at: string | null;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? "Request failed");
  }

  return json as T;
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
