import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

export interface TrackInput {
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  year?: number;
}

export interface PlaylistDNA {
  topArtists:     { name: string; count: number }[];
  topLabels:      { name: string; count: number }[];
  genres:         { name: string; weight: number }[];
  mood:           string[];
  bpmRange:       { min: number; max: number; avg: number };
  energy:         string; // e.g. "builds from 6→9/10 through the set"
  era:            string; // e.g. "2016–2023"
  undergroundRatio: number; // 0-1
  setCharacter:   string; // 1-2 sentence description
  keyThemes:      string[]; // musical/thematic keywords
}

export interface RecommendedTrack {
  artist:  string;
  title:   string;
  label:   string;
  year:    number;
  bpm:     number;
  key:     string;
  genre:   string;
  why:     string;  // brief reason it fits
  energy:  number; // 1-10
  mood:    string[];
}

export interface AnalyzeResponse {
  dna:             PlaylistDNA;
  recommendations: RecommendedTrack[];
  trackCount:      number;
}

export async function POST(req: NextRequest) {
  const { tracks, count = 20 }: { tracks: TrackInput[]; count?: number } = await req.json();

  if (!tracks?.length) {
    return NextResponse.json({ error: "No tracks provided" }, { status: 400 });
  }

  const trackList = tracks
    .map((t, i) => {
      const parts = [`${i + 1}. ${t.artist} — "${t.title}"`];
      if (t.label) parts.push(`[${t.label}]`);
      if (t.bpm)   parts.push(`${t.bpm} BPM`);
      if (t.key)   parts.push(`key: ${t.key}`);
      if (t.year)  parts.push(`(${t.year})`);
      return parts.join(" ");
    })
    .join("\n");

  const prompt = `You are a world-class DJ and music curator with deep knowledge of electronic music. Analyze the following playlist and provide:

1. A detailed DNA analysis of the playlist's character
2. Exactly ${count} specific real track recommendations that would fit perfectly

PLAYLIST (${tracks.length} tracks):
${trackList}

Respond with ONLY valid JSON in exactly this structure, no other text:
{
  "dna": {
    "topArtists": [{"name": "string", "count": number}],
    "topLabels": [{"name": "string", "count": number}],
    "genres": [{"name": "string", "weight": number}],
    "mood": ["string"],
    "bpmRange": {"min": number, "max": number, "avg": number},
    "energy": "string describing the energy arc",
    "era": "string like 2016-2023",
    "undergroundRatio": number,
    "setCharacter": "2 sentence description of the overall vibe and feel",
    "keyThemes": ["string"]
  },
  "recommendations": [
    {
      "artist": "string",
      "title": "string",
      "label": "string",
      "year": number,
      "bpm": number,
      "key": "string in Camelot e.g. 6A",
      "genre": "string",
      "why": "1 sentence why this fits this specific playlist",
      "energy": number,
      "mood": ["string"]
    }
  ]
}

CRITICAL RULES for recommendations:
- Recommend REAL tracks that actually exist — artists, titles, labels must be accurate
- Match the sonic DNA closely: similar BPM range, energy, genre, era
- Vary the recommendations: include some obvious fits and some deeper cuts
- Each "why" must reference something specific about THIS playlist
- Include artists from the playlist but suggest different tracks, AND suggest new artists in the same world
- genres and mood tags must reflect electronic music subgenres specifically
- Camelot key format: number + A or B (e.g. "6A", "11B")`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON even if model wraps in backticks
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed: AnalyzeResponse = JSON.parse(jsonMatch[0]);
    parsed.trackCount = tracks.length;

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
  }
}
