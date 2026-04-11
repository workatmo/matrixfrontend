import { apiBaseUrl } from "@/lib/config";

const BASE_URL = apiBaseUrl;

export const CUSTOMER_TOKEN_STORAGE_KEY = "matrix_customer_token";

export interface CustomerUserPayload {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  vehicle_registration_number: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  role: { id: number; name: string } | null;
}

export interface CustomerOrderSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface CustomerOrder {
  id: number;
  status: string;
  amount: string;
  payment_provider: string | null;
  payment_status: string | null;
  paid_at: string | null;
  stripe_mode: string | null;
  fitting_date: string | null;
  vehicle_registration: string | null;
  vehicle_make: string;
  vehicle_model: string;
  service_type: string;
  tyre_brand: string;
  tyre_model: string;
  tyre_size: string;
  tyre_quantity: number;
  customer_comment: string | null;
  created_at: string | null;
  updated_at: string | null;
  slot: CustomerOrderSlot | null;
}

function parseJsonRecord(text: string): Record<string, unknown> {
  if (!text.trim()) {
    return {};
  }
  try {
    const v = JSON.parse(text) as unknown;
    return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
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
    return "Session expired or invalid. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission for this action.";
  }
  if (status === 404) {
    return "Resource not found.";
  }
  if (status === 422) {
    return "Validation error from the API.";
  }
  if (status >= 500) {
    return "Server error from the API.";
  }
  const trimmed = text.trim();
  if (trimmed.startsWith("<")) {
    return `The API returned HTML instead of JSON (HTTP ${status}).`;
  }
  if (trimmed.length > 0 && trimmed.length <= 280) {
    return trimmed;
  }
  return `Request failed (HTTP ${status}).`;
}

export async function customerRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY) : null;

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
      ? " Ensure the dev server is running and LARAVEL_PROXY_TARGET is set."
      : " Check that the API is reachable.";
    if (isLikelyFetchNetworkError(e)) {
      throw new Error(`Cannot reach the API at ${url}.${hint}`);
    }
    throw e;
  }

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
      window.location.assign("/account/login");
    }
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  return json as T;
}

export async function customerLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: CustomerUserPayload }> {
  const url = `${BASE_URL}/customer/login`;
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
      throw new Error(`Cannot reach the API at ${url}.${BASE_URL.startsWith("/") ? " Check LARAVEL_PROXY_TARGET." : ""}`);
    }
    throw e;
  }

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as { token?: string; user?: CustomerUserPayload } | undefined;
  const token = data?.token;
  const user = data?.user;
  if (!token || !user) {
    throw new Error("Unexpected login response from the API.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, token);
  }

  return { token, user };
}

export type CustomerRegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export async function customerRegister(
  payload: CustomerRegisterPayload,
): Promise<{ token: string; user: CustomerUserPayload }> {
  const url = `${BASE_URL}/customer/register`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (isLikelyFetchNetworkError(e)) {
      throw new Error(`Cannot reach the API at ${url}.${BASE_URL.startsWith("/") ? " Check LARAVEL_PROXY_TARGET." : ""}`);
    }
    throw e;
  }

  const text = await res.text();
  const json = parseJsonRecord(text);

  if (!res.ok) {
    const fromApi = messageFromApiPayload(json);
    throw new Error(fromApi ?? describeHttpFailure(res.status, text));
  }

  const data = json.data as { token?: string; user?: CustomerUserPayload } | undefined;
  const token = data?.token;
  const user = data?.user;
  if (!token || !user) {
    throw new Error("Unexpected registration response from the API.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, token);
  }

  return { token, user };
}

export async function customerLogout(): Promise<void> {
  try {
    await customerRequest("/customer/logout", { method: "POST" });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
    }
  }
}

export async function fetchCustomerMe(): Promise<CustomerUserPayload> {
  const data = await customerRequest<{ data: { user: CustomerUserPayload } }>("/customer/me");
  return data.data.user;
}

export type CustomerProfileUpdatePayload = {
  name: string;
  email: string;
  phone?: string | null;
  vehicle_registration_number?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
};

export async function updateCustomerProfile(payload: CustomerProfileUpdatePayload): Promise<CustomerUserPayload> {
  const data = await customerRequest<{ data: { user: CustomerUserPayload } }>("/customer/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data.user;
}

export async function fetchCustomerOrders(payment: "all" | "paid" | "unpaid" = "all"): Promise<CustomerOrder[]> {
  const q = payment === "all" ? "" : `?payment=${payment}`;
  const data = await customerRequest<{ data: { orders: CustomerOrder[] } }>(`/customer/orders${q}`);
  return data.data.orders;
}

export async function updateCustomerPassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await customerRequest("/customer/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY);
}
