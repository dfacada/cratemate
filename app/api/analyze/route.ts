import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime  = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

export interface TrackInput {
  artist: string;
  title:  string;
  label?: string;
  bpm?:   number;
  key?:   string;
  year?:  number;
}

export interface PlaylistDNA {
  topArtists:       { name: string; count: number }[];
  topLabels:        { name: string; count: number }[];
  genres:           { name: string; weight: number }[];
  mood:             string[];
  bpmRange:         { min: number; max: number; avg: number };
  energy:           string;
  era:              string;
  undergroundRatio: number;
  setCharacter:     string;
  keyThemes:        string[];
}

export interface RecommendedTrack {
  artist: string;
  title:  string;
  label:  string;
  year:   number;
  bpm:    number;
  key:    string;
  genre:  string;
  why:    string;
  energy: number;
  mood:   string[];
}

export interface AnalyzeResponse {
  dna:             PlaylistDNA;
  recommendations: RecommendedTrack[];
  trackCount:      number;
}

function parseJSON(raw: string): any | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let str = match[0];
  try { return JSON.parse(str); } catch {
    // Truncated — trim to last complete object in recommendations array
    const cut = str.lastIndexOf("},\n    {");
    if (cut > 0) {
      str = str.slice(0, cut + 1) + "\n  ]\n}";
      try { return JSON.parse(str); } catch { return null; }
    }
    return null;
  }
}

// ── /api/analyze?mode=dna  → just DNA, no recs (fast, ~5s)
// ── /api/analyze?mode=recs → recs only, uses dna summary from body (fast per batch)
// ── /api/analyze            → DNA + up to 20 recs (default, backward-compatible)
export async function POST(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode"); // "dna" | "recs" | null
  const body: {
    tracks:     TrackInput[];
    count?:     number;
    dnaSummary?: string; // for recs-only mode
    exclude?:   string[]; // artist::title keys already returned
  } = await req.json();

  const { tracks, count = 20, dnaSummary, exclude = [] } = body;

  if (!tracks?.length) {
    return NextResponse.json({ error: "No tracks provided" }, { status: 400 });
  }

  const trackList = tracks
    .slice(0, 150) // cap input size
    .map((t, i) => {
      const parts = [`${i + 1}. ${t.artist} — "${t.title}"`];
      if (t.label) parts.push(`[${t.label}]`);
      if (t.bpm)   parts.push(`${t.bpm} BPM`);
      if (t.year)  parts.push(`(${t.year})`);
      return parts.join(" ");
    })
    .join("\n");

  // ── Recs-only mode (used for batches after the first call) ──────────────
  if (mode === "recs" && dnaSummary) {
    const excludeNote = exclude.length
      ? `\nDO NOT repeat these already-recommended tracks: ${exclude.slice(0, 30).join(", ")}`
      : "";

    const prompt = `You are a world-class DJ. Based on this playlist DNA:
${dnaSummary}

Recommend exactly ${count} MORE real tracks that fit this playlist's vibe.
Be CONCISE in "why" (max 6 words).${excludeNote}

Respond with ONLY a JSON array, no other text:
[
  {
    "artist": "string",
    "title": "string",
    "label": "string",
    "year": number,
    "bpm": number,
    "key": "Camelot e.g. 6A",
    "genre": "string",
    "why": "max 6 words",
    "energy": number,
    "mood": ["string"]
  }
]`;

    try {
      const msg = await client.messages.create({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages:   [{ role: "user", content: prompt }],
      });
      const raw   = msg.content[0].type === "text" ? msg.content[0].text : "";
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) return NextResponse.json({ recommendations: [] });
      let arr: RecommendedTrack[] = [];
      try { arr = JSON.parse(match[0]); } catch {
        const cut = match[0].lastIndexOf("},\n  {");
        if (cut > 0) {
          try { arr = JSON.parse(match[0].slice(0, cut + 1) + "\n]"); } catch { arr = []; }
        }
      }
      return NextResponse.json({ recommendations: arr });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── Default: DNA + first 20 recs ────────────────────────────────────────
  const prompt = `You are a world-class DJ and music curator. Analyze this playlist and give:
1. A DNA analysis
2. Exactly ${Math.min(count, 20)} real track recommendations

PLAYLIST (${tracks.length} tracks):
${trackList}

Be CONCISE in "why" (max 6 words). Respond ONLY with valid JSON:
{
  "dna": {
    "topArtists": [{"name": "string", "count": number}],
    "topLabels":  [{"name": "string", "count": number}],
    "genres":     [{"name": "string", "weight": number}],
    "mood":       ["string"],
    "bpmRange":   {"min": number, "max": number, "avg": number},
    "energy":     "string",
    "era":        "string",
    "undergroundRatio": number,
    "setCharacter": "2 sentences",
    "keyThemes":  ["string"]
  },
  "recommendations": [
    {"artist":"string","title":"string","label":"string","year":number,"bpm":number,"key":"6A","genre":"string","why":"max 6 words","energy":number,"mood":["string"]}
  ]
}`;

  try {
    const msg    = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages:   [{ role: "user", content: prompt }],
    });
    const raw    = msg.content[0].type === "text" ? msg.content[0].text : "";
    const parsed = parseJSON(raw);

    if (!parsed?.dna) throw new Error("Could not parse response. Please try again.");

    return NextResponse.json({
      dna:             parsed.dna,
      recommendations: parsed.recommendations || [],
      trackCount:      tracks.length,
      dnaSummary:      buildDNASummary(parsed.dna, trackList),
    } as AnalyzeResponse & { dnaSummary: string });

  } catch (e: any) {
    const msg = e.message || "";
    const err = msg.includes("apiKey") || msg.includes("authToken") || msg.includes("authentication")
      ? "ANTHROPIC_API_KEY not set in Vercel environment variables."
      : msg || "Analysis failed";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

function buildDNASummary(dna: PlaylistDNA, trackList: string): string {
  return [
    `Vibe: ${dna.setCharacter}`,
    `Genres: ${dna.genres.map(g => g.name).join(", ")}`,
    `Mood: ${dna.mood.join(", ")}`,
    `BPM: ${dna.bpmRange.min}–${dna.bpmRange.max} (avg ${dna.bpmRange.avg})`,
    `Era: ${dna.era}`,
    `Key artists: ${dna.topArtists.slice(0, 5).map(a => a.name).join(", ")}`,
    `Key labels: ${dna.topLabels.slice(0, 5).map(l => l.name).join(", ")}`,
    `Key themes: ${dna.keyThemes.join(", ")}`,
    `Sample tracks:\n${trackList.split("\n").slice(0, 15).join("\n")}`,
  ].join("\n");
}
