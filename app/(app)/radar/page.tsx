import RadarCards from "@/components/radar-cards";
import { Radio, Zap, TrendingUp, Activity } from "lucide-react";
import { mockRadarTracks } from "@/data/mockCrate";

const avgScore = Math.round(mockRadarTracks.reduce((a, t) => a + t.undergroundScore, 0) / mockRadarTracks.length);
const totalSignals = mockRadarTracks.reduce((a, t) => a + t.signalCount, 0);

export default function RadarPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Underground Radar</h1>
          <p className="mt-1 text-sm text-[#72727E]">
            Real-time signal detection across SoundCloud, Bandcamp, and DJ charts
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
          Live
        </div>
      </div>

      {/* Signal stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Radio className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">{mockRadarTracks.length}</p>
            <p className="text-xs text-[#72727E]">Tracks on radar</p>
          </div>
        </div>
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Activity className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">{totalSignals.toLocaleString()}</p>
            <p className="text-xs text-[#72727E]">Total signals</p>
          </div>
        </div>
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">{avgScore}</p>
            <p className="text-xs text-[#72727E]">Avg underground score</p>
          </div>
        </div>
      </div>

      {/* Score legend */}
      <div className="flex items-center gap-4 rounded-xl border border-black/9 bg-[#D4D4DA] px-4 py-3">
        <span className="text-xs font-medium text-[#72727E]">Score guide:</span>
        {[
          { range: "90–100", label: "Explosive", color: "text-orange-700" },
          { range: "75–89", label: "Strong signal", color: "text-orange-600" },
          { range: "60–74", label: "Emerging", color: "text-yellow-400" },
          { range: "<60", label: "Early watch", color: "text-[#72727E]" },
        ].map(({ range, label, color }) => (
          <div key={range} className="flex items-center gap-1.5">
            <Zap className={`h-3 w-3 ${color}`} />
            <span className={`text-xs ${color}`}>{range}</span>
            <span className="text-xs text-[#B8B8C2]">· {label}</span>
          </div>
        ))}
      </div>

      <RadarCards />
    </div>
  );
}
