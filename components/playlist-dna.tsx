"use client";

import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Tag, Activity, Zap } from "lucide-react";
import { PlaylistDNA as PlaylistDNAType } from "@/types/playlist";

const mockDNA: PlaylistDNAType = {
  topArtists: [{ name: "Rampa", count: 4 }, { name: "Ivory (IT)", count: 3 }, { name: "Hot Natured", count: 3 }, { name: "Trikk", count: 2 }, { name: "&ME", count: 2 }],
  topLabels: [{ name: "Keinemusik", count: 5 }, { name: "Visionquest", count: 3 }, { name: "Tsuba", count: 2 }, { name: "Pets Recordings", count: 2 }, { name: "Innervisions", count: 2 }],
  bpmCluster: { min: 117, max: 126, avg: 121, dominant: 120 },
  energyProfile: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 8, 7, 6],
  genres: [{ name: "Deep House", weight: 0.45 }, { name: "Tech House", weight: 0.28 }, { name: "Melodic House", weight: 0.17 }, { name: "Minimal", weight: 0.1 }],
  keyDistribution: [],
  undergroundRatio: 0.78,
  estimatedEra: "2014–2022",
  mood: ["hypnotic", "warm", "late-night", "melodic"],
};

const energyData = mockDNA.energyProfile.map((e, i) => ({ i, energy: e }));

export default function PlaylistDNA({ dna = mockDNA }: { dna?: PlaylistDNAType }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Artists */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10"><Users className="h-3.5 w-3.5 text-cyan-500" /></div>
            <span className="text-xs font-medium text-slate-500">Artists Detected</span>
          </div>
          {dna.topArtists.slice(0, 3).map((a) => (
            <div key={a.name} className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-700">{a.name}</span>
              <span className="font-mono text-xs text-slate-400">{a.count}</span>
            </div>
          ))}
          <div className="mt-1 text-[10px] text-slate-400">+{dna.topArtists.length - 3} more</div>
        </div>

        {/* Labels */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10"><Tag className="h-3.5 w-3.5 text-cyan-500" /></div>
            <span className="text-xs font-medium text-slate-500">Labels Detected</span>
          </div>
          {dna.topLabels.slice(0, 3).map((l) => (
            <div key={l.name} className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-700">{l.name}</span>
              <span className="font-mono text-xs text-slate-400">{l.count}</span>
            </div>
          ))}
          <div className="mt-1 text-[10px] text-slate-400">+{dna.topLabels.length - 3} more</div>
        </div>

        {/* BPM */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10"><Activity className="h-3.5 w-3.5 text-cyan-500" /></div>
            <span className="text-xs font-medium text-slate-500">BPM Cluster</span>
          </div>
          <p className="font-display text-3xl font-bold text-slate-800">{dna.bpmCluster.dominant}</p>
          <p className="mt-0.5 text-xs text-slate-400">Range: {dna.bpmCluster.min}–{dna.bpmCluster.max}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500"
              style={{ width: `${((dna.bpmCluster.avg - dna.bpmCluster.min) / (dna.bpmCluster.max - dna.bpmCluster.min)) * 100}%` }} />
          </div>
        </div>

        {/* Energy */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10"><Zap className="h-3.5 w-3.5 text-cyan-500" /></div>
            <span className="text-xs font-medium text-slate-500">Energy Profile</span>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="energy" stroke="#00B4D8" strokeWidth={2} fill="url(#eg)" dot={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} itemStyle={{ color: "#00B4D8" }} labelFormatter={() => ""} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Peak: {Math.max(...dna.energyProfile)}/10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Genre Tags</h4>
          <div className="space-y-2">
            {dna.genres.map((g) => (
              <div key={g.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{g.name}</span>
                  <span className="font-mono text-slate-400">{Math.round(g.weight * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500" style={{ width: `${g.weight * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Set Mood</h4>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {dna.mood.map((m) => (
              <span key={m} className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-600">{m}</span>
            ))}
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated Era</span>
              <span className="text-slate-700">{dna.estimatedEra}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Underground Ratio</span>
              <span className="font-medium text-cyan-600">{Math.round(dna.undergroundRatio * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
