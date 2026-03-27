import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const backendUrl = process.env.LARAVEL_PROXY_TARGET 
      ? `${process.env.LARAVEL_PROXY_TARGET}/api` 
      : "http://127.0.0.1:8000/api";
    
    const response = await fetch(`${backendUrl}/public/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(
            { message: data.message || "Failed to process checkout" },
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Backend fetch error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process request to backend.";
    return NextResponse.json(
      { message: msg },
      { status: 500 }
    );
  }
}
