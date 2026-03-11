"use client";

import { useState } from "react";
import { Wand2, GripVertical, Clock, Zap, TrendingUp } from "lucide-react";
import { cn, energyColor } from "@/lib/utils";
import { mockSetTracks } from "@/data/mockCrate";
import { Track } from "@/types/track";

type SetPhase = "warmup" | "groove" | "build" | "peak" | "close";

interface SetTrack extends Track {
  position: number;
  phase: SetPhase;
}

const PHASES: { key: SetPhase; label: string; color: string; gradient: string }[] = [
  { key: "warmup", label: "Warmup", color: "text-blue-400", gradient: "from-blue-100 to-blue-50" },
  { key: "groove", label: "Groove", color: "text-orange-600", gradient: "from-orange-500/15 to-teal-500/5" },
  { key: "build", label: "Build", color: "text-yellow-400", gradient: "from-yellow-100 to-yellow-50" },
  { key: "peak", label: "Peak", color: "text-orange-400", gradient: "from-red-100 to-red-50" },
  { key: "close", label: "Close", color: "text-purple-400", gradient: "from-purple-100 to-purple-50" },
];

export default function SetBuilder() {
  const [tracks, setTracks] = useState<SetTrack[]>(mockSetTracks as SetTrack[]);
  const [building, setBuilding] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const tracksByPhase = (phase: SetPhase) => tracks.filter((t) => t.phase === phase);

  const handleAutoBuild = async () => {
    setBuilding(true);
    await new Promise((r) => setTimeout(r, 1800));
    // Stub: reassign phases based on energy
    const sorted = [...tracks].sort((a, b) => a.energy - b.energy);
    const phases: SetPhase[] = ["warmup", "groove", "build", "peak", "close"];
    const chunkSize = Math.ceil(sorted.length / phases.length);
    const rebuilt = sorted.map((t, i) => ({
      ...t,
      phase: phases[Math.min(Math.floor(i / chunkSize), phases.length - 1)],
      position: i + 1,
    }));
    setTracks(rebuilt);
    setBuilding(false);
  };

  const totalDuration = tracks.length * 7; // rough minutes estimate

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Set Builder</h2>
          <p className="mt-0.5 text-xs text-[#72727E]">
            {tracks.length} tracks · ~{totalDuration} min
          </p>
        </div>
        <button
          onClick={handleAutoBuild}
          disabled={building}
          className="flex items-center gap-2 rounded-lg bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30 disabled:opacity-50"
        >
          <Wand2 className={cn("h-4 w-4", building && "animate-spin")} />
          {building ? "Building…" : "Auto Build Set"}
        </button>
      </div>

      {/* Energy arc visualization */}
      <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9595A0]">
          Energy Arc
        </h3>
        <div className="flex items-end gap-1 h-16">
          {tracks.map((t) => (
            <div
              key={t.id}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-orange-600/80 to-orange-400/40 transition-all"
              style={{ height: `${(t.energy / 10) * 100}%` }}
              title={`${t.artist} — ${t.title} (Energy: ${t.energy})`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#B8B8C2]">
          <span>Start</span>
          <span>Peak</span>
          <span>End</span>
        </div>
      </div>

      {/* Phase columns */}
      <div className="grid grid-cols-5 gap-3">
        {PHASES.map((phase) => {
          const phaseTracks = tracksByPhase(phase.key);
          return (
            <div
              key={phase.key}
              className={cn(
                "rounded-xl border border-black/9 bg-gradient-to-b p-3",
                phase.gradient
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggingId) return;
                setTracks((prev) =>
                  prev.map((t) =>
                    t.id === draggingId ? { ...t, phase: phase.key } : t
                  )
                );
                setDraggingId(null);
              }}
            >
              {/* Phase header */}
              <div className="mb-3 border-b border-black/9 pb-2">
                <p className={cn("text-xs font-semibold uppercase tracking-widest", phase.color)}>
                  {phase.label}
                </p>
                <p className="text-[10px] text-[#9595A0]">{phaseTracks.length} tracks</p>
              </div>

              {/* Track cards */}
              <div className="space-y-2">
                {phaseTracks.map((track) => (
                  <div
                    key={track.id}
                    draggable
                    onDragStart={() => setDraggingId(track.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      "group cursor-grab rounded-lg border border-black/9 bg-[#E2E2E6]/60 p-2.5 transition active:cursor-grabbing",
                      draggingId === track.id && "opacity-40 ring-1 ring-teal-500/50"
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-[#B8B8C2] group-hover:text-[#72727E]" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[#1E1E26]">{track.artist}</p>
                        <p className="truncate text-[10px] text-[#72727E]">{track.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="flex items-center gap-0.5 font-mono text-[9px] text-[#9595A0]">
                            <Clock className="h-2.5 w-2.5" />
                            {track.bpm}
                          </span>
                          <span className={cn("flex items-center gap-0.5 font-mono text-[9px]", energyColor(track.energy))}>
                            <Zap className="h-2.5 w-2.5" />
                            {track.energy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {phaseTracks.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-black/9 text-[10px] text-[#B8B8C2]">
                    Drop tracks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Set stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: "Est. Duration", value: `~${totalDuration} min` },
          { icon: Zap, label: "Peak Energy", value: Math.max(...tracks.map((t) => t.energy)).toString() },
          { icon: TrendingUp, label: "BPM Range", value: `${Math.min(...tracks.map((t) => t.bpm))}–${Math.max(...tracks.map((t) => t.bpm))}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-black/9 bg-[#D4D4DA] p-3">
            <Icon className="h-4 w-4 shrink-0 text-orange-600" />
            <div>
              <p className="text-[10px] text-[#9595A0]">{label}</p>
              <p className="font-display text-sm font-semibold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
