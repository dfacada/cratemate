import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BP_BASE = "https://api.beatport.com/v4";

// ─── Token refresh ─────────────────────────────────────────────────────────
async function refreshToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  // Scrape the public client_id Beatport uses for their own docs/swagger UI
  // This is the same workaround used by beets-beatport4
  try {
    const docsHtml = await fetch(`${BP_BASE}/docs/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    }).then(r => r.text());

    const match = docsHtml.match(/"clientId"\s*:\s*"([^"]+)"/);
    if (!match) return null;
    const clientId = match[1];

    const res = await fetch(`${BP_BASE}/auth/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Main route ────────────────────────────────────────────────────────────
// Proxies all Beatport API calls. Client sends:
//   ?path=/catalog/tracks/&artist=...&title=...
//   Header: x-bp-token: <access_token>
//   Header: x-bp-refresh: <refresh_token>
export async function GET(req: NextRequest) {
  const sp           = req.nextUrl.searchParams;
  const path         = sp.get("path") || "/catalog/tracks/";
  const accessToken  = req.headers.get("x-bp-token");
  const refreshTok   = req.headers.get("x-bp-refresh");

  if (!accessToken) {
    return NextResponse.json({ error: "No Beatport token. Set up in Settings.", setup: true }, { status: 401 });
  }

  // Build upstream URL — pass remaining search params through
  const upstream = new URL(`${BP_BASE}${path}`);
  sp.forEach((v, k) => {
    if (k !== "path") upstream.searchParams.set(k, v);
  });

  let token = accessToken;

  const doFetch = async (t: string) =>
    fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(10000),
    });

  let res = await doFetch(token);

  // Token expired — try to refresh
  if (res.status === 401 && refreshTok) {
    const newTokens = await refreshToken(refreshTok);
    if (newTokens?.access_token) {
      token = newTokens.access_token;
      res = await doFetch(token);
      // Tell client to update its stored tokens
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          "x-bp-new-access": newTokens.access_token,
          "x-bp-new-refresh": newTokens.refresh_token,
          "Cache-Control": "public, s-maxage=300",
        },
      });
    }
    return NextResponse.json({ error: "Token expired. Re-authenticate in Settings.", setup: true }, { status: 401 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: `Beatport API ${res.status}`, detail: text.slice(0, 300) }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
