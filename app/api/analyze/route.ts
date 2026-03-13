import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchSpotifyTrack, type SpotifyTrackResult } from "@/lib/spotify";
import { calculateMixScore, type MixScoreResult } from "@/lib/music-theory";

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
  averageBpm:       number;
  energy:           string;
  averageEnergy:    number;
  era:              string;
  dominantKey:      string;
  undergroundRatio: number;
  setCharacter:     string;
  keyThemes:        string[];
}

export interface RecommendedTrack {
  artist:           string;
  title:            string;
  label?:           string;
  year?:            number;
  genre?:           string;
  subGenre?:        string;
  whyItFits:        string;
  gemScore:         number;
  confidence:       number;
  camelotKey?:      string;
  bpm?:             number;
  energy?:          number;
  duration?:        number;
  matchReason?:     string;
  // Spotify metadata
  spotifyId?:       string;
  spotifyUri?:      string;
  spotifyEmbedUrl?: string;
  albumArt?:        string | { small: string; medium: string; large: string };
  // Mix scoring
  mixScore?:        {
    overall:        number;
    harmonic:       number;
    bpm:            number;
    energy:         number;
    duration:       number;
    breakdown:      string;
  };
}

export interface ValidationStats {
  totalGenerated: number;
  validated:      number;
  discarded:      number;
  scored:         number;
}

export interface AnalyzeResponse {
  dna:                PlaylistDNA;
  recommendations:    RecommendedTrack[];
  trackCount:         number;
  dnaSummary?:        string;
  validationStats?:   ValidationStats;
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

    const prompt = `You are a veteran DJ curator who mixes by ear (no key lock). Think about:
1. Harmonic compatibility - what Camelot keys blend with the playlist's dominant key?
2. BPM proximity - tracks within ±5 BPM need minimal pitch adjustment
3. When you pitch a track to match BPM, the key shifts. Account for this.
4. Energy flow - suggest tracks that maintain or build energy, not jarring jumps
5. Duration - similar length tracks (within 25% of each other) work best in sets
6. Label/artist lineage - what labels and artists share the playlist's sonic DNA?

Based on this playlist DNA:
${dnaSummary}

Recommend exactly ${count} MORE tracks that fit this playlist's vibe.

Generate 30+ candidate tracks. Include your best estimate of:
- camelotKey (e.g., "8A")
- bpm (number)
- energy (0.0-1.0)
- duration estimate in seconds
- whyItFits (1-2 sentences explaining the DJ logic)

Prefer well-known releases. We will validate each track exists, so over-recommend rather than under-recommend.
Only recommend tracks with confidence >= 0.7.${excludeNote}

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
    "subGenre": "optional string",
    "whyItFits": "1-2 sentences max",
    "gemScore": number (0-100),
    "camelotKey": "Camelot key e.g. 8A",
    "bpm": number,
    "energy": number (0-1),
    "duration": number (seconds),
    "matchReason": "optional explanation",
    "confidence": number
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
      if (!match) return NextResponse.json({ recommendations: [], validationStats: { total: 0, validated: 0, discarded: 0 } });
      let arr: any[] = [];
      try { arr = JSON.parse(match[0]); } catch {
        const cut = match[0].lastIndexOf("},\n  {");
        if (cut > 0) {
          try { arr = JSON.parse(match[0].slice(0, cut + 1) + "\n]"); } catch { arr = []; }
        }
      }

      // Filter low-confidence tracks
      arr = arr.filter(t => (t.confidence ?? 0) >= 0.7);

      const totalGenerated = arr.length;
      const validated: RecommendedTrack[] = [];

      // Validate against Spotify
      for (let i = 0; i < arr.length; i++) {
        const rec = arr[i];
        const spotifyResult = await searchSpotifyTrack(rec.artist, rec.title);

        if (spotifyResult) {
          const track: RecommendedTrack = {
            artist: rec.artist,
            title: rec.title,
            label: rec.label,
            year: rec.year,
            genre: rec.genre,
            subGenre: rec.subGenre,
            whyItFits: rec.whyItFits,
            gemScore: rec.gemScore ?? 75,
            confidence: rec.confidence,
            camelotKey: rec.camelotKey,
            bpm: rec.bpm,
            energy: rec.energy,
            duration: spotifyResult.duration,
            matchReason: rec.matchReason,
            spotifyId: spotifyResult.spotifyId,
            spotifyUri: spotifyResult.spotifyUri,
            spotifyEmbedUrl: spotifyResult.embedUrl,
            albumArt: spotifyResult.albumArt,
          };

          validated.push(track);
        }

        // Add 200ms delay between Spotify searches
        if (i < arr.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      return NextResponse.json({
        recommendations: validated,
        validationStats: {
          totalGenerated,
          validated: validated.length,
          discarded: totalGenerated - validated.length,
          scored: 0,
        },
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── Default: DNA + first 20 recs ────────────────────────────────────────
  const prompt = `You are a veteran DJ curator who mixes by ear (no key lock). Think about:
1. Harmonic compatibility - what Camelot keys blend together?
2. BPM proximity - tracks within ±5 BPM need minimal pitch adjustment
3. When you pitch a track to match BPM, the key shifts. Account for this.
4. Energy flow - suggest tracks that maintain or build energy
5. Duration - similar length tracks (within 25% of each other) work best in sets
6. Label/artist lineage - what labels and artists share the sonic DNA?

Analyze this playlist and give:
1. A DNA analysis (including averageBpm, dominantKey, and averageEnergy)
2. Exactly ${Math.min(count, 20)} track recommendations

PLAYLIST (${tracks.length} tracks):
${trackList}

For the DNA analysis, include:
- averageBpm: the average BPM of all tracks
- dominantKey: the most common Camelot key (e.g., "8A")
- averageEnergy: average energy level (0.0-1.0)

For each recommendation, include your best estimates:
- camelotKey (e.g., "8A")
- bpm (number)
- energy (0.0-1.0)
- duration estimate in seconds
- whyItFits (explain the DJ logic in 1-2 sentences)

Generate 30+ candidate tracks. Prefer well-known releases—we validate against Spotify.
Only recommend tracks with confidence >= 0.7.

Respond ONLY with valid JSON:
{
  "dna": {
    "topArtists": [{"name": "string", "count": number}],
    "topLabels":  [{"name": "string", "count": number}],
    "genres":     [{"name": "string", "weight": number}],
    "mood":       ["string"],
    "bpmRange":   {"min": number, "max": number, "avg": number},
    "averageBpm": number,
    "energy":     "string",
    "averageEnergy": number,
    "era":        "string",
    "dominantKey": "Camelot key e.g. 8A",
    "undergroundRatio": number,
    "setCharacter": "2 sentences",
    "keyThemes":  ["string"]
  },
  "recommendations": [
    {
      "artist": "string",
      "title": "string",
      "label": "string",
      "year": number,
      "bpm": number,
      "key": "Camelot e.g. 6A",
      "genre": "string",
      "subGenre": "optional string",
      "whyItFits": "1-2 sentences",
      "gemScore": number (0-100),
      "camelotKey": "Camelot key e.g. 8A",
      "bpm": number,
      "energy": number (0-1),
      "duration": number (seconds),
      "matchReason": "optional explanation",
      "confidence": number
    }
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

    // Filter low-confidence tracks
    let recs: any[] = (parsed.recommendations || []).filter(
      (t: any) => (t.confidence ?? 0) >= 0.7
    );

    const totalGenerated = recs.length;

    // Validate against Spotify
    const validated: RecommendedTrack[] = [];
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      const spotifyResult = await searchSpotifyTrack(rec.artist, rec.title);

      if (spotifyResult) {
        const track: RecommendedTrack = {
          artist: rec.artist,
          title: rec.title,
          label: rec.label,
          year: rec.year,
          genre: rec.genre,
          subGenre: rec.subGenre,
          whyItFits: rec.whyItFits,
          gemScore: rec.gemScore ?? 75,
          confidence: rec.confidence,
          camelotKey: rec.camelotKey,
          bpm: rec.bpm,
          energy: rec.energy,
          duration: spotifyResult.duration,
          matchReason: rec.matchReason,
          spotifyId: spotifyResult.spotifyId,
          spotifyUri: spotifyResult.spotifyUri,
          spotifyEmbedUrl: spotifyResult.embedUrl,
          albumArt: spotifyResult.albumArt,
        };

        validated.push(track);
      }

      // Add 200ms delay between Spotify searches
      if (i < recs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Calculate mix scores for validated tracks
    let scored = 0;
    if (validated.length > 0 && parsed.dna.averageBpm && parsed.dna.dominantKey) {
      const referenceTrack = {
        key: parsed.dna.dominantKey,
        bpm: parsed.dna.averageBpm,
        energy: parsed.dna.averageEnergy ?? 0.5,
        duration: 300, // Default 5 min as placeholder
      };

      for (const rec of validated) {
        if (rec.camelotKey && rec.bpm !== undefined && rec.energy !== undefined && rec.duration) {
          try {
            const mixScore = calculateMixScore(referenceTrack, {
              key: rec.camelotKey,
              bpm: rec.bpm,
              energy: rec.energy,
              duration: rec.duration,
            }, parsed.dna.averageBpm);

            rec.mixScore = {
              overall: mixScore.overallScore,
              harmonic: mixScore.harmonicScore,
              bpm: mixScore.bpmScore,
              energy: mixScore.energyScore,
              duration: mixScore.durationScore,
              breakdown: mixScore.breakdown,
            };

            scored++;
          } catch (e) {
            // Skip scoring if music theory calculation fails
          }
        }
      }

      // Sort by mix score if available
      validated.sort((a, b) => {
        const aScore = a.mixScore?.overall ?? 0;
        const bScore = b.mixScore?.overall ?? 0;
        return bScore - aScore;
      });
    }

    return NextResponse.json({
      dna:             parsed.dna,
      recommendations: validated,
      trackCount:      tracks.length,
      dnaSummary:      buildDNASummary(parsed.dna, trackList),
      validationStats: {
        totalGenerated,
        validated: validated.length,
        discarded: totalGenerated - validated.length,
        scored,
      },
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
    `BPM: ${dna.bpmRange.min}–${dna.bpmRange.max} (avg ${dna.averageBpm ?? dna.bpmRange.avg})`,
    `Dominant Key: ${dna.dominantKey ?? "N/A"}`,
    `Energy: ${dna.energy} (avg ${dna.averageEnergy?.toFixed(2) ?? "N/A"})`,
    `Era: ${dna.era}`,
    `Key artists: ${dna.topArtists.slice(0, 5).map(a => a.name).join(", ")}`,
    `Key labels: ${dna.topLabels.slice(0, 5).map(l => l.name).join(", ")}`,
    `Key themes: ${dna.keyThemes.join(", ")}`,
    `Sample tracks:\n${trackList.split("\n").slice(0, 15).join("\n")}`,
  ].join("\n");
}
