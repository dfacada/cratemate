import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Server-side SoundCloud playlist resolver.
 * Fetches the SC page HTML and extracts track data from the
 * __sc_hydration JSON blob embedded in the page.
 * This bypasses the Widget API's 5-track limit on getSounds().
 */

interface SCHydrationTrack {
  title?: string;
  user?: { username?: string; permalink?: string };
  publisher_metadata?: { artist?: string; release_title?: string };
  label_name?: string;
  created_at?: string;
  bpm?: number;
  duration?: number;
  permalink_url?: string;
  id?: number;
}

interface SCHydrationPlaylist {
  title?: string;
  tracks?: SCHydrationTrack[];
  track_count?: number;
}

interface ResolvedTrack {
  artist: string;
  title: string;
  label?: string;
  year?: number;
  bpm?: number;
  duration?: number;
  soundcloud_url?: string;
}

function parseTrack(s: SCHydrationTrack): ResolvedTrack | null {
  const rawTitle = s.title || "";
  const rawUser = s.user?.username || "";
  const pubArtist = s.publisher_metadata?.artist || "";

  // SC titles are often "Artist - Title" or "Artist — Title"
  const dashMatch = rawTitle.match(/^(.+?)\s[-–—]\s(.+)$/);

  let artist: string;
  let title: string;

  if (dashMatch) {
    artist = dashMatch[1].trim();
    title = dashMatch[2].trim();
  } else if (pubArtist) {
    artist = pubArtist;
    title = rawTitle;
  } else {
    artist = rawUser || "Unknown";
    title = rawTitle || "Unknown";
  }

  // Skip tracks where both artist and title are unknown
  if (artist === "Unknown" && title === "Unknown") return null;

  return {
    artist,
    title,
    label: s.label_name || s.publisher_metadata?.release_title || undefined,
    year: s.created_at ? new Date(s.created_at).getFullYear() : undefined,
    bpm: s.bpm || undefined,
    duration: s.duration ? Math.round(s.duration / 1000) : undefined,
    soundcloud_url: s.permalink_url || undefined,
  };
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !/soundcloud\.com\/.+/.test(url)) {
    return NextResponse.json(
      { error: "Please provide a valid SoundCloud URL" },
      { status: 400 }
    );
  }

  try {
    // Fetch the SoundCloud page with a browser-like user agent
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `SoundCloud returned ${res.status}. Check the URL and try again.` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extract __sc_hydration data from the page
    const hydrationMatch = html.match(
      /window\.__sc_hydration\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/
    );

    if (!hydrationMatch) {
      return NextResponse.json(
        { error: "Could not extract playlist data from SoundCloud page. The URL may not be a public playlist." },
        { status: 422 }
      );
    }

    let hydration: any[];
    try {
      hydration = JSON.parse(hydrationMatch[1]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse SoundCloud page data." },
        { status: 422 }
      );
    }

    // Find the playlist/set object in the hydration data
    // It's typically in a hydratable with "playlist" or "systemPlaylist" type
    let playlist: SCHydrationPlaylist | null = null;

    for (const item of hydration) {
      const data = item?.data;
      if (!data) continue;

      // Direct playlist object (has tracks array and track_count)
      if (Array.isArray(data.tracks) && typeof data.track_count === "number") {
        playlist = data;
        break;
      }

      // Sometimes nested under a different structure
      if (data.playlist && Array.isArray(data.playlist.tracks)) {
        playlist = data.playlist;
        break;
      }
    }

    if (!playlist || !playlist.tracks?.length) {
      // Fallback: maybe this is a single track page, not a playlist
      // Look for a single sound object
      for (const item of hydration) {
        const data = item?.data;
        if (data?.title && data?.user && data?.permalink_url && !data?.tracks) {
          // Single track
          const track = parseTrack(data);
          if (track) {
            return NextResponse.json({
              playlistName: data.title || "SoundCloud Track",
              tracks: [track],
              trackCount: 1,
            });
          }
        }
      }

      return NextResponse.json(
        { error: "No tracks found. The playlist may be private or the URL may not be a playlist/set." },
        { status: 404 }
      );
    }

    // SC hydration includes full data for the first ~5 tracks.
    // The rest are stub objects with just {id: number}.
    // We need to resolve those stubs via the SC API.
    const fullTracks: SCHydrationTrack[] = [];
    const stubIds: number[] = [];

    for (const t of playlist.tracks) {
      if ((t as any).title || (t as any).user || (t as any).publisher_metadata) {
        fullTracks.push(t);
      } else if ((t as any).id && typeof (t as any).id === "number") {
        stubIds.push((t as any).id);
      }
    }

    // If there are stub tracks, try to resolve them via the SC API
    if (stubIds.length > 0) {
      // Extract client_id from the page scripts
      const clientIdMatch = html.match(/client_id=([a-zA-Z0-9]{32})/);
      const clientId = clientIdMatch?.[1];

      if (clientId) {
        // SC API accepts up to 50 IDs at once
        const batchSize = 50;
        for (let i = 0; i < stubIds.length; i += batchSize) {
          const batch = stubIds.slice(i, i + batchSize);
          try {
            const apiRes = await fetch(
              `https://api-v2.soundcloud.com/tracks?ids=${batch.join(",")}&client_id=${clientId}`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                  Accept: "application/json",
                },
                signal: AbortSignal.timeout(10000),
              }
            );
            if (apiRes.ok) {
              const resolved: SCHydrationTrack[] = await apiRes.json();
              fullTracks.push(...resolved);
            }
          } catch (err) {
            console.warn("Failed to resolve stub tracks batch:", err);
          }
        }
      } else {
        console.warn(`Could not extract SC client_id; ${stubIds.length} tracks remain unresolved`);
      }
    }

    const tracks: ResolvedTrack[] = fullTracks
      .map(parseTrack)
      .filter((t): t is ResolvedTrack => t !== null);

    const unresolvedCount = (playlist.track_count || 0) - tracks.length;

    return NextResponse.json({
      playlistName: playlist.title || "SoundCloud Playlist",
      tracks,
      trackCount: playlist.track_count || tracks.length,
      partialTracks: unresolvedCount > 0 ? unresolvedCount : undefined,
    });
  } catch (err: any) {
    console.error("SC resolve error:", err);
    return NextResponse.json(
      { error: "Failed to fetch SoundCloud playlist. Please try again." },
      { status: 500 }
    );
  }
}
