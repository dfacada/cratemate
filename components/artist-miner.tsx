"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Filter, ArrowUpDown, Gem, Loader2 } from "lucide-react";
import { cn, gemScoreColor } from "@/lib/utils";
import { mockArtists, mockCatalogEntries } from "@/data/mockArtists";
import { ArtistCatalogEntry } from "@/types/artist";

type FilterMode = "all" | "originals" | "remixes" | "collaborations" | "hidden_gems";

const FILTERS: { label: string; value: FilterMode }[] = [
  { label: "All", value: "all" },
  { label: "Originals", value: "originals" },
  { label: "Remixes", value: "remixes" },
  { label: "Collaborations", value: "collaborations" },
  { label: "Hidden Gems", value: "hidden_gems" },
];

interface ArtistMinerProps {
  defaultArtistId?: string;
  onAddToCrate?: (entry: ArtistCatalogEntry) => void;
}

export default function ArtistMiner({ defaultArtistId = "a001", onAddToCrate }: ArtistMinerProps) {
  const [selectedArtistId, setSelectedArtistId] = useState(defaultArtistId);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortDesc, setSortDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ArtistCatalogEntry[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const artist = mockArtists.find((a) => a.id === selectedArtistId);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let result = mockCatalogEntries.filter((e) => e.artistId === selectedArtistId);
      if (filter === "originals") result = result.filter((e) => !e.isRemix && !e.isCollaboration);
      if (filter === "remixes") result = result.filter((e) => e.isRemix);
      if (filter === "collaborations") result = result.filter((e) => e.isCollaboration);
      if (filter === "hidden_gems") result = result.filter((e) => e.gemScore >= 85);
      result = [...result].sort((a, b) => (sortDesc ? b.year - a.year : a.year - b.year));
      setEntries(result);
      setLoading(false);
    }, 400);
  }, [selectedArtistId, filter, sortDesc]);

  const handleAdd = (entry: ArtistCatalogEntry) => {
    setAddedIds((prev) => new Set([...prev, entry.id]));
    onAddToCrate?.(entry);
  };

  return (
    <div className="space-y-4">
      {/* Artist selector */}
      <div className="flex flex-wrap items-center gap-2">
        {mockArtists.slice(0, 4).map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedArtistId(a.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              selectedArtistId === a.id
                ? "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40"
                : "border border-white/8 text-zinc-500 hover:border-white/20 hover:text-zinc-200"
            )}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Artist info */}
      {artist && (
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">{artist.name}</h3>
              <p className="text-xs text-zinc-500">
                {artist.origin} · Active since {artist.activeFrom}
                {artist.activeTo ? `–${artist.activeTo}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {artist.genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-zinc-500">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-white">{artist.trackCount}</p>
              <p className="text-[10px] text-zinc-600">tracks</p>
              <p className="mt-1 font-display text-lg font-bold text-teal-400">{artist.gemTracks}</p>
              <p className="text-[10px] text-zinc-600">gems</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters + sort */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition",
                filter === f.value
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              )}
            >
              {f.value === "hidden_gems" && <Gem className="h-3 w-3" />}
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDesc((d) => !d)}
          className="flex items-center gap-1.5 rounded-md border border-white/8 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-white/15 hover:text-zinc-300"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortDesc ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Catalog table */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-[#15151B]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-600">
            No tracks found for this filter
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                {["Year", "Track", "Label", "Cat#", "BPM", "Gem Score", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {entries.map((entry) => {
                const isAdded = addedIds.has(entry.id);
                return (
                  <tr key={entry.id} className="group transition hover:bg-white/2">
                    <td className="w-14 px-4 py-3 font-mono text-xs text-zinc-500">{entry.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{entry.title}</span>
                        {entry.isRemix && (
                          <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-medium text-purple-400">
                            REMIX
                          </span>
                        )}
                        {entry.isCollaboration && (
                          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
                            COLLAB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{entry.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{entry.catalogNumber ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{entry.bpm ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                            style={{ width: `${entry.gemScore}%` }}
                          />
                        </div>
                        <span className={cn("font-mono text-xs", gemScoreColor(entry.gemScore))}>
                          {entry.gemScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => handleAdd(entry)}
                          disabled={isAdded}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
                            isAdded
                              ? "bg-teal-500/10 text-teal-500 ring-1 ring-teal-500/20"
                              : "bg-white/8 text-zinc-400 hover:bg-teal-500/20 hover:text-teal-300"
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          {isAdded ? "Added" : "Add"}
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded text-zinc-700 hover:bg-white/8 hover:text-zinc-400">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
