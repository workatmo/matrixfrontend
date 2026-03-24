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
  /** e.g. dvla, maps, workatmo_tyre, paypal (legacy: openai) */
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
  is_active: boolean;
}

export interface AdminUserListItem {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string } | null;
  permissions: string[];
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUsersListResult {
  users: AdminUserListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AdminNotification {
  id: number;
  title: string;
  color: string;
  link: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminNotificationPayload {
  title: string;
  color: string;
  link?: string | null;
}

export async function listAdminNotifications(): Promise<AdminNotification[]> {
  const data = await request<{ data: { notifications: AdminNotification[] } }>("/admin/notifications");
  return data.data.notifications;
}

export async function createAdminNotification(payload: AdminNotificationPayload): Promise<AdminNotification> {
  const data = await request<{ data: AdminNotification }>("/admin/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminNotification(id: number, payload: AdminNotificationPayload): Promise<AdminNotification> {
  const data = await request<{ data: AdminNotification }>(`/admin/notifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminNotification(id: number): Promise<void> {
  await request(`/admin/notifications/${id}`, { method: "DELETE" });
}

export async function listAdminUsers(
  page = 1,
  perPage = 50,
): Promise<AdminUsersListResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const body = await request<{ data: AdminUsersListResult }>(
    `/admin/users?${params.toString()}`,
  );
  return body.data;
}

export interface AdminUserCreatePayload {
  name: string;
  email: string;
  password?: string;
  role: string;
  permissions?: string[];
  is_active?: boolean;
}

export async function createAdminUser(payload: AdminUserCreatePayload): Promise<AdminUserListItem> {
  const data = await request<{ data: AdminUserListItem }>("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminUser(id: number, payload: Partial<AdminUserCreatePayload>): Promise<AdminUserListItem> {
  const data = await request<{ data: AdminUserListItem }>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await request(`/admin/users/${id}`, { method: "DELETE" });
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

/** Browsers differ: some use TypeError, Safari uses "Load failed" on the message. */
function isLikelyFetchNetworkError(e: unknown): boolean {
  if (e instanceof TypeError) {
    return true;
  }
  if (e instanceof DOMException && e.name === "NetworkError") {
    return true;
  }
  if (e instanceof Error) {
    const m = e.message.toLowerCase();
    return (
      m.includes("failed to fetch") ||
      m.includes("load failed") ||
      m.includes("networkerror") ||
      m.includes("network request failed")
    );
  }
  return false;
}

function describeHttpFailure(status: number, text: string): string {
  if (status === 401) {
    return "Not signed in or invalid credentials. Use an admin user from the database.";
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
      ? " Ensure `npm run dev` is running, then check LARAVEL_PROXY_TARGET in `.env` (server must reach Laravel)."
      : " Check CORS on the API and that the Laravel server is reachable.";
    if (isLikelyFetchNetworkError(e)) {
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
    if (isLikelyFetchNetworkError(e)) {
      throw new Error(
        `Cannot reach the API at ${url}. Ensure the dev server is running and LARAVEL_PROXY_TARGET is reachable from Node (try opening this app at http://127.0.0.1:3000 if you use localhost).`,
      );
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

/** Remove stored token only (no API call). */
export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  }
}

/**
 * True only if GET /admin/profile succeeds. Any other outcome clears the stored
 * token so we never show the admin shell after API errors (401, 403, 5xx, or
 * network) — production misconfiguration often returns 500 instead of 401.
 */
export async function checkAdminSessionWithApi(): Promise<AdminUserPayload | null> {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  const url = `${BASE_URL}/admin/profile`;
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      signal: AbortSignal.timeout(3000), // fail fast – don't block the UI
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const text = await res.text();
      const json = parseJsonRecord(text);
      return (json.data as AdminUserPayload) || null;
    }

    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    return null;
  }
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

// ── DVLA test (Super Admin) ─────────────────────────────────────────────────

export interface DvlaTestResult {
  dvla_success: boolean;
  dvla_http_code: number;
  dvla_error: string | null;
  vehicle: Record<string, unknown> | null;
  tyre: Record<string, unknown> | null;
  tyre_error: Record<string, unknown> | null;
}

export async function runDvlaTestLookup(vrm: string): Promise<DvlaTestResult> {
  const json = await request<{ data: DvlaTestResult }>("/admin/dvla-test", {
    method: "POST",
    body: JSON.stringify({ vrm }),
  });
  return json.data;
}

export interface AdminTyre {
  id: number;
  brand_id: number;
  brand_name: string | null;
  model: string;
  size_id: number;
  size_label: string | null;
  season_id: number | null;
  season_name: string | null;
  tyre_type_id: number | null;
  tyre_type_name: string | null;
  fuel_efficiency_id: number | null;
  fuel_efficiency_rating: string | null;
  speed_rating_id: number | null;
  speed_rating: string | null;
  price: number;
  stock: number;
  description: string | null;
  status: boolean;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminCreateTyrePayload {
  brand_id: number;
  model: string;
  size_id: number;
  season_id?: number | null;
  tyre_type_id?: number | null;
  fuel_efficiency_id?: number | null;
  speed_rating_id?: number | null;
  price: number;
  stock: number;
  description?: string | null;
  status?: boolean | "active" | "inactive";
  image?: File;
}

export async function listAdminTyres(): Promise<AdminTyre[]> {
  const data = await request<{ data: { tyres: AdminTyre[] } }>("/admin/tyres");
  return data.data.tyres;
}

export async function createAdminTyre(payload: AdminCreateTyrePayload): Promise<AdminTyre> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("brand_id", String(payload.brand_id));
  form.append("model", payload.model);
  form.append("size_id", String(payload.size_id));
  if (payload.season_id !== undefined && payload.season_id !== null) form.append("season_id", String(payload.season_id));
  if (payload.tyre_type_id !== undefined && payload.tyre_type_id !== null) form.append("tyre_type_id", String(payload.tyre_type_id));
  if (payload.fuel_efficiency_id !== undefined && payload.fuel_efficiency_id !== null) form.append("fuel_efficiency_id", String(payload.fuel_efficiency_id));
  if (payload.speed_rating_id !== undefined && payload.speed_rating_id !== null) form.append("speed_rating_id", String(payload.speed_rating_id));
  form.append("price", String(payload.price));
  form.append("stock", String(payload.stock));
  if (payload.description !== undefined && payload.description !== null) form.append("description", payload.description);
  if (payload.status !== undefined) form.append("status", typeof payload.status === "boolean" ? (payload.status ? "1" : "0") : payload.status);
  if (payload.image) form.append("image", payload.image);

  const res = await fetch(`${BASE_URL}/admin/tyres`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  return json.data as AdminTyre;
}

export async function updateAdminTyre(id: number, payload: AdminCreateTyrePayload): Promise<AdminTyre> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("brand_id", String(payload.brand_id));
  form.append("model", payload.model);
  form.append("size_id", String(payload.size_id));
  if (payload.season_id !== undefined && payload.season_id !== null) form.append("season_id", String(payload.season_id));
  if (payload.tyre_type_id !== undefined && payload.tyre_type_id !== null) form.append("tyre_type_id", String(payload.tyre_type_id));
  if (payload.fuel_efficiency_id !== undefined && payload.fuel_efficiency_id !== null) form.append("fuel_efficiency_id", String(payload.fuel_efficiency_id));
  if (payload.speed_rating_id !== undefined && payload.speed_rating_id !== null) form.append("speed_rating_id", String(payload.speed_rating_id));
  form.append("price", String(payload.price));
  form.append("stock", String(payload.stock));
  if (payload.description !== undefined && payload.description !== null) form.append("description", payload.description);
  if (payload.status !== undefined) form.append("status", typeof payload.status === "boolean" ? (payload.status ? "1" : "0") : payload.status);
  if (payload.image) form.append("image", payload.image);

  const res = await fetch(`${BASE_URL}/admin/tyres/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  return json.data as AdminTyre;
}

export async function deleteAdminTyre(id: number): Promise<void> {
  await request(`/admin/tyres/${id}`, { method: "DELETE" });
}

export async function bulkUpdateAdminTyresStatus(ids: number[], status: "active" | "inactive"): Promise<number> {
  const data = await request<{ data: { updated: number } }>("/admin/tyres/bulk-status", {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  });
  return data.data.updated;
}

export async function bulkDeleteAdminTyres(ids: number[]): Promise<number> {
  const data = await request<{ data: { deleted: number } }>("/admin/tyres/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data.deleted;
}

export async function downloadTyresTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/tyres/template?format=${format}`, `tyres-template.${ext}`);
}

export async function exportTyres(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/tyres/export?format=${format}`, `tyres-export.${ext}`);
}

export async function importTyresFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/tyres/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export async function generateTyreDescription(payload: {
  brand: string;
  model: string;
  size?: string;
  season?: string;
  tyre_type?: string;
}): Promise<string> {
  const data = await request<{ data: { description: string } }>("/admin/ai/generate-tyre-description", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data.description;
}

// ── Admin Attributes (placeholder endpoints) ────────────────────────────────

export type AdminAttributeType =
  | "brand"
  | "size"
  | "season"
  | "tyre-type"
  | "fuel-efficiency"
  | "speed-rating";

export interface AdminAttributeListResponse {
  type: AdminAttributeType;
  items: Array<Record<string, unknown>>;
}

export async function listAdminAttributes(type: AdminAttributeType): Promise<AdminAttributeListResponse> {
  const data = await request<{ data: AdminAttributeListResponse }>(`/admin/attributes/${type}`);
  return data.data;
}

export interface AdminBrand {
  id: number;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminBrandPayload {
  name: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface AdminGenerateBrandsPayload {
  country: string;
  count: 5 | 10 | 20;
}

export interface AdminGenerateBrandsResponse {
  country: string;
  count: number;
  brands: string[];
}

export async function listAdminBrands(): Promise<AdminBrand[]> {
  const data = await request<{ data: { brands: AdminBrand[] } }>("/admin/attributes/brand");
  return data.data.brands;
}

export async function createAdminBrand(payload: AdminBrandPayload): Promise<AdminBrand> {
  const data = await request<{ data: AdminBrand }>("/admin/attributes/brand", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function generateAdminBrands(payload: AdminGenerateBrandsPayload): Promise<AdminGenerateBrandsResponse> {
  const data = await request<{ data: AdminGenerateBrandsResponse }>("/admin/attributes/brand/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminBrand(id: number, payload: AdminBrandPayload): Promise<AdminBrand> {
  const data = await request<{ data: AdminBrand }>(`/admin/attributes/brand/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminBrand(id: number): Promise<void> {
  await request(`/admin/attributes/brand/${id}`, {
    method: "DELETE",
  });
}

export interface AdminBrandBulkDeleteResult {
  deleted: number;
  skipped: number;
  blocked_ids: number[];
}

export async function bulkDeleteAdminBrands(ids: number[]): Promise<AdminBrandBulkDeleteResult> {
  const data = await request<{ data: AdminBrandBulkDeleteResult }>("/admin/attributes/brand/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data;
}

export async function downloadAdminBrandTemplate(): Promise<void> {
  await downloadAdminFile("/admin/attributes/brand/template", "brands_template.xlsx");
}

export async function downloadAdminBrandExport(): Promise<void> {
  await downloadAdminFile("/admin/attributes/brand/export", "brands_export.xlsx");
}

export interface AdminBrandImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors?: string[];
}

export async function importAdminBrands(file: File): Promise<AdminBrandImportResult> {
  const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) : null;
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/brand/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as AdminBrandImportResult;
  return data;
}

export interface AdminSize {
  id: number;
  width: number;
  profile: number;
  rim: number;
  label: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminSizePayload {
  width: number;
  profile: number;
  rim: number;
  label?: string;
}

export interface AdminGenerateSizesPayload {
  country: "UK" | "Europe" | "Global";
  count: number;
  vehicle_type?: "car" | "suv" | "van";
}

export interface AdminGeneratedSize {
  width: number;
  profile: number;
  rim: number;
  label: string;
}

export interface AdminGenerateSizesResponse {
  country: string;
  count: number;
  vehicle_type: string | null;
  sizes: AdminGeneratedSize[];
}

export async function listAdminSizes(): Promise<AdminSize[]> {
  const data = await request<{ data: { sizes: AdminSize[] } }>("/admin/attributes/size");
  return data.data.sizes;
}

export async function createAdminSize(payload: AdminSizePayload): Promise<AdminSize> {
  const data = await request<{ data: AdminSize }>("/admin/attributes/size", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function generateAdminSizes(payload: AdminGenerateSizesPayload): Promise<AdminGenerateSizesResponse> {
  const data = await request<{ data: AdminGenerateSizesResponse }>("/admin/ai/generate-sizes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminSize(id: number, payload: AdminSizePayload): Promise<AdminSize> {
  const data = await request<{ data: AdminSize }>(`/admin/attributes/size/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminSize(id: number): Promise<void> {
  await request(`/admin/attributes/size/${id}`, {
    method: "DELETE",
  });
}

export async function bulkUpdateAdminSizes(
  ids: number[],
  payload: { width?: number; profile?: number; rim?: number },
): Promise<number> {
  const data = await request<{ data: { updated: number } }>("/admin/attributes/size/bulk-update", {
    method: "PATCH",
    body: JSON.stringify({ ids, ...payload }),
  });
  return data.data.updated;
}

export interface AdminSizeBulkDeleteResult {
  deleted: number;
  skipped: number;
  blocked_ids: number[];
}

export async function bulkDeleteAdminSizes(ids: number[]): Promise<AdminSizeBulkDeleteResult> {
  const data = await request<{ data: AdminSizeBulkDeleteResult }>("/admin/attributes/size/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data;
}

export async function downloadSizeTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/size/template?format=${format}`, `size-template.${ext}`);
}

export async function exportSizes(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/size/export?format=${format}`, `sizes-export.${ext}`);
}

export async function importSizesFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/size/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export type AdminSeasonStatus = "active" | "inactive";

export interface AdminSeason {
  id: number;
  name: string;
  description: string | null;
  status: AdminSeasonStatus;
  created_at: string | null;
  updated_at: string | null;
}

export type AdminTyreTypeStatus = "active" | "inactive";

export interface AdminTyreType {
  id: number;
  name: string;
  description: string | null;
  status: AdminTyreTypeStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminTyreTypePayload {
  name: string;
  description?: string | null;
  status: AdminTyreTypeStatus;
}

export type AdminFuelEfficiencyRating = "A" | "B" | "C" | "D" | "E";
export type AdminFuelEfficiencyStatus = "active" | "inactive";

export interface AdminFuelEfficiency {
  id: number;
  rating: AdminFuelEfficiencyRating;
  description: string | null;
  status: AdminFuelEfficiencyStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminFuelEfficiencyPayload {
  rating: AdminFuelEfficiencyRating;
  description?: string | null;
  status: AdminFuelEfficiencyStatus;
}

export type AdminSpeedRatingStatus = "active" | "inactive";

export interface AdminSpeedRating {
  id: number;
  rating: string;
  max_speed: number;
  description: string | null;
  status: AdminSpeedRatingStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminSpeedRatingPayload {
  rating: string;
  max_speed: number;
  description?: string | null;
  status: AdminSpeedRatingStatus;
}

export async function listAdminSpeedRatings(): Promise<AdminSpeedRating[]> {
  const data = await request<{ data: { speed_ratings: AdminSpeedRating[] } }>("/admin/attributes/speed-rating");
  return data.data.speed_ratings;
}

export async function createAdminSpeedRating(payload: AdminSpeedRatingPayload): Promise<AdminSpeedRating> {
  const data = await request<{ data: AdminSpeedRating }>("/admin/attributes/speed-rating", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminSpeedRating(id: number, payload: AdminSpeedRatingPayload): Promise<AdminSpeedRating> {
  const data = await request<{ data: AdminSpeedRating }>(`/admin/attributes/speed-rating/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminSpeedRating(id: number): Promise<void> {
  await request(`/admin/attributes/speed-rating/${id}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteAdminSpeedRatings(ids: number[]): Promise<number> {
  const data = await request<{ data: { deleted: number } }>("/admin/attributes/speed-rating/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data.deleted;
}

export async function downloadSpeedRatingTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/speed-rating/template?format=${format}`, `speed-rating-template.${ext}`);
}

export async function exportSpeedRatings(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/speed-rating/export?format=${format}`, `speed-ratings-export.${ext}`);
}

export async function importSpeedRatingsFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/speed-rating/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export async function listAdminFuelEfficiencies(): Promise<AdminFuelEfficiency[]> {
  const data = await request<{ data: { fuel_efficiencies: AdminFuelEfficiency[] } }>("/admin/attributes/fuel-efficiency");
  return data.data.fuel_efficiencies;
}

export async function createAdminFuelEfficiency(payload: AdminFuelEfficiencyPayload): Promise<AdminFuelEfficiency> {
  const data = await request<{ data: AdminFuelEfficiency }>("/admin/attributes/fuel-efficiency", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminFuelEfficiency(id: number, payload: AdminFuelEfficiencyPayload): Promise<AdminFuelEfficiency> {
  const data = await request<{ data: AdminFuelEfficiency }>(`/admin/attributes/fuel-efficiency/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminFuelEfficiency(id: number): Promise<void> {
  await request(`/admin/attributes/fuel-efficiency/${id}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteAdminFuelEfficiencies(ids: number[]): Promise<number> {
  const data = await request<{ data: { deleted: number } }>("/admin/attributes/fuel-efficiency/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data.deleted;
}

export async function downloadFuelEfficiencyTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/fuel-efficiency/template?format=${format}`, `fuel-efficiency-template.${ext}`);
}

export async function exportFuelEfficiencies(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/fuel-efficiency/export?format=${format}`, `fuel-efficiency-export.${ext}`);
}

export async function importFuelEfficienciesFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/fuel-efficiency/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export async function listAdminTyreTypes(): Promise<AdminTyreType[]> {
  const data = await request<{ data: { tyre_types: AdminTyreType[] } }>("/admin/attributes/tyre-type");
  return data.data.tyre_types;
}

export async function createAdminTyreType(payload: AdminTyreTypePayload): Promise<AdminTyreType> {
  const data = await request<{ data: AdminTyreType }>("/admin/attributes/tyre-type", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminTyreType(id: number, payload: AdminTyreTypePayload): Promise<AdminTyreType> {
  const data = await request<{ data: AdminTyreType }>(`/admin/attributes/tyre-type/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminTyreType(id: number): Promise<void> {
  await request(`/admin/attributes/tyre-type/${id}`, {
    method: "DELETE",
  });
}

export async function bulkUpdateAdminTyreTypes(ids: number[], status: AdminTyreTypeStatus): Promise<number> {
  const data = await request<{ data: { updated: number } }>("/admin/attributes/tyre-type/bulk-update", {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  });
  return data.data.updated;
}

export async function bulkDeleteAdminTyreTypes(ids: number[]): Promise<number> {
  const data = await request<{ data: { deleted: number } }>("/admin/attributes/tyre-type/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data.deleted;
}

export async function downloadTyreTypeTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/tyre-type/template?format=${format}`, `tyre-type-template.${ext}`);
}

export async function exportTyreTypes(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/tyre-type/export?format=${format}`, `tyre-types-export.${ext}`);
}

export async function importTyreTypesFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/tyre-type/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export interface AdminSeasonPayload {
  name: string;
  description?: string | null;
  status: AdminSeasonStatus;
}

export async function listAdminSeasons(): Promise<AdminSeason[]> {
  const data = await request<{ data: { seasons: AdminSeason[] } }>("/admin/attributes/season");
  return data.data.seasons;
}

export async function createAdminSeason(payload: AdminSeasonPayload): Promise<AdminSeason> {
  const data = await request<{ data: AdminSeason }>("/admin/attributes/season", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateAdminSeason(id: number, payload: AdminSeasonPayload): Promise<AdminSeason> {
  const data = await request<{ data: AdminSeason }>(`/admin/attributes/season/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteAdminSeason(id: number): Promise<void> {
  await request(`/admin/attributes/season/${id}`, {
    method: "DELETE",
  });
}

export async function bulkUpdateAdminSeasons(ids: number[], status: AdminSeasonStatus): Promise<number> {
  const data = await request<{ data: { updated: number } }>("/admin/attributes/season/bulk-update", {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  });
  return data.data.updated;
}

export async function bulkDeleteAdminSeasons(ids: number[]): Promise<number> {
  const data = await request<{ data: { deleted: number } }>("/admin/attributes/season/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
  return data.data.deleted;
}

async function downloadAdminFile(path: string, fileName: string): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "*/*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const json = parseJsonRecord(text);
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSeasonTemplate(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/season/template?format=${format}`, `season-template.${ext}`);
}

export async function exportSeasons(format: "xlsx" | "csv" = "xlsx"): Promise<void> {
  const ext = format === "xlsx" ? "xlsx" : "csv";
  await downloadAdminFile(`/admin/attributes/season/export?format=${format}`, `seasons-export.${ext}`);
}

export async function importSeasonsFile(file: File): Promise<{ created: number; updated: number; skipped: number }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/season/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);
  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as Record<string, unknown>;
  return {
    created: typeof data.created === "number" ? data.created : 0,
    updated: typeof data.updated === "number" ? data.updated : 0,
    skipped: typeof data.skipped === "number" ? data.skipped : 0,
  };
}

export async function uploadBrandLogo(file: File): Promise<string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("logo", file);

  const res = await fetch(`${BASE_URL}/admin/attributes/brand/logo`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const url = (json.data as Record<string, unknown>)?.url;
  if (typeof url !== "string") {
    throw new Error("Brand logo upload failed: unexpected response.");
  }
  return url;
}

// ── Admin Settings ───────────────────────────────────────────────────────────

export interface AdminSettings {
  brand_name: string;
  logo_url: string;
  website_title: string;
  address: string;
  contact_number: string;
  contact_email: string;
  vat_number: string;
  vat_percentage: string;
  vat_enabled: string;          // "1" | "0"
  platform_fee: string;         // fixed amount
  platform_fee_enabled: string; // "1" | "0"
  maintenance_mode: string;     // "1" | "0"
  maintenance_message: string;
  timezone: string;
  country: string;
  currency: string;
  online_payment: string;       // "1" | "0"
  cash_on_delivery: string;     // "1" | "0"
  smtp_enabled: string;         // "1" | "0"
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_email: string;
  smtp_from_name: string;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const data = await request<{ data: { settings: AdminSettings } }>(
    "/admin/settings"
  );
  return data.data.settings;
}

export async function saveAdminSettings(
  payload: AdminSettings
): Promise<AdminSettings> {
  const data = await request<{ data: { settings: AdminSettings } }>(
    "/admin/settings",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return data.data.settings;
}

/**
 * Upload a logo image file. Returns the public URL stored by the backend.
 * Uses multipart/form-data — no Content-Type override needed (browser sets boundary).
 */
export async function uploadAdminLogo(file: File): Promise<string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;

  const form = new FormData();
  form.append("logo", file);

  const res = await fetch(`${BASE_URL}/admin/settings/logo`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const url = (json.data as Record<string, unknown>)?.url;
  if (typeof url !== "string") {
    throw new Error("Logo upload failed: unexpected response.");
  }
  return url;
}
