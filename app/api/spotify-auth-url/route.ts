import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 5;

/**
 * GET /api/spotify-auth-url
 *
 * Returns the Spotify OAuth authorization URL.
 * This endpoint exists because the client-side getSpotifyAuthUrl()
 * cannot access server-side env vars (SPOTIFY_CLIENT_ID).
 *
 * Response: { authUrl: string }
 */
export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "SPOTIFY_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    // Get the app base URL from request headers or fallback
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const appUrl = `${protocol}://${host}`;

    const redirectUri = `${appUrl}/auth/spotify/callback`;

    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params}`;

    return NextResponse.json({ authUrl });
  } catch (err: any) {
    console.error("Spotify auth URL route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
