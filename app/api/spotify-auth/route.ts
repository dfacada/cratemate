import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * POST /api/spotify-auth
 *
 * Handles two flows:
 * 1. Authorization Code Exchange: { code, redirectUri }
 *    - Exchanges auth code for access token + refresh token
 * 2. Token Refresh: { refreshToken }
 *    - Refreshes an expired access token
 *
 * Both return: { accessToken, refreshToken, expiresIn }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, redirectUri, refreshToken } = body;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "SPOTIFY_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    // ── Authorization Code Exchange ──────────────────────────────────
    if (code && redirectUri) {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!tokenRes.ok) {
        const error = await tokenRes.text();
        console.error("Spotify token exchange failed:", error);
        return NextResponse.json(
          { error: "Token exchange failed" },
          { status: 400 }
        );
      }

      const tokenData = await tokenRes.json();

      return NextResponse.json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in || 3600,
      });
    }

    // ── Token Refresh ───────────────────────────────────────────────
    if (refreshToken) {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!tokenRes.ok) {
        const error = await tokenRes.text();
        console.error("Spotify token refresh failed:", error);
        return NextResponse.json(
          { error: "Token refresh failed" },
          { status: 401 }
        );
      }

      const tokenData = await tokenRes.json();

      return NextResponse.json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken,
        expiresIn: tokenData.expires_in || 3600,
      });
    }

    return NextResponse.json(
      { error: "Invalid request: missing code/redirectUri or refreshToken" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Spotify auth route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
