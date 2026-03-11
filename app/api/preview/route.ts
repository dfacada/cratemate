import { NextRequest, NextResponse } from "next/server";

// Proxies Deezer 30-sec MP3 preview to the browser.
// Necessary because Deezer's CDN preview URLs have had inconsistent
// CORS headers — serving through our own route guarantees playback.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  // Only allow Deezer CDN preview URLs — prevent this route being used as an open proxy
  if (!url || !/^https:\/\/cdn-preview[^.]*\.deezer\.com\//.test(url)) {
    return NextResponse.json({ error: "Invalid or missing preview URL" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "CrateMate/1.0" },
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }

    const audioBuffer = await upstream.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
