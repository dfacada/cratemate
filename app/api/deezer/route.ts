import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  artist: { name: string };
  album: { title: string; cover_medium: string };
  duration: number;
  preview: string;
  link: string;
  rank: number;
}

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/\(.*?\)/g, "")      // strip parenthetical (Radio Edit), (Original Mix), etc
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchScore(track: DeezerTrack, targetArtist: string, targetTitle: string): number {
  const tTitle  = normalize(track.title);
  const tArtist = normalize(track.artist?.name || "");
  const wTitle  = normalize(targetTitle);
  const wArtist = normalize(targetArtist);

  let score = 0;

  // ── Title scoring ───────────────────────────────────────
  if (tTitle === wTitle)                              score += 60;
  else if (tTitle.startsWith(wTitle))                 score += 45;
  else if (tTitle.includes(wTitle))                   score += 35;
  else {
    const words = wTitle.split(" ").filter(w => w.length > 2);
    const hits  = words.filter(w => tTitle.includes(w));
    score += (hits.length / Math.max(words.length, 1)) * 25;
  }

  // ── Artist scoring ─────────────────────────────────────
  if (tArtist === wArtist)                            score += 40;
  else if (tArtist.includes(wArtist) || wArtist.includes(tArtist)) score += 30;
  else {
    const words = wArtist.split(" ").filter(w => w.length > 2);
    const hits  = words.filter(w => tArtist.includes(w));
    score += (hits.length / Math.max(words.length, 1)) * 22;
  }

  // Penalty: no preview
  if (!track.preview) score -= 50;

  return score;
}

function extractDeezerPlaylistId(url: string): string | null {
  const m = url.match(/deezer\.com\/(?:\w+\/)?playlist\/(\d+)/);
  return m?.[1] ?? null;
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url") || "";

  // ── Playlist import mode ─────────────────────────────────────────────
  const playlistId = urlParam ? extractDeezerPlaylistId(urlParam) : null;
  if (urlParam && playlistId) {
    try {
      const res = await fetch(`https://api.deezer.com/playlist/${playlistId}`, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return NextResponse.json({ error: "Deezer playlist not found" }, { status: 404 });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message || "Deezer error" }, { status: 404 });

      const tracks = (data.tracks?.data || []).map((t: any) => ({
        artist: t.artist?.name || "Unknown",
        title:  t.title || "Unknown",
        label:  t.album?.title || "",
        year:   undefined,
        bpm:    t.bpm || undefined,
      }));

      return NextResponse.json({
        id:     playlistId,
        name:   data.title || "Deezer Playlist",
        image:  data.picture_medium,
        total:  data.nb_tracks,
        tracks,
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to fetch Deezer playlist" }, { status: 500 });
    }
  }

  if (urlParam) {
    return NextResponse.json({ error: "Invalid Deezer playlist URL" }, { status: 400 });
  }

  // ── Single track search mode ─────────────────────────────────────────
  const artist = req.nextUrl.searchParams.get("artist") || "";
  const title  = req.nextUrl.searchParams.get("title")  || "";

  const q = req.nextUrl.searchParams.get("q") || `${artist} ${title}`.trim();
  if (!q) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=15`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Deezer ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const tracks: DeezerTrack[] = data?.data || [];

    if (!tracks.length) {
      return NextResponse.json({ error: "No results from Deezer" }, { status: 404 });
    }

    // Score all and pick best
    const scored = tracks
      .map(t => ({ track: t, score: matchScore(t, artist, title) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0].track;

    if (!best.preview) {
      return NextResponse.json({ error: "No previewable track found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id:       best.id,
        title:    best.title,
        artist:   best.artist?.name,
        album:    best.album?.title,
        cover:    best.album?.cover_medium,
        preview:  best.preview,
        duration: best.duration,
        link:     best.link,
        score:    scored[0].score,
        // Top 3 alternatives for debugging / wrong-match UI
        candidates: scored.slice(0, 3).map(s => ({
          id:     s.track.id,
          title:  s.track.title,
          artist: s.track.artist?.name,
          score:  Math.round(s.score),
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
