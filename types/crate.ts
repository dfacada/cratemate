import { Track } from "./track";

export interface Crate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  trackIds: string[];
  tracks?: Track[];
  color?: string; // accent color for visual identity
  tags?: string[];
  avgBpm?: number;
  bpmRange?: [number, number];
  energyProfile?: "warming" | "peaking" | "mixed" | "closing";
}

export interface CrateTrack extends Track {
  addedAt: string;
  position?: number;
  notes?: string;
}
