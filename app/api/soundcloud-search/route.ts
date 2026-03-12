import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime     = "nodejs";
export const maxDuration = 45;

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a SoundCloud track discovery and validation agent for a DJ application.
Your job is to locate the correct live SoundCloud track page for a given track and artist, validate that the link works, and return the verified SoundCloud URL.

Step 1 — Extract Tracks
Normalize input to: Artist - Track Title
Remove: file extensions (.m4a, .wav), label tags like [Tronic], emojis, bitrate tags.

Step 2 — Generate Search Queries
Create multiple search variations:
Primary: Artist Track site:soundcloud.com
Alternatives: Artist - Track, Track Artist, Artist Track Original Mix, Artist Track Extended Mix
Remove clip/extract/preview/official audio only as fallback.

Step 3 — Find Candidate SoundCloud Pages
Locate pages matching: https://soundcloud.com/{user}/{track-slug}
Reject: playlist/set pages, profile pages, repost pages.
Accept only individual track pages.

Step 4 — Validate the Track Page
Open and validate each candidate. Reject if page contains:
- "This track was not found"
- "It looks like this track has been removed"
- 404
- redirects to something unrelated
Only accept links that show a real playable SoundCloud track page.

Step 5 — Score Matches
Prefer in order:
1. Exact Artist + Exact Title
2. Official artist account upload
3. Official label upload
4. Exact version match (Original Mix / Extended Mix)
5. Closest title match
Avoid: DJ set uploads, bootlegs when official exists, unrelated remixes.

Step 6 — If First Result Fails
Retry using: alternate spelling, remove version tags, remove "feat.", search label accounts, search by filename-style titles.
Never fabricate a SoundCloud slug.

Step 7 — Return Only Validated Links
For a single track return:
{
  "artist": "Artist Name",
  "title": "Track Title",
  "soundcloud_url": "https://soundcloud.com/user/track",
  "embed_url": "https://w.soundcloud.com/player/?url=https://soundcloud.com/user/track",
  "validated": true,
  "confidence": 0.0-1.0
}
If not found:
{
  "artist": "...", "title": "...", "soundcloud_url": null, "embed_url": null, "validated": false, "reason": "No verified SoundCloud track found"
}

For playlists return: { "tracks": [...] }

Critical Rules:
1. Never guess a SoundCloud URL.
2. Always validate the page via web search or fetch.
3. Reject broken or removed tracks.
4. Prefer official artist uploads.
5. Return structured JSON only — no other text.`;

export interface SCSearchResult {
  artist:         string;
  title:          string;
  soundcloud_url: string | null;
  embed_url:      string | null;
  validated:      boolean;
  confidence?:    number;
  reason?:        string;
}

function isValidSCTrackUrl(url: string): boolean {
  // Must be https://soundcloud.com/{user}/{track} — no extra path segments, no /sets/
  return /^https:\/\/soundcloud\.com\/[a-zA-Z0-9_-]+\/(?!sets\/)[a-zA-Z0-9_-]+$/.test(url);
}

function buildEmbedUrl(trackUrl: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&buying=false&sharing=false&download=false`;
}

export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get("artist") || "";
  const title  = req.nextUrl.searchParams.get("title")  || "";

  if (!artist || !title) {
    return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
  }

  try {
    const msg = await (client.messages.create as any)({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
      }],
      messages: [{ role: "user", content: `${artist} - ${title}` }],
    });

    // The model may run multiple tool_use rounds before a final text block
    const textBlock = [...msg.content].reverse().find((b: any) => b.type === "text");
    const raw = textBlock?.type === "text" ? (textBlock as any).text.trim() : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        artist, title, soundcloud_url: null, embed_url: null,
        validated: false, reason: "Agent returned no parseable JSON.",
      } as SCSearchResult);
    }

    const result: SCSearchResult = JSON.parse(jsonMatch[0]);

    // Hard-validate the URL shape — never let a bad link through
    if (result.soundcloud_url && !isValidSCTrackUrl(result.soundcloud_url)) {
      result.soundcloud_url = null;
      result.embed_url      = null;
      result.validated      = false;
      result.reason         = (result.reason || "") + " (URL failed permalink validation)";
    }

    // Always rebuild embed_url from our sanitised track url
    if (result.soundcloud_url) {
      result.embed_url = buildEmbedUrl(result.soundcloud_url);
    } else {
      result.embed_url = null;
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  } catch (e: any) {
    const msg = e.message || "";
    const err = msg.includes("apiKey") || msg.includes("authentication")
      ? "ANTHROPIC_API_KEY not configured."
      : msg || "Search failed";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
