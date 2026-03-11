import { ArtistCatalogEntry } from "@/types/artist";
import { mockCatalogEntries } from "@/data/mockArtists";

/**
 * Artist Miner — Stub implementation
 * In production, this would crawl Discogs, Beatport, and SoundCloud APIs
 * to build a comprehensive discography with gem scoring.
 */

export type MineFilter = "all" | "originals" | "remixes" | "collaborations" | "hidden_gems";

export interface MineOptions {
  artistId: string;
  filter?: MineFilter;
  sortOrder?: "asc" | "desc";
  minGemScore?: number;
  yearFrom?: number;
  yearTo?: number;
}

export async function mineArtistCatalog(
  options: MineOptions
): Promise<ArtistCatalogEntry[]> {
  await new Promise((r) => setTimeout(r, 900));

  let entries = mockCatalogEntries.filter((e) => e.artistId === options.artistId);

  if (options.filter === "originals") {
    entries = entries.filter((e) => !e.isRemix && !e.isCollaboration);
  } else if (options.filter === "remixes") {
    entries = entries.filter((e) => e.isRemix);
  } else if (options.filter === "collaborations") {
    entries = entries.filter((e) => e.isCollaboration);
  } else if (options.filter === "hidden_gems") {
    entries = entries.filter((e) => e.gemScore >= 85);
  }

  if (options.minGemScore !== undefined) {
    entries = entries.filter((e) => e.gemScore >= options.minGemScore!);
  }

  if (options.yearFrom) {
    entries = entries.filter((e) => e.year >= options.yearFrom!);
  }

  if (options.yearTo) {
    entries = entries.filter((e) => e.year <= options.yearTo!);
  }

  entries.sort((a, b) =>
    options.sortOrder === "desc" ? b.year - a.year : a.year - b.year
  );

  return entries;
}

/**
 * Score a track on its underground gem potential.
 * Returns 0–100. Higher = more worth digging.
 */
export function computeGemScore(entry: {
  year: number;
  label: string;
  isRemix: boolean;
  catalogNumber?: string;
}): number {
  let score = 50;

  // Older tracks on indie labels score higher
  const age = new Date().getFullYear() - entry.year;
  score += Math.min(age * 2, 20);

  if (!entry.isRemix) score += 10;
  if (entry.catalogNumber) score += 5;

  return Math.min(score, 100);
}
