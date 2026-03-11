import { Playlist, PlaylistDNA } from "@/types/playlist";
import { Track } from "@/types/track";

/**
 * Playlist Analyzer — Stub implementation
 * In production this would use AI to detect patterns, cluster BPMs,
 * identify underground vs commercial ratio, and build the DNA profile.
 */

export async function fetchPlaylistFromUrl(url: string): Promise<Playlist | null> {
  await new Promise((r) => setTimeout(r, 1200));

  // Detect platform
  const platform = url.includes("spotify")
    ? "spotify"
    : url.includes("soundcloud")
    ? "soundcloud"
    : url.includes("mixcloud")
    ? "mixcloud"
    : "manual";

  // Stub response
  return {
    id: `pl_${Date.now()}`,
    name: "Imported Playlist",
    source: platform,
    sourceUrl: url,
    trackCount: 12,
    tracks: [],
    createdAt: new Date().toISOString(),
  };
}

export async function analyzePlaylistDNA(tracks: Track[]): Promise<PlaylistDNA> {
  await new Promise((r) => setTimeout(r, 2000));

  const bpms = tracks.map((t) => t.bpm);
  const avgBpm = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);

  const artistCounts: Record<string, number> = {};
  const labelCounts: Record<string, number> = {};

  tracks.forEach((t) => {
    artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
    labelCounts[t.label] = (labelCounts[t.label] || 0) + 1;
  });

  return {
    topArtists: Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    topLabels: Object.entries(labelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    bpmCluster: {
      min: Math.min(...bpms),
      max: Math.max(...bpms),
      avg: avgBpm,
      dominant: avgBpm,
    },
    energyProfile: tracks.map((t) => t.energy),
    genres: [
      { name: "Deep House", weight: 0.45 },
      { name: "Tech House", weight: 0.3 },
      { name: "Melodic House", weight: 0.15 },
      { name: "Minimal", weight: 0.1 },
    ],
    keyDistribution: [
      { key: "5A", count: 3 },
      { key: "6A", count: 2 },
      { key: "7A", count: 2 },
      { key: "8A", count: 2 },
      { key: "9A", count: 1 },
    ],
    undergroundRatio: 0.72,
    estimatedEra: "2014–2022",
    mood: ["hypnotic", "warm", "late-night", "melodic"],
  };
}
