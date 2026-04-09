import { NextResponse } from "next/server";

function messageFromJson(v: unknown): string | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const msg = (v as Record<string, unknown>).message;
  return typeof msg === "string" && msg.trim() ? msg.trim() : null;
}

export async function GET() {
  try {
    const backendUrl = process.env.LARAVEL_PROXY_TARGET
      ? `${process.env.LARAVEL_PROXY_TARGET}/api`
      : "http://127.0.0.1:8000/api";

    const response = await fetch(`${backendUrl}/public/checkout-config`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: messageFromJson(data) ?? "Failed to load checkout config" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Backend fetch error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to process request to backend.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

