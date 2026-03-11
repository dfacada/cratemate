"use client";

import { useState } from "react";
import { Trash2, Download, ListMusic, ArrowUpDown, Music2, Zap } from "lucide-react";
import { cn, energyColor, gemScoreColor } from "@/lib/utils";
import { mockTracks } from "@/data/mockTracks";
import { Track } from "@/types/track";

const KEY_COLORS: Record<string, string> = {
  "1A":"#FF6B6B","2A":"#FF8E53","3A":"#FFC300","4A":"#C5E336","5A":"#6BCB77",
  "6A":"#4D96FF","7A":"#9B72CF","8A":"#FF6B9D","9A":"#56CFE1","10A":"#FF9A3C",
  "11A":"#80F2A6","12A":"#FFD6A5","1B":"#FF4040","2B":"#FF6B2B","3B":"#FFA500",
  "4B":"#A8E063","5B":"#2ECC40","6B":"#0074D9","7B":"#7B2FBE","8B":"#FF2D6C",
  "9B":"#17B8D1","10B":"#E07B00","11B":"#4ADE80","12B":"#FCC89B",
};

type SortKey = "artist" | "bpm" | "key" | "energy" | "year";

export default function CrateTable({ tracks = mockTracks.slice(0, 8), onBuildSet, onExport }: { tracks?: Track[]; onBuildSet?: () => void; onExport?: () => void }) {
  const [items, setItems] = useState<Track[]>(tracks);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey as keyof Track], bv = b[sortKey as keyof Track];
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc" ? String(av ?? "").localeCompare(String(bv ?? "")) : String(bv ?? "").localeCompare(String(av ?? ""));
  });

  const avgBpm = Math.round(items.reduce((a, t) => a + t.bpm, 0) / items.length);
  const avgEnergy = (items.reduce((a, t) => a + t.energy, 0) / items.length).toFixed(1);

  const SortableHeader = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <th className="cursor-pointer px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600" onClick={() => toggleSort(sortBy)}>
      <div className="flex items-center gap-1">{label}<ArrowUpDown className="h-2.5 w-2.5" /></div>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Music2 className="h-3.5 w-3.5 text-cyan-500" /><span className="font-semibold text-slate-700">{items.length}</span> tracks</span>
          <span>Avg BPM: <span className="font-mono text-slate-700">{avgBpm}</span></span>
          <span>Avg Energy: <span className={cn("font-mono", energyColor(parseFloat(avgEnergy)))}>{avgEnergy}</span></span>
        </div>
        <div className="flex gap-2">
          <button onClick={onExport} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export Playlist
          </button>
          <button onClick={onBuildSet} className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-cyan-600">
            <ListMusic className="h-3.5 w-3.5" /> Build Set
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-8 px-4 py-3" />
              <SortableHeader label="Artist" sortBy="artist" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">Track</th>
              <SortableHeader label="BPM" sortBy="bpm" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">Key</th>
              <SortableHeader label="Energy" sortBy="energy" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">Source</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">Gem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((track, i) => (
              <tr key={track.id} className="group transition hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{track.artist}</td>
                <td className="px-4 py-3">
                  <div><span className="text-slate-600">{track.title}</span><span className="ml-2 text-xs text-slate-400">{track.duration}</span></div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{track.bpm}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold" style={{ color: KEY_COLORS[track.key] ?? "#888", backgroundColor: (KEY_COLORS[track.key] ?? "#888") + "20" }}>
                    {track.key}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <div key={j} className={cn("h-2.5 w-1 rounded-sm", j < track.energy ? "bg-cyan-400" : "bg-slate-100")} />
                      ))}
                    </div>
                    <span className={cn("font-mono text-xs", energyColor(track.energy))}>{track.energy}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-500">{track.source.replace(/_/g, " ")}</span>
                </td>
                <td className="px-4 py-3">
                  {track.gemScore !== undefined && <span className={cn("font-mono text-xs font-semibold", gemScoreColor(track.gemScore))}>{track.gemScore}</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setItems((p) => p.filter((t) => t.id !== track.id))}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
