import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=5`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) throw new Error(`Deezer ${res.status}`);
    const data = await res.json();

    // Find best match that has a preview URL
    const track = data?.data?.find((t: any) => t.preview);
    if (!track) {
      return NextResponse.json({ error: "No preview found" }, { status: 404 });
    }

    return NextResponse.json({
      id: track.id,
      title: track.title,
      artist: track.artist?.name,
      album: track.album?.title,
      cover: track.album?.cover_medium,
      preview: track.preview, // 30s MP3 URL
      duration: track.duration,
      link: track.link,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
