"use client";

import { useState } from "react";
import { Trash2, Download, ListMusic, ArrowUpDown, Music2 } from "lucide-react";
import { cn, energyColor, gemScoreColor } from "@/lib/utils";
import { mockTracks } from "@/data/mockTracks";
import { Track } from "@/types/track";

const KEY_COLORS: Record<string, string> = {
  "1A": "#FF6B6B", "2A": "#FF8E53", "3A": "#FFC300", "4A": "#C5E336",
  "5A": "#6BCB77", "6A": "#4D96FF", "7A": "#9B72CF", "8A": "#FF6B9D",
  "9A": "#56CFE1", "10A": "#FF9A3C", "11A": "#80F2A6", "12A": "#FFD6A5",
  "1B": "#FF4040", "2B": "#FF6B2B", "3B": "#FFA500", "4B": "#A8E063",
  "5B": "#2ECC40", "6B": "#0074D9", "7B": "#7B2FBE", "8B": "#FF2D6C",
  "9B": "#17B8D1", "10B": "#E07B00", "11B": "#4ADE80", "12B": "#FCC89B",
};

interface CrateTableProps {
  tracks?: Track[];
  onBuildSet?: () => void;
  onExport?: () => void;
}

type SortKey = "artist" | "bpm" | "key" | "energy" | "year";

export default function CrateTable({ tracks = mockTracks.slice(0, 8), onBuildSet, onExport }: CrateTableProps) {
  const [items, setItems] = useState<Track[]>(tracks);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey as keyof Track];
    const bVal = b[sortKey as keyof Track];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal ?? "");
    const bStr = String(bVal ?? "");
    return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const removeTrack = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  const avgBpm = Math.round(items.reduce((a, t) => a + t.bpm, 0) / items.length);
  const avgEnergy = (items.reduce((a, t) => a + t.energy, 0) / items.length).toFixed(1);

  const SortableHeader = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <th
      className="cursor-pointer px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0] hover:text-[#4A4A58]"
      onClick={() => toggleSort(sortBy)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-2.5 w-2.5" />
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Crate stats + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[#72727E]">
          <span className="flex items-center gap-1.5">
            <Music2 className="h-3.5 w-3.5 text-orange-600" />
            <span className="font-semibold text-[#2E2E38]">{items.length}</span> tracks
          </span>
          <span>Avg BPM: <span className="font-mono text-[#2E2E38]">{avgBpm}</span></span>
          <span>Avg Energy: <span className={cn("font-mono", energyColor(parseFloat(avgEnergy)))}>{avgEnergy}</span></span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-md border border-black/10 bg-black/4 px-3 py-1.5 text-xs text-[#4A4A58] transition hover:bg-black/7 hover:text-[#111114]"
          >
            <Download className="h-3.5 w-3.5" />
            Export Playlist
          </button>
          <button
            onClick={onBuildSet}
            className="flex items-center gap-1.5 rounded-md bg-orange-500/15 px-3 py-1.5 text-xs font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30"
          >
            <ListMusic className="h-3.5 w-3.5" />
            Build Set
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-black/9 bg-[#D4D4DA]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/7">
              <th className="w-8 px-4 py-3" />
              <SortableHeader label="Artist" sortBy="artist" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">Track</th>
              <SortableHeader label="BPM" sortBy="bpm" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">Key</th>
              <SortableHeader label="Energy" sortBy="energy" />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">Source</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">Gem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {sorted.map((track, i) => (
              <tr key={track.id} className="group transition hover:bg-black/2">
                <td className="px-4 py-3 font-mono text-xs text-[#B8B8C2]">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-[#1E1E26]">{track.artist}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-[#2E2E38]">{track.title}</span>
                    <span className="ml-2 text-xs text-[#9595A0]">{track.duration}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#4A4A58]">{track.bpm}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                    style={{
                      color: KEY_COLORS[track.key] ?? "#888",
                      backgroundColor: (KEY_COLORS[track.key] ?? "#888") + "18",
                    }}
                  >
                    {track.key}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <div
                          key={j}
                          className={cn(
                            "h-2.5 w-1 rounded-sm",
                            j < track.energy ? "bg-orange-500" : "bg-black/6"
                          )}
                        />
                      ))}
                    </div>
                    <span className={cn("font-mono text-xs", energyColor(track.energy))}>
                      {track.energy}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[9px] uppercase tracking-wide text-[#72727E]">
                    {track.source.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {track.gemScore !== undefined && (
                    <span className={cn("font-mono text-xs font-medium", gemScoreColor(track.gemScore))}>
                      {track.gemScore}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-[#B8B8C2] opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                  >
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
