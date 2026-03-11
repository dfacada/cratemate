"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, ArrowUpDown, Gem, Loader2 } from "lucide-react";
import { cn, gemScoreColor } from "@/lib/utils";
import { mockArtists, mockCatalogEntries } from "@/data/mockArtists";
import { ArtistCatalogEntry } from "@/types/artist";
import PlayButton from "@/components/play-button";

type FilterMode = "all" | "originals" | "remixes" | "collaborations" | "hidden_gems";
const FILTERS: { label: string; value: FilterMode }[] = [
  { label: "All", value: "all" }, { label: "Originals", value: "originals" },
  { label: "Remixes", value: "remixes" }, { label: "Collaborations", value: "collaborations" },
  { label: "Hidden Gems", value: "hidden_gems" },
];

export default function ArtistMiner({ defaultArtistId = "a001", onAddToCrate }: {
  defaultArtistId?: string; onAddToCrate?: (e: ArtistCatalogEntry) => void;
}) {
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
      result = [...result].sort((a, b) => sortDesc ? b.year - a.year : a.year - b.year);
      setEntries(result);
      setLoading(false);
    }, 400);
  }, [selectedArtistId, filter, sortDesc]);

  return (
    <div className="space-y-4">
      {/* Artist pills */}
      <div className="flex flex-wrap items-center gap-2">
        {mockArtists.slice(0, 4).map((a) => (
          <button key={a.id} onClick={() => setSelectedArtistId(a.id)}
            className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition",
              selectedArtistId === a.id
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/30"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
            )}>{a.name}</button>
        ))}
      </div>

      {/* Artist info card */}
      {artist && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-800">{artist.name}</h3>
              <p className="text-xs text-slate-500">{artist.origin} · Active since {artist.activeFrom}{artist.activeTo ? `–${artist.activeTo}` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {artist.genres.map((g) => (
                  <span key={g} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{g}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-slate-800">{artist.trackCount}</p>
              <p className="text-[10px] text-slate-400">tracks</p>
              <p className="mt-1 font-display text-lg font-bold text-cyan-600">{artist.gemTracks}</p>
              <p className="text-[10px] text-slate-400">gems</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter + sort bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition",
                filter === f.value ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}>
              {f.value === "hidden_gems" && <Gem className="h-3 w-3" />}{f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setSortDesc((d) => !d)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm transition hover:bg-slate-50">
          <ArrowUpDown className="h-3 w-3" />{sortDesc ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Catalog table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-cyan-500" /></div>
        ) : entries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">No tracks found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-10 px-4 py-3" />
                {["Year", "Track", "Label", "Cat#", "BPM", "Gem Score", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const isAdded = addedIds.has(entry.id);
                const artistName = artist?.name ?? "";
                return (
                  <tr key={entry.id} className="group transition hover:bg-slate-50/60">
                    <td className="px-4 py-2.5">
                      <PlayButton track={{ id: entry.id, artist: artistName, title: entry.title, label: entry.label, bpm: entry.bpm, energy: entry.energy }} />
                    </td>
                    <td className="w-14 px-4 py-2.5 font-mono text-xs text-slate-400">{entry.year}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{entry.title}</span>
                        {entry.isRemix && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-medium text-purple-600">REMIX</span>}
                        {entry.isCollaboration && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">COLLAB</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{entry.label}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{entry.catalogNumber ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{entry.bpm ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500" style={{ width: `${entry.gemScore}%` }} />
                        </div>
                        <span className={cn("font-mono text-xs", gemScoreColor(entry.gemScore))}>{entry.gemScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => { setAddedIds((p) => new Set([...p, entry.id])); onAddToCrate?.(entry); }} disabled={isAdded}
                          className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                            isAdded ? "bg-cyan-50 text-cyan-600" : "bg-slate-100 text-slate-600 hover:bg-cyan-500 hover:text-white"
                          )}>
                          <Plus className="h-3 w-3" />{isAdded ? "Added" : "Add"}
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-500">
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
