import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.LARAVEL_PROXY_TARGET
      ? `${process.env.LARAVEL_PROXY_TARGET}/api`
      : "http://127.0.0.1:8000/api";

    const qs = request.nextUrl.searchParams.toString();
    const url = qs ? `${backendUrl}/public/slots/occupancy?${qs}` : `${backendUrl}/public/slots/occupancy`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to load slot occupancy" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend fetch error:", error);
    return NextResponse.json(
      { error: "Failed to process request to backend. Check console logs." },
      { status: 500 }
    );
  }
}
