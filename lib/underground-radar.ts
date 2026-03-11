import { mockRadarTracks } from "@/data/mockCrate";

/**
 * Underground Radar — Stub implementation
 * In production this would poll SoundCloud private reposts, Bandcamp new releases,
 * and aggregated DJ chart data to surface emerging underground tracks.
 */

export type RadarSignalSource =
  | "soundcloud_reposts"
  | "bandcamp_releases"
  | "dj_charts"
  | "social_mentions"
  | "promo_lists";

export interface RadarTrack {
  id: string;
  artist: string;
  title: string;
  label: string;
  year: number;
  bpm: number;
  key: string;
  energy: number;
  undergroundScore: number;
  source: string;
  reason: string;
  signalCount: number;
  detectedAt: string;
}

export interface RadarFilters {
  source?: RadarSignalSource;
  minScore?: number;
  bpmMin?: number;
  bpmMax?: number;
}

export async function fetchRadarTracks(filters: RadarFilters = {}): Promise<RadarTrack[]> {
  await new Promise((r) => setTimeout(r, 700));

  let tracks = mockRadarTracks as RadarTrack[];

  if (filters.minScore !== undefined) {
    tracks = tracks.filter((t) => t.undergroundScore >= filters.minScore!);
  }

  if (filters.bpmMin !== undefined) {
    tracks = tracks.filter((t) => t.bpm >= filters.bpmMin!);
  }

  if (filters.bpmMax !== undefined) {
    tracks = tracks.filter((t) => t.bpm <= filters.bpmMax!);
  }

  return tracks.sort((a, b) => b.undergroundScore - a.undergroundScore);
}

export async function refreshRadarSignals(): Promise<{ added: number; updated: number }> {
  await new Promise((r) => setTimeout(r, 2500));
  return { added: 3, updated: 7 };
}
