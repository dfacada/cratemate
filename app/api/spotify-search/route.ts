/**
 * Spotify track search API route
 * GET /api/spotify-search?artist=...&title=... or ?q=...
 *
 * Returns SpotifyTrackResult with embed URL, or 404 if not found
 */

import { NextRequest, NextResponse } from "next/server";
import { searchSpotifyTrack, SpotifyTrackResult } from "@/lib/spotify";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get("artist");
  const title = req.nextUrl.searchParams.get("title");
  const q = req.nextUrl.searchParams.get("q");

  // Validate that either (artist + title) or q is provided
  if (!artist || !title) {
    if (!q) {
      return NextResponse.json(
        { error: "Missing query params: provide artist+title or q" },
        { status: 400 }
      );
    }
    // If only q is provided, split it
    // This is a fallback; ideally caller provides artist+title
  }

  // Check if Spotify is configured
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "SPOTIFY_NOT_CONFIGURED",
        message:
          "Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in environment.",
      },
      { status: 503 }
    );
  }

  try {
    let result: SpotifyTrackResult | null = null;

    if (artist && title) {
      result = await searchSpotifyTrack(artist, title);
    } else if (q) {
      // Simple split on " - " or last space
      const parts = q.includes(" - ") ? q.split(" - ") : q.split(" ");
      const searchArtist = parts[0]?.trim() || "";
      const searchTitle =
        parts.length > 1 ? parts.slice(1).join(" ").trim() : q;
      result = await searchSpotifyTrack(searchArtist, searchTitle);
    }

    if (!result) {
      return NextResponse.json(
        { error: "Track not found on Spotify" },
        { status: 404 }
      );
    }

    // Cache for 24 hours (public cache)
    const headers = {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": "application/json",
    };

    return NextResponse.json(result, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Spotify search route error:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
