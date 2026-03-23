import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function laravelOrigin(): string {
  return (process.env.LARAVEL_PROXY_TARGET ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}

function destination(req: NextRequest, segments: string[]): string {
  const tail = segments.length ? `/${segments.join("/")}` : "";
  const qs = req.nextUrl.search;
  return `${laravelOrigin()}${tail}${qs}`;
}

function forwardHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }): Promise<Response> {
  const { path: segments = [] } = await ctx.params;
  const dest = destination(req, segments);

  let upstream: Response;
  try {
    upstream = await fetch(dest, {
      method: req.method,
      headers: forwardHeaders(req),
    });
  } catch {
    return NextResponse.json({ message: "Unable to fetch asset from backend." }, { status: 502 });
  }

  const headers = new Headers(upstream.headers);
  // Node/undici may auto-decompress some responses. For JSON/text this previously caused
  // incorrect browser decoding; for binary assets (images/PDF) we should preserve headers.
  const contentType = upstream.headers.get("content-type") ?? "";
  const isTextLike =
    contentType.startsWith("application/json") ||
    contentType.startsWith("text/") ||
    contentType.includes("json");
  if (isTextLike) {
    headers.delete("content-encoding");
    headers.delete("content-length");
    headers.delete("transfer-encoding");
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export const GET = proxy;
export const HEAD = proxy;

