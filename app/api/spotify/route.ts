import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function getSpotifyToken(): Promise<string> {
  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("SPOTIFY_NOT_CONFIGURED");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("SPOTIFY_AUTH_FAILED");
  const data = await res.json();
  return data.access_token;
}

function extractPlaylistId(url: string): string | null {
  const m = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return m?.[1] ?? null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  const playlistId = extractPlaylistId(url);
  if (!playlistId) return NextResponse.json({ error: "Invalid Spotify playlist URL" }, { status: 400 });

  let token: string;
  try {
    token = await getSpotifyToken();
  } catch (e: any) {
    if (e.message === "SPOTIFY_NOT_CONFIGURED") {
      return NextResponse.json({ error: "SPOTIFY_NOT_CONFIGURED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Spotify auth failed" }, { status: 502 });
  }

  // Fetch playlist metadata
  const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,tracks.total,images`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!playlistRes.ok) return NextResponse.json({ error: "Playlist not found or private" }, { status: 404 });
  const playlist = await playlistRes.json();

  // Fetch all tracks (paginated, max 500)
  const tracks: any[] = [];
  let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=next,items(track(name,artists,album(name,release_date)))`;

  while (nextUrl && tracks.length < 500) {
    const r: Response = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) break;
    const page: any = await r.json();
    const items = (page.items || [])
      .filter((i: any) => i?.track?.name)
      .map((i: any) => ({
        artist: i.track.artists?.map((a: any) => a.name).join(", ") || "Unknown",
        title:  i.track.name,
        label:  i.track.album?.name || "",
        year:   i.track.album?.release_date ? parseInt(i.track.album.release_date) : undefined,
      }));
    tracks.push(...items);
    nextUrl = page.next || null;
  }

  return NextResponse.json({
    id:    playlistId,
    name:  playlist.name,
    image: playlist.images?.[0]?.url,
    total: playlist.tracks?.total,
    tracks,
  });
}
