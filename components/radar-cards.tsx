"use client";

import { useState } from "react";
import { Radio, Plus, ExternalLink, Zap, RefreshCw, Loader2 } from "lucide-react";
import { cn, energyColor } from "@/lib/utils";
import { mockRadarTracks } from "@/data/mockCrate";

type RadarSource = "all" | "soundcloud" | "bandcamp" | "dj_charts";
const SOURCE_FILTERS: { label: string; value: RadarSource }[] = [
  { label: "All Signals", value: "all" }, { label: "SoundCloud", value: "soundcloud" },
  { label: "Bandcamp", value: "bandcamp" }, { label: "DJ Charts", value: "dj_charts" },
];

function UndergroundScore({ score }: { score: number }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      {score >= 85 && <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" style={{ animationDuration: "2s" }} />}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
        <span className="font-mono text-[10px] font-bold text-cyan-600">{score}</span>
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20"><Radio className="h-4 w-4 text-cyan-500" /></div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Underground Radar</h2>
            <p className="text-xs text-slate-500">Live signal detection · Updated hourly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {SOURCE_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setSourceFilter(f.value)}
                className={cn("rounded-md px-3 py-1 text-xs transition",
                  sourceFilter === f.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}>{f.label}</button>
            ))}
          </div>
          <button onClick={async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1500)); setRefreshing(false); }}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((track) => (
          <div key={track.id} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-500/5">
            <div className="flex items-start gap-3">
              <UndergroundScore score={track.undergroundScore} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-slate-800">{track.artist}</p>
                    <p className="text-sm text-slate-500">{track.title}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setAddedIds((p) => new Set([...p, track.id]))} disabled={addedIds.has(track.id)}
                      className={cn("flex h-7 w-7 items-center justify-center rounded-lg transition",
                        addedIds.has(track.id) ? "bg-cyan-50 text-cyan-500" : "bg-slate-100 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600"
                      )}><Plus className="h-3.5 w-3.5" /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition hover:bg-slate-200">
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="font-mono text-slate-400">{track.bpm} BPM</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-400">{track.key}</span>
                  <span className="text-slate-300">·</span>
                  <span className={cn("font-mono", energyColor(track.energy))}><Zap className="mr-0.5 inline-block h-2.5 w-2.5" />{track.energy}</span>
                  <span className="rounded-full bg-cyan-50 px-1.5 py-0.5 text-cyan-600">{track.source}</span>
                </div>
                <p className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-500">{track.reason}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{track.signalCount} signals detected</span>
                  <span>Detected {track.detectedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
