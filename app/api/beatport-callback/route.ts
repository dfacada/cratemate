import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CLIENT_ID    = "0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || "https://cratemate-five.vercel.app"}/auth/beatport/callback`;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/settings?bp=error", req.url));
  }

  try {
    const res = await fetch("https://api.beatport.com/v4/auth/o/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:   "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id:    CLIENT_ID,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Beatport token exchange failed:", res.status, text);
      return NextResponse.redirect(new URL(`/settings?bp=error&status=${res.status}`, req.url));
    }

    const tokens = await res.json();
    // Embed tokens in URL fragment (never hits server, stays client-only)
    const encoded = encodeURIComponent(JSON.stringify(tokens));
    return NextResponse.redirect(new URL(`/auth/beatport/callback?tokens=${encoded}`, req.url));

  } catch (e) {
    console.error("Beatport callback error:", e);
    return NextResponse.redirect(new URL("/settings?bp=error", req.url));
  }
}
