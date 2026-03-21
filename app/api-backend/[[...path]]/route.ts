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
  return (process.env.LARAVEL_PROXY_TARGET ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
}

function destination(req: NextRequest, segments: string[]): string {
  const tail = segments.length ? segments.join("/") : "";
  const qs = req.nextUrl.search;
  return `${laravelOrigin()}/api/${tail}${qs}`;
}

function forwardHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) {
      return;
    }
    out.set(key, value);
  });
  return out;
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path: segments = [] } = await ctx.params;
  const dest = destination(req, segments);
  const hasBody = !["GET", "HEAD"].includes(req.method);

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers: forwardHeaders(req),
  };
  if (hasBody && req.body) {
    init.body = req.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(dest, init);
  } catch {
    return NextResponse.json(
      {
        message: "Unable to connect to the backend server. Please try again later or contact support.",
      },
      { status: 502 },
    );
  }

  // Node may decompress the body but leave `Content-Encoding: gzip` on headers; browsers then
  // mis-decode and `fetch`/`response.json()` can fail with "Failed to fetch".
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
