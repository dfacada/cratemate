// Beatport API client — runs in the browser, tokens stored in localStorage

export interface BeatportToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
}

export interface BeatportTrack {
  id: number;
  name: string;
  mix_name: string;
  slug: string;
  bpm: number | null;
  key: { camelot_number: number; camelot_letter: string; name: string; standard: { letter: string; chord: string } } | null;
  genre: { id: number; name: string; slug: string } | null;
  label: { id: number; name: string; slug: string } | null;
  artists: Array<{ id: number; name: string; slug: string }>;
  release: {
    id: number;
    name: string;
    slug: string;
    catalog_number: string | null;
    image: { uri: string; dynamic_uri: string } | null;
    date: string | null;
  } | null;
  length: string | null;
  url: string;
  sample_url: string | null;
}

const LS_KEY = "cratemate_bp_token";
const PROXY  = "/api/beatport";

export function getBPToken(): BeatportToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setBPToken(token: BeatportToken) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(token));
}

export function clearBPToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}

export function parsePastedToken(raw: string): BeatportToken | null {
  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed.access_token || !parsed.refresh_token) return null;
    const expiresIn = parsed.expires_in || 3600;
    return {
      access_token:  parsed.access_token,
      refresh_token: parsed.refresh_token,
      expires_at:    Date.now() + expiresIn * 1000,
    };
  } catch { return null; }
}

// ── Search tracks ───────────────────────────────────────────────────────────
export async function searchBeatport(
  artist: string,
  title: string
): Promise<{ track: BeatportTrack | null; error?: string; setup?: boolean }> {
  const token = getBPToken();
  if (!token) return { track: null, error: "Not authenticated", setup: true };

  const params = new URLSearchParams({
    path: "/catalog/tracks/",
    q: `${artist} ${title}`,
    per_page: "10",
    type: "tracks",
  });

  const res = await fetch(`${PROXY}?${params}`, {
    headers: {
      "x-bp-token":   token.access_token,
      "x-bp-refresh": token.refresh_token,
    },
  });

  // Handle new tokens from refresh
  const newAccess  = res.headers.get("x-bp-new-access");
  const newRefresh = res.headers.get("x-bp-new-refresh");
  if (newAccess && newRefresh) {
    setBPToken({ access_token: newAccess, refresh_token: newRefresh, expires_at: Date.now() + 3600_000 });
  }

  const data = await res.json();

  if (!res.ok) {
    return { track: null, error: data.error || `Error ${res.status}`, setup: !!data.setup };
  }

  const results: BeatportTrack[] = data.results || [];
  if (!results.length) return { track: null, error: "Not found on Beatport" };

  // Score results
  const best = pickBest(results, artist, title);
  return { track: best };
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function pickBest(tracks: BeatportTrack[], artist: string, title: string): BeatportTrack {
  const wA = norm(artist);
  const wT = norm(title);

  const scored = tracks.map(t => {
    const tA = norm(t.artists?.map(a => a.name).join(" ") || "");
    const tT = norm(`${t.name} ${t.mix_name || ""}`);
    let score = 0;
    if (tT === wT)              score += 50;
    else if (tT.includes(wT))   score += 30;
    if (tA === wA)              score += 40;
    else if (tA.includes(wA) || wA.includes(tA)) score += 25;
    return { t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].t;
}

// Format key for display: "6A" or "Am" depending on preference
export function formatKey(key: BeatportTrack["key"]): string {
  if (!key) return "";
  return `${key.camelot_number}${key.camelot_letter}`;
}

// Beatport track permalink
export function beatportUrl(track: BeatportTrack): string {
  return track.url || `https://www.beatport.com/track/${track.slug}/${track.id}`;
}
