export type MusicalKey =
  | "1A" | "2A" | "3A" | "4A" | "5A" | "6A" | "7A" | "8A" | "9A" | "10A" | "11A" | "12A"
  | "1B" | "2B" | "3B" | "4B" | "5B" | "6B" | "7B" | "8B" | "9B" | "10B" | "11B" | "12B";

export type TrackSource =
  | "ocr_screenshot"
  | "playlist_link"
  | "manual"
  | "artist_miner"
  | "underground_radar";

export interface Track {
  id: string;
  title: string;
  artist: string;
  label: string;
  year: number;
  bpm: number;
  key: MusicalKey;
  energy: number; // 1–10
  duration: string; // e.g. "6:24"
  genre: string[];
  source: TrackSource;
  gemScore?: number; // 0–100, AI-assigned underground gem rating
  isRemix: boolean;
  remixArtist?: string;
  isCollaboration: boolean;
  collaborators?: string[];
  catalogNumber?: string;
  beatportUrl?: string;
  soundcloudUrl?: string;
  notes?: string;
}

export interface OcrTrack extends Omit<Track, "id" | "bpm" | "key" | "energy" | "duration" | "genre" | "source" | "gemScore"> {
  id: string;
  rawText: string;
  confidence: number; // 0–1
  verified: boolean;
  bpm?: number;
  key?: MusicalKey;
  energy?: number;
  duration?: string;
  genre?: string[];
}
