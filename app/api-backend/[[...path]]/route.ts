import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function targetFromRequest(req: NextRequest, targetBase: string, pathParts: string[]) {
  const base = targetBase.replace(/\/$/, "");
  const suffix = pathParts.filter(Boolean).join("/");
  const incoming = new URL(req.url);
  const target = new URL(`${base}/api/${suffix}`);
  target.search = incoming.search;
  return target;
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const targetBase = process.env.LARAVEL_PROXY_TARGET;
  if (!targetBase) {
    return NextResponse.json(
      { message: "Missing LARAVEL_PROXY_TARGET in matrixfrontend/.env" },
      { status: 500 },
    );
  }

  const { path } = await ctx.params;
  const targetUrl = targetFromRequest(req, targetBase, path ?? []);

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  // Laravel decides whether to return JSON vs redirect based on "Accept".
  // Force JSON so API middleware returns 401/403 instead of HTML redirects.
  headers.set("accept", "application/json");

  const method = req.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to reach Laravel API.",
        target: targetBase,
        detail: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 502 },
    );
  }

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");
  resHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
