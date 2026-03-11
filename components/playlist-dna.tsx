"use client";

import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from "recharts";
import { Users, Tag, Activity, Zap } from "lucide-react";
import { PlaylistDNA as PlaylistDNAType } from "@/types/playlist";

const mockDNA: PlaylistDNAType = {
  topArtists: [
    { name: "Rampa", count: 4 },
    { name: "Ivory (IT)", count: 3 },
    { name: "Hot Natured", count: 3 },
    { name: "Trikk", count: 2 },
    { name: "&ME", count: 2 },
  ],
  topLabels: [
    { name: "Keinemusik", count: 5 },
    { name: "Visionquest", count: 3 },
    { name: "Tsuba", count: 2 },
    { name: "Pets Recordings", count: 2 },
    { name: "Innervisions", count: 2 },
  ],
  bpmCluster: { min: 117, max: 126, avg: 121, dominant: 120 },
  energyProfile: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 8, 7, 6],
  genres: [
    { name: "Deep House", weight: 0.45 },
    { name: "Tech House", weight: 0.28 },
    { name: "Melodic House", weight: 0.17 },
    { name: "Minimal", weight: 0.1 },
  ],
  keyDistribution: [],
  undergroundRatio: 0.78,
  estimatedEra: "2014–2022",
  mood: ["hypnotic", "warm", "late-night", "melodic"],
};

interface PlaylistDNAProps {
  dna?: PlaylistDNAType;
}

const energyData = mockDNA.energyProfile.map((e, i) => ({ i, energy: e }));

export default function PlaylistDNA({ dna = mockDNA }: PlaylistDNAProps) {
  return (
    <div className="space-y-4">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Artists */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10">
              <Users className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500">Artists Detected</span>
          </div>
          <div className="space-y-1.5">
            {dna.topArtists.slice(0, 3).map((a) => (
              <div key={a.name} className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">{a.name}</span>
                <span className="font-mono text-xs text-zinc-600">{a.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-zinc-600">
            +{dna.topArtists.length - 3} more
          </div>
        </div>

        {/* Labels */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10">
              <Tag className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500">Labels Detected</span>
          </div>
          <div className="space-y-1.5">
            {dna.topLabels.slice(0, 3).map((l) => (
              <div key={l.name} className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">{l.name}</span>
                <span className="font-mono text-xs text-zinc-600">{l.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-zinc-600">
            +{dna.topLabels.length - 3} more
          </div>
        </div>

        {/* BPM Cluster */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10">
              <Activity className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500">BPM Cluster</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-3xl font-bold text-white tabular-nums">
              {dna.bpmCluster.dominant}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">
              Range: {dna.bpmCluster.min}–{dna.bpmCluster.max} BPM
            </p>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                style={{
                  width: `${((dna.bpmCluster.avg - dna.bpmCluster.min) / (dna.bpmCluster.max - dna.bpmCluster.min)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Energy profile */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10">
              <Zap className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500">Energy Profile</span>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fill="url(#energyGrad)"
                  dot={false}
                />
                <Tooltip
                  contentStyle={{ background: "#15151B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: "#5EEAD4" }}
                  labelFormatter={() => ""}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[10px] text-zinc-600">
            Peak energy: {Math.max(...dna.energyProfile)}/10
          </p>
        </div>
      </div>

      {/* Genre tags + mood + underground ratio */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Genre distribution */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Genre Tags
          </h4>
          <div className="space-y-2">
            {dna.genres.map((g) => (
              <div key={g.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{g.name}</span>
                  <span className="font-mono text-zinc-600">{Math.round(g.weight * 100)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                    style={{ width: `${g.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood + metadata */}
        <div className="rounded-xl border border-white/8 bg-[#15151B] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Set Mood
          </h4>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {dna.mood.map((m) => (
              <span
                key={m}
                className="rounded-full border border-teal-500/20 bg-teal-500/8 px-2.5 py-1 text-xs text-teal-400"
              >
                {m}
              </span>
            ))}
          </div>
          <div className="space-y-2 border-t border-white/6 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-600">Estimated Era</span>
              <span className="text-zinc-300">{dna.estimatedEra}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-600">Underground Ratio</span>
              <span className="text-teal-400">{Math.round(dna.undergroundRatio * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
