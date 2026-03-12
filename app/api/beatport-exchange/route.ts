import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CLIENT_ID    = "0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd";
const REDIRECT_URI = "https://api.beatport.com/v4/auth/o/post-message/";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.error_description || `Beatport ${res.status}` }, { status: res.status });

  return NextResponse.json(data);
}
