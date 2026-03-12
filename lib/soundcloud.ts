// SoundCloud OAuth + playlist creation — runs entirely client-side

export interface SCToken {
  access_token: string;
  expires_at:   number;
}

const LS_KEY = "cratemate_sc_token";

export function getSCToken(): SCToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSCToken(t: SCToken) {
  localStorage.setItem(LS_KEY, JSON.stringify(t));
}

export function clearSCToken() {
  localStorage.removeItem(LS_KEY);
}

export function getSCClientId(): string {
  // User-provided via Settings, or env var
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("cratemate_sc_client_id");
    if (stored) return stored;
  }
  return process.env.NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID || "";
}

export function setSCClientId(id: string) {
  localStorage.setItem("cratemate_sc_client_id", id);
}

export function buildSCAuthUrl(clientId: string, redirectUri: string): string {
  return `https://soundcloud.com/connect?${new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "token",
    scope:         "non-expiring",
  })}`;
}

export interface SCTrack {
  id:    number;
  title: string;
}

// Search SoundCloud for a track by artist + title, returns best match id
export async function searchSCTrack(
  artist: string,
  title:  string,
  token:  string,
  clientId: string
): Promise<number | null> {
  const q = `${artist} ${title}`;
  const res = await fetch(
    `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&limit=5&client_id=${clientId}`,
    { headers: { Authorization: `OAuth ${token}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.collection?.[0]?.id ?? null;
}

// Create a SC playlist with given track ids
export async function createSCPlaylist(
  name:     string,
  trackIds: number[],
  token:    string,
  clientId: string
): Promise<{ id: number; permalink_url: string } | null> {
  const res = await fetch(
    `https://api-v2.soundcloud.com/playlists?client_id=${clientId}`,
    {
      method:  "POST",
      headers: {
        Authorization:  `OAuth ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlist: {
          title:       name,
          sharing:     "public",
          tracks:      trackIds.map(id => ({ id })),
        },
      }),
    }
  );
  if (!res.ok) return null;
  return res.json();
}
