import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  // Only proxy Deezer CDN URLs
  if (!url.startsWith("https://cdns-preview") && !url.includes("dzcdn.net")) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "Range": req.headers.get("range") || "bytes=0-",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const headers = new Headers({
      "Content-Type": upstream.headers.get("Content-Type") || "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    });

    const cl = upstream.headers.get("Content-Length");
    const cr = upstream.headers.get("Content-Range");
    if (cl) headers.set("Content-Length", cl);
    if (cr) headers.set("Content-Range", cr);

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
