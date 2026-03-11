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
                ? "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/30"
                : "border border-black/9 text-[#72727E] hover:border-black/20 hover:text-[#1E1E26]"
            )}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Artist info */}
      {artist && (
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">{artist.name}</h3>
              <p className="text-xs text-[#72727E]">
                {artist.origin} · Active since {artist.activeFrom}
                {artist.activeTo ? `–${artist.activeTo}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {artist.genres.map((g) => (
                  <span key={g} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-[#72727E]">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-white">{artist.trackCount}</p>
              <p className="text-[10px] text-[#9595A0]">tracks</p>
              <p className="mt-1 font-display text-lg font-bold text-orange-600">{artist.gemTracks}</p>
              <p className="text-[10px] text-[#9595A0]">gems</p>
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
                  ? "bg-black/7 text-white"
                  : "text-[#72727E] hover:bg-black/4 hover:text-[#2E2E38]"
              )}
            >
              {f.value === "hidden_gems" && <Gem className="h-3 w-3" />}
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDesc((d) => !d)}
          className="flex items-center gap-1.5 rounded-md border border-black/9 px-3 py-1.5 text-xs text-[#72727E] transition hover:border-black/15 hover:text-[#2E2E38]"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortDesc ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Catalog table */}
      <div className="overflow-hidden rounded-xl border border-black/9 bg-[#D4D4DA]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-[#9595A0]">
            No tracks found for this filter
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/7">
                {["Year", "Track", "Label", "Cat#", "BPM", "Gem Score", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {entries.map((entry) => {
                const isAdded = addedIds.has(entry.id);
                return (
                  <tr key={entry.id} className="group transition hover:bg-black/2">
                    <td className="w-14 px-4 py-3 font-mono text-xs text-[#72727E]">{entry.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1E1E26]">{entry.title}</span>
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
                    <td className="px-4 py-3 text-xs text-[#72727E]">{entry.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9595A0]">{entry.catalogNumber ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#72727E]">{entry.bpm ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-black/6">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
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
                              ? "bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20"
                              : "bg-black/6 text-[#4A4A58] hover:bg-orange-500/15 hover:text-orange-700"
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          {isAdded ? "Added" : "Add"}
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded text-[#B8B8C2] hover:bg-black/6 hover:text-[#4A4A58]">
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
