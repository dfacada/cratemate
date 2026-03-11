"use client";

import { useState } from "react";
import { Radio, Plus, ExternalLink, Zap, RefreshCw, Loader2 } from "lucide-react";
import { cn, energyColor } from "@/lib/utils";
import { mockRadarTracks } from "@/data/mockCrate";

type RadarSource = "all" | "soundcloud" | "bandcamp" | "dj_charts";

const SOURCE_FILTERS: { label: string; value: RadarSource }[] = [
  { label: "All Signals", value: "all" },
  { label: "SoundCloud", value: "soundcloud" },
  { label: "Bandcamp", value: "bandcamp" },
  { label: "DJ Charts", value: "dj_charts" },
];

function UndergroundScore({ score }: { score: number }) {
  const rings = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      {Array.from({ length: rings }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 animate-ping rounded-full bg-teal-500/20"
          style={{ animationDelay: `${i * 0.4}s`, animationDuration: "2s" }}
        />
      ))}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/40">
        <span className="font-mono text-[10px] font-bold text-teal-300">{score}</span>
      </div>
    </div>
  );
}

export default function RadarCards() {
  const [sourceFilter, setSourceFilter] = useState<RadarSource>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = mockRadarTracks.filter((t) => {
    if (sourceFilter === "all") return true;
    if (sourceFilter === "soundcloud") return t.source.toLowerCase().includes("soundcloud");
    if (sourceFilter === "bandcamp") return t.source.toLowerCase().includes("bandcamp");
    if (sourceFilter === "dj_charts") return t.source.toLowerCase().includes("dj chart");
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 ring-1 ring-teal-500/30">
            <Radio className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Underground Radar</h2>
            <p className="text-xs text-zinc-500">Live signal detection · Updated hourly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Source filters */}
          <div className="flex rounded-lg border border-white/8 bg-white/3 p-0.5">
            {SOURCE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSourceFilter(f.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs transition",
                  sourceFilter === f.value
                    ? "bg-white/10 text-white"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/3 text-zinc-500 transition hover:bg-white/8 hover:text-zinc-300 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {filtered.map((track) => (
          <div
            key={track.id}
            className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#15151B] p-4 transition hover:border-white/15 hover:shadow-lg"
          >
            {/* Subtle glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-teal-500/0 transition group-hover:bg-teal-500/3" />

            <div className="relative flex items-start gap-3">
              {/* Underground score */}
              <UndergroundScore score={track.undergroundScore} />

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-white">{track.artist}</p>
                    <p className="text-sm text-zinc-400">{track.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setAddedIds((prev) => new Set([...prev, track.id]))}
                      disabled={addedIds.has(track.id)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md transition",
                        addedIds.has(track.id)
                          ? "bg-teal-500/10 text-teal-400"
                          : "bg-white/6 text-zinc-500 hover:bg-teal-500/20 hover:text-teal-300"
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white/6 text-zinc-600 transition hover:bg-white/10 hover:text-zinc-300">
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="font-mono text-zinc-600">{track.bpm} BPM</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-zinc-600">{track.key}</span>
                  <span className="text-zinc-700">·</span>
                  <span className={cn("font-mono", energyColor(track.energy))}>
                    <Zap className="mr-0.5 inline-block h-2.5 w-2.5" />
                    {track.energy}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="rounded-full bg-teal-500/10 px-1.5 py-0.5 text-teal-500">
                    {track.source}
                  </span>
                </div>

                {/* Reason */}
                <p className="mt-2.5 rounded-md bg-white/4 px-2.5 py-2 text-xs leading-relaxed text-zinc-400">
                  {track.reason}
                </p>

                {/* Signal count + date */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
                  <span>{track.signalCount} signals detected</span>
                  <span>Detected {track.detectedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-zinc-600">
          No signals detected for this filter
        </div>
      )}
    </div>
  );
}
