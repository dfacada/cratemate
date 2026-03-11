import { NextRequest, NextResponse } from "next/server";

// nodejs runtime — more reliable than edge for external fetches
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
      // 8 second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Deezer returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    if (!data?.data?.length) {
      return NextResponse.json({ error: "No results from Deezer" }, { status: 404 });
    }

    // Find best match with a preview
    const track = data.data.find((t: any) => t.preview && t.preview.length > 0);
    if (!track) {
      return NextResponse.json({ error: "No tracks with preview found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: track.id,
        title: track.title,
        artist: track.artist?.name,
        album: track.album?.title,
        cover: track.album?.cover_medium,
        preview: track.preview,   // direct Deezer CDN MP3 URL — play this directly
        duration: track.duration,
        link: track.link,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600",
        },
      }
    );
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
