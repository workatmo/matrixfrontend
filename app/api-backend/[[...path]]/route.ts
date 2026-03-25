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
      { status: 500 }
    );
  }

  const { path } = await ctx.params;
  const targetUrl = targetFromRequest(req, targetBase, path ?? []);

  const headers = new Headers(req.headers);
  headers.delete("host");

  const method = req.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers(upstream.headers);
  // Avoid leaking upstream compression headers; Next will handle encoding.
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");

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
