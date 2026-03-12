// Crate storage — localStorage backed

export interface CrateTrack {
  artist: string;
  title:  string;
  label?: string;
  bpm?:   number;
  key?:   string;
  year?:  number;
  genre?: string;
  source: "original" | "added"; // original = from input playlist, added = user-selected rec
}

export interface Crate {
  id:        string;
  name:      string;
  createdAt: number;
  tracks:    CrateTrack[];
  sourceUrl?: string;
}

const KEY = "cratemate_crates";

export function getCrates(): Crate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch { return []; }
}

export function saveCrate(crate: Crate): void {
  const crates = getCrates().filter(c => c.id !== crate.id);
  localStorage.setItem(KEY, JSON.stringify([crate, ...crates]));
}

export function deleteCrate(id: string): void {
  const crates = getCrates().filter(c => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(crates));
}

export function newCrateId(): string {
  return `crate_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
