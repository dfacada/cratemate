import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SC_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

interface SCTrack {
  id: number;
  title: string;
  permalink_url: string;
  artwork_url: string | null;
  duration: number;
  user: { username: string; permalink_url: string };
  streamable: boolean;
  access: string;
}

function matchScore(track: SCTrack, artist: string, title: string): number {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const tTitle  = n(track.title);
  const tArtist = n(track.user?.username || "");
  const wTitle  = n(title);
  const wArtist = n(artist);
  let score = 0;
  if (tTitle === wTitle) score += 50;
  else if (tTitle.includes(wTitle)) score += 30;
  else if (wTitle.split(" ").every(w => tTitle.includes(w))) score += 20;
  if (tArtist === wArtist) score += 40;
  else if (tArtist.includes(wArtist) || wArtist.includes(tArtist)) score += 25;
  else {
    const words = wArtist.split(" ").filter(w => w.length > 2);
    const hits  = words.filter(w => tArtist.includes(w));
    score += (hits.length / Math.max(words.length, 1)) * 20;
  }
  if (!track.streamable || track.access === "blocked") score -= 30;
  return score;
}

export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get("artist") || "";
  const title  = req.nextUrl.searchParams.get("title")  || "";

  if (!SC_CLIENT_ID) {
    return NextResponse.json({ error: "SOUNDCLOUD_CLIENT_ID not configured", setup: true }, { status: 503 });
  }

  try {
    const q   = encodeURIComponent(`${artist} ${title}`.trim());
    const url = `https://api-v2.soundcloud.com/search/tracks?q=${q}&limit=10&client_id=${SC_CLIENT_ID}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json({ error: `SoundCloud API ${res.status}`, detail: body.slice(0, 200) }, { status: 502 });
    }
    const data = await res.json();
    const tracks: SCTrack[] = data?.collection || [];
    if (!tracks.length) return NextResponse.json({ error: "No results on SoundCloud" }, { status: 404 });

    const scored = tracks
      .map(t => ({ track: t, score: matchScore(t, artist, title) }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0].track;

    return NextResponse.json({
      id:            best.id,
      title:         best.title,
      artist:        best.user?.username,
      permalink_url: best.permalink_url,
      artwork_url:   best.artwork_url?.replace("large", "t500x500") || null,
      duration_ms:   best.duration,
      streamable:    best.streamable,
      score:         scored[0].score,
      candidates:    scored.slice(0, 3).map(s => ({
        title:  s.track.title,
        artist: s.track.user?.username,
        url:    s.track.permalink_url,
        score:  s.score,
      })),
    }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
