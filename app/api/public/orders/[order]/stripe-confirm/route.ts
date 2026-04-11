import { NextResponse } from "next/server";

function messageFromJson(v: unknown): string | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const msg = (v as Record<string, unknown>).message;
  return typeof msg === "string" && msg.trim() ? msg.trim() : null;
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ order: string }> },
) {
  try {
    const payload = await request.json().catch(() => ({}));
    const { order } = await ctx.params;

    const backendUrl = process.env.LARAVEL_PROXY_TARGET
      ? `${process.env.LARAVEL_PROXY_TARGET}/api`
      : "http://127.0.0.1:8000/api";

    const response = await fetch(`${backendUrl}/public/orders/${order}/stripe-confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { message: messageFromJson(data) ?? "Failed to confirm Stripe payment" },
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
