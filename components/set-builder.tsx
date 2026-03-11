"use client";

import { useState } from "react";
import { Wand2, GripVertical, Clock, Zap, TrendingUp } from "lucide-react";
import { cn, energyColor } from "@/lib/utils";
import { mockSetTracks } from "@/data/mockCrate";
import { Track } from "@/types/track";

type SetPhase = "warmup" | "groove" | "build" | "peak" | "close";
interface SetTrack extends Track { position: number; phase: SetPhase; }

const PHASES: { key: SetPhase; label: string; color: string; bg: string; border: string }[] = [
  { key: "warmup", label: "Warmup", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
  { key: "groove", label: "Groove", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { key: "build", label: "Build", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { key: "peak", label: "Peak", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  { key: "close", label: "Close", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
];

export default function SetBuilder() {
  const [tracks, setTracks] = useState<SetTrack[]>(mockSetTracks as SetTrack[]);
  const [building, setBuilding] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleAutoBuild = async () => {
    setBuilding(true);
    await new Promise(r => setTimeout(r, 1800));
    const sorted = [...tracks].sort((a, b) => a.energy - b.energy);
    const phases: SetPhase[] = ["warmup", "groove", "build", "peak", "close"];
    const chunkSize = Math.ceil(sorted.length / phases.length);
    setTracks(sorted.map((t, i) => ({ ...t, phase: phases[Math.min(Math.floor(i / chunkSize), phases.length - 1)], position: i + 1 })));
    setBuilding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-800">Set Builder</h2>
          <p className="mt-0.5 text-xs text-slate-500">{tracks.length} tracks · ~{tracks.length * 7} min</p>
        </div>
        <button onClick={handleAutoBuild} disabled={building}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-600 disabled:opacity-50">
          <Wand2 className={cn("h-4 w-4", building && "animate-spin")} />
          {building ? "Building…" : "Auto Build Set"}
        </button>
      </div>

      {/* Energy arc */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Energy Arc</h3>
        <div className="flex items-end gap-1 h-16">
          {tracks.map((t) => (
            <div key={t.id} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500 to-cyan-300 transition-all" style={{ height: `${(t.energy / 10) * 100}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Start</span><span>Peak</span><span>End</span></div>
      </div>

      {/* Phase columns */}
      <div className="grid grid-cols-5 gap-3">
        {PHASES.map((phase) => {
          const phaseTracks = tracks.filter((t) => t.phase === phase.key);
          return (
            <div key={phase.key} className={cn("rounded-xl border p-3", phase.bg, phase.border)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (!draggingId) return; setTracks((p) => p.map((t) => t.id === draggingId ? { ...t, phase: phase.key } : t)); setDraggingId(null); }}>
              <div className="mb-3 border-b border-black/6 pb-2">
                <p className={cn("text-xs font-semibold uppercase tracking-widest", phase.color)}>{phase.label}</p>
                <p className="text-[10px] text-slate-400">{phaseTracks.length} tracks</p>
              </div>
              <div className="space-y-2">
                {phaseTracks.map((track) => (
                  <div key={track.id} draggable onDragStart={() => setDraggingId(track.id)} onDragEnd={() => setDraggingId(null)}
                    className={cn("group cursor-grab rounded-lg border border-white bg-white p-2.5 shadow-sm transition active:cursor-grabbing hover:shadow-md",
                      draggingId === track.id && "opacity-40 ring-1 ring-cyan-400/50"
                    )}>
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-slate-300 group-hover:text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-700">{track.artist}</p>
                        <p className="truncate text-[10px] text-slate-400">{track.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="flex items-center gap-0.5 font-mono text-[9px] text-slate-400"><Clock className="h-2.5 w-2.5" />{track.bpm}</span>
                          <span className={cn("flex items-center gap-0.5 font-mono text-[9px]", energyColor(track.energy))}><Zap className="h-2.5 w-2.5" />{track.energy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {phaseTracks.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400">Drop tracks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: "Est. Duration", value: `~${tracks.length * 7} min` },
          { icon: Zap, label: "Peak Energy", value: Math.max(...tracks.map((t) => t.energy)).toString() },
          { icon: TrendingUp, label: "BPM Range", value: `${Math.min(...tracks.map((t) => t.bpm))}–${Math.max(...tracks.map((t) => t.bpm))}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Icon className="h-4 w-4 shrink-0 text-cyan-500" />
            <div>
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="font-display text-sm font-semibold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
