/**
 * Spotify API helpers for track search, batch operations, embed generation,
 * OAuth authentication, and Web Playback SDK integration.
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

/**
 * User-authenticated Spotify tokens (for Web Playback SDK and user context)
 */
export interface SpotifyTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls?: { spotify?: string };
}

export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date?: string;
}

export interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  uri: string;
  popularity: number;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyApiTrack[];
    total: number;
    next?: string;
  };
}

export interface SpotifyTrackResult {
  spotifyId: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumArt: {
    small: string;
    medium: string;
    large: string;
  };
  duration: number; // milliseconds
  previewUrl: string | null;
  spotifyUri: string; // spotify:track:xxxxx
  embedUrl: string; // for iframe embed
  popularity: number; // 0-100
}

export interface TrackInput {
  artist: string;
  title: string;
}

// ────────────────────────────────────────────────────────────────
// Token Management
// ────────────────────────────────────────────────────────────────

interface TokenCache {
  access_token: string;
  expires_at: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Get a valid Spotify access token using Client Credentials flow.
 * Cached in-memory with expiry tracking.
 *
 * @throws Error if SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not configured
 */
export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_NOT_CONFIGURED");
  }

  // Return cached token if still valid
  if (tokenCache && tokenCache.expires_at > Date.now()) {
    return tokenCache.access_token;
  }

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      throw new Error("SPOTIFY_AUTH_FAILED");
    }

    const data = await res.json();
    const expiresIn = data.expires_in || 3600; // default 1 hour

    tokenCache = {
      access_token: data.access_token,
      expires_at: Date.now() + expiresIn * 1000,
    };

    return tokenCache.access_token;
  } catch (err: any) {
    console.error("Spotify token fetch error:", err.message);
    throw new Error("SPOTIFY_AUTH_FAILED");
  }
}

// ────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────

/**
 * Normalize string for comparison: lowercase, strip parens, remove special chars
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // strip parenthetical (Radio Edit), (Original Mix), etc
    .replace(/[^a-z0-9 ]/g, "") // remove special chars
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/**
 * Score a track match based on title and artist similarity.
 * Returns a score 0-100+ indicating likelihood of match.
 */
function matchScore(
  track: SpotifyApiTrack,
  targetArtist: string,
  targetTitle: string
): number {
  const tTitle = normalize(track.name);
  const tArtist = normalize(
    track.artists?.map((a) => a.name).join(", ") || ""
  );
  const wTitle = normalize(targetTitle);
  const wArtist = normalize(targetArtist);

  let score = 0;

  // ── Title scoring ───────────────────────────────────────
  if (tTitle === wTitle) score += 60;
  else if (tTitle.startsWith(wTitle)) score += 45;
  else if (tTitle.includes(wTitle)) score += 35;
  else {
    const words = wTitle.split(" ").filter((w) => w.length > 2);
    const hits = words.filter((w) => tTitle.includes(w));
    score += (hits.length / Math.max(words.length, 1)) * 25;
  }

  // ── Artist scoring ─────────────────────────────────────
  if (tArtist === wArtist) score += 40;
  else if (tArtist.includes(wArtist) || wArtist.includes(tArtist))
    score += 30;
  else {
    const words = wArtist.split(" ").filter((w) => w.length > 2);
    const hits = words.filter((w) => tArtist.includes(w));
    score += (hits.length / Math.max(words.length, 1)) * 22;
  }

  // Bonus: higher popularity is better
  score += track.popularity / 10;

  return score;
}

/**
 * Extract best album art URL from Spotify image array.
 * Spotify returns images ordered by size (typically largest first).
 */
function extractAlbumArt(images: SpotifyImage[]): {
  small: string;
  medium: string;
  large: string;
} {
  const fallback = "https://via.placeholder.com/64?text=No+Cover";

  if (!images || !images.length) {
    return { small: fallback, medium: fallback, large: fallback };
  }

  // Spotify returns images ordered by size (largest first)
  return {
    large: images[0]?.url || fallback,
    medium: images[1]?.url || images[0]?.url || fallback,
    small: images[2]?.url || images[1]?.url || images[0]?.url || fallback,
  };
}

// ────────────────────────────────────────────────────────────────
// Single Track Search
// ────────────────────────────────────────────────────────────────

/**
 * Search Spotify for a single track by artist and title.
 * Returns the best match, or null if not found.
 *
 * @param artist - Artist name
 * @param title - Track title
 * @returns SpotifyTrackResult or null if no match found
 */
export async function searchSpotifyTrack(
  artist: string,
  title: string
): Promise<SpotifyTrackResult | null> {
  let token: string;
  try {
    token = await getSpotifyToken();
  } catch (err: any) {
    console.error("Failed to get Spotify token:", err.message);
    return null;
  }

  try {
    // Build query using Spotify's search syntax
    const query = `artist:${artist} track:${title}`;
    const url = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=10`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`Spotify search error: ${res.status}`);
      return null;
    }

    const data: SpotifySearchResponse = await res.json();
    const tracks: SpotifyApiTrack[] = data?.tracks?.items || [];

    if (!tracks.length) {
      return null;
    }

    // Score all and pick best
    const scored = tracks
      .map((t) => ({ track: t, score: matchScore(t, artist, title) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0].track;

    const albumArt = extractAlbumArt(best.album.images);

    return {
      spotifyId: best.id,
      title: best.name,
      artist: best.artists?.map((a) => a.name).join(", ") || "Unknown",
      artistId: best.artists?.[0]?.id || "",
      album: best.album?.name || "Unknown",
      albumArt,
      duration: best.duration_ms,
      previewUrl: best.preview_url,
      spotifyUri: best.uri,
      embedUrl: getSpotifyEmbedUrl(best.id),
      popularity: best.popularity,
    };
  } catch (err: any) {
    console.error("Spotify search error:", err.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────
// Batch Track Search
// ────────────────────────────────────────────────────────────────

/**
 * Search Spotify for multiple tracks with a delay between requests.
 * Respects Spotify rate limits by adding a delay between each request.
 *
 * @param tracks - Array of {artist, title} objects to search
 * @param delayMs - Milliseconds to wait between requests (default 200)
 * @returns Array of SpotifyTrackResult or null for each track
 */
export async function searchSpotifyBatch(
  tracks: TrackInput[],
  delayMs: number = 200
): Promise<(SpotifyTrackResult | null)[]> {
  const results: (SpotifyTrackResult | null)[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];

    try {
      const result = await searchSpotifyTrack(track.artist, track.title);
      results.push(result);
    } catch (err: any) {
      console.error(
        `Batch search error for "${track.artist} - ${track.title}":`,
        err.message
      );
      results.push(null);
    }

    // Add delay between requests (except after last one)
    if (i < tracks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────────────
// Embed URL Generation
// ────────────────────────────────────────────────────────────────

/**
 * Generate an embed URL for a Spotify track.
 * Use in an iframe: <iframe src={getSpotifyEmbedUrl(trackId)} ... />
 *
 * theme=0 = dark mode (default)
 *
 * @param trackId - Spotify track ID
 * @returns Embed URL
 */
export function getSpotifyEmbedUrl(trackId: string): string {
  return `https://open.spotify.com/embed/track/${trackId}?theme=0`;
}

// ────────────────────────────────────────────────────────────────
// OAuth & User Authentication (Web Playback SDK)
// ────────────────────────────────────────────────────────────────

const USER_TOKEN_KEY = "cratemate_spotify_user_token";

/**
 * Generate the Spotify authorization URL for OAuth2 Authorization Code flow.
 * Scopes: streaming for Web Playback SDK + user context for playback control.
 */
export function getSpotifyAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID not configured");

  const redirectUri = getSpotifyRedirectUri();
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

  return `https://accounts.spotify.com/authorize?${params}`;
}

/**
 * Get the OAuth redirect URI based on environment.
 * Prefers NEXT_PUBLIC_APP_URL, falls back to window.location.origin on client.
 */
export function getSpotifyRedirectUri(): string {
  // Server-side: use NEXT_PUBLIC_APP_URL (must be set in env)
  if (typeof window === "undefined") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL not set for server-side redirect URI");
    return `${appUrl}/auth/spotify/callback`;
  }

  // Client-side: use origin
  return `${window.location.origin}/auth/spotify/callback`;
}

/**
 * Save user Spotify authentication tokens to localStorage.
 * @param data - Token data with accessToken, refreshToken, expiresAt
 */
export function saveSpotifyUserToken(data: SpotifyTokenData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_TOKEN_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save Spotify user token:", err);
  }
}

/**
 * Retrieve user Spotify authentication tokens from localStorage.
 * @returns Token data or null if not found/expired
 */
export function getSpotifyUserToken(): SpotifyTokenData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read Spotify user token:", err);
    return null;
  }
}

/**
 * Clear user Spotify authentication tokens from localStorage.
 */
export function clearSpotifyUserToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
  } catch (err) {
    console.error("Failed to clear Spotify user token:", err);
  }
}

/**
 * Check if user is authenticated and token is not expired (with 60s buffer).
 */
export function isSpotifyAuthenticated(): boolean {
  const token = getSpotifyUserToken();
  if (!token || !token.accessToken) return false;

  // Check if expired (with 60s buffer to be safe)
  const bufferMs = 60 * 1000;
  return token.expiresAt > Date.now() + bufferMs;
}

/**
 * Get a valid access token, refreshing if needed.
 * This is called by the Web Playback SDK's getOAuthToken callback.
 */
export async function getValidSpotifyUserToken(): Promise<string | null> {
  const token = getSpotifyUserToken();
  if (!token) return null;

  // Token still valid
  if (token.expiresAt > Date.now()) {
    return token.accessToken;
  }

  // Need to refresh
  if (!token.refreshToken) {
    clearSpotifyUserToken();
    return null;
  }

  try {
    const res = await fetch("/api/spotify-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!res.ok) {
      clearSpotifyUserToken();
      return null;
    }

    const data = await res.json();
    const newToken: SpotifyTokenData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || token.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
    };

    saveSpotifyUserToken(newToken);
    return newToken.accessToken;
  } catch (err) {
    console.error("Failed to refresh Spotify token:", err);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────
// Playback Control via Web API
// ────────────────────────────────────────────────────────────────

/**
 * Play track(s) on a specific device using Web API.
 * @param deviceId - Spotify device ID from Web Playback SDK
 * @param accessToken - User access token
 * @param uris - Array of Spotify track URIs (spotify:track:xxxxx)
 * @param offsetIndex - Optional: start at this index in the uris array
 * @returns true if successful
 */
export async function spotifyPlay(
  deviceId: string,
  accessToken: string,
  uris: string[],
  offsetIndex?: number
): Promise<boolean> {
  try {
    const body: any = { uris };
    if (offsetIndex !== undefined && offsetIndex >= 0) {
      body.offset = { position: offsetIndex };
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifyPlay error:", err);
    return false;
  }
}

/**
 * Pause playback on the current device.
 * @param accessToken - User access token
 * @returns true if successful
 */
export async function spotifyPause(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifyPause error:", err);
    return false;
  }
}

/**
 * Seek to a position in the current track.
 * @param accessToken - User access token
 * @param positionMs - Position in milliseconds
 * @returns true if successful
 */
export async function spotifySeek(accessToken: string, positionMs: number): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.floor(positionMs)}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifySeek error:", err);
    return false;
  }
}

/**
 * Set volume on the current device (0-100).
 * @param accessToken - User access token
 * @param volumePercent - Volume 0-100
 * @returns true if successful
 */
export async function spotifySetVolume(
  accessToken: string,
  volumePercent: number
): Promise<boolean> {
  try {
    const vol = Math.max(0, Math.min(100, Math.round(volumePercent)));
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${vol}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifySetVolume error:", err);
    return false;
  }
}

/**
 * Skip to next track.
 * @param accessToken - User access token
 * @returns true if successful
 */
export async function spotifyNext(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifyNext error:", err);
    return false;
  }
}

/**
 * Skip to previous track.
 * @param accessToken - User access token
 * @returns true if successful
 */
export async function spotifyPrevious(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error("spotifyPrevious error:", err);
    return false;
  }
}

/**
 * Get current playback state.
 * @param accessToken - User access token
 * @returns Current player state or null on error
 */
export async function spotifyGetCurrentState(accessToken: string): Promise<any> {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("spotifyGetCurrentState error:", err);
    return null;
  }
}
