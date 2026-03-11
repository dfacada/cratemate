import { Track } from "./track";

export type PlaylistSource = "spotify" | "soundcloud" | "mixcloud" | "youtube" | "manual";

export interface PlaylistDNA {
  topArtists: { name: string; count: number }[];
  topLabels: { name: string; count: number }[];
  bpmCluster: { min: number; max: number; avg: number; dominant: number };
  energyProfile: number[]; // array of energy values across the set
  genres: { name: string; weight: number }[];
  keyDistribution: { key: string; count: number }[];
  undergroundRatio: number; // 0–1
  estimatedEra: string; // e.g. "2018–2023"
  mood: string[];
}

export interface Playlist {
  id: string;
  name: string;
  source: PlaylistSource;
  sourceUrl?: string;
  trackCount: number;
  tracks: Track[];
  dna?: PlaylistDNA;
  createdAt: string;
  analyzedAt?: string;
}
