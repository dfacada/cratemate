import Link from "next/link";
import { Search, Archive, Disc3, Radio, TrendingUp, Clock, Gem, ArrowRight, Zap } from "lucide-react";
import { mockTracks } from "@/data/mockTracks";
import { mockCrates } from "@/data/mockCrate";
import { mockRadarTracks } from "@/data/mockCrate";
import { cn, energyColor, gemScoreColor } from "@/lib/utils";

const stats = [
  { label: "Tracks Catalogued", value: "1,284", icon: Disc3, color: "text-teal-400", bg: "bg-teal-500/10" },
  { label: "Active Crates", value: "7", icon: Archive, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Radar Signals", value: "48", icon: Radio, color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Gems Found", value: "93", icon: Gem, color: "text-purple-400", bg: "bg-purple-500/10" },
];

const quickActions = [
  { label: "New Dig", href: "/new-dig", icon: Search, desc: "Start a new crate session" },
  { label: "Open Radar", href: "/radar", icon: Radio, desc: "Scan underground signals" },
  { label: "Build Set", href: "/set-builder", icon: Disc3, desc: "Arrange your crate into a set" },
];

export default function DashboardPage() {
  const recentTracks = mockTracks.slice(0, 5);
  const topCrate = mockCrates[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Good evening, DJ</h1>
        <p className="mt-1 text-sm text-zinc-500">
          You have {mockRadarTracks.filter((t) => t.undergroundScore >= 85).length} high-signal radar hits waiting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-[#15151B] p-4">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-white/8 bg-[#15151B] p-4 transition hover:border-teal-500/30 hover:bg-teal-500/5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/6 ring-1 ring-white/10 transition group-hover:bg-teal-500/15 group-hover:ring-teal-500/30">
              <Icon className="h-4 w-4 text-zinc-400 transition group-hover:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white">{label}</p>
              <p className="text-xs text-zinc-600">{desc}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-teal-500" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent tracks */}
        <div className="lg:col-span-3 rounded-xl border border-white/8 bg-[#15151B] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <h2 className="text-sm font-semibold text-zinc-200">Recent Finds</h2>
            </div>
            <Link href="/crate" className="text-xs text-teal-500 hover:text-teal-400">
              View crate →
            </Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/4">
              {recentTracks.map((track) => (
                <tr key={track.id} className="group transition hover:bg-white/2">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-zinc-200">{track.artist}</p>
                      <p className="text-xs text-zinc-500">{track.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{track.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{track.bpm}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Zap className={cn("h-3 w-3", energyColor(track.energy))} />
                      <span className={cn("font-mono text-xs", energyColor(track.energy))}>{track.energy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {track.gemScore !== undefined && (
                      <span className={cn("font-mono text-xs font-semibold", gemScoreColor(track.gemScore))}>
                        {track.gemScore}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active crate preview */}
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-[#15151B] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-200">Active Crate</h2>
            <Link href="/crate" className="text-xs text-teal-500 hover:text-teal-400">Open →</Link>
          </div>
          <div
            className="mb-3 flex items-center gap-2 rounded-lg p-3"
            style={{ background: `${topCrate.color}14`, border: `1px solid ${topCrate.color}30` }}
          >
            <Archive className="h-4 w-4 shrink-0" style={{ color: topCrate.color }} />
            <div>
              <p className="text-sm font-medium text-white">{topCrate.name}</p>
              <p className="text-xs text-zinc-500">{topCrate.trackIds.length} tracks · Avg {topCrate.avgBpm} BPM</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {(topCrate.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="mr-1.5 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Radar teaser */}
          <div className="mt-4 border-t border-white/6 pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Top Radar Hit
            </p>
            {mockRadarTracks.slice(0, 1).map((t) => (
              <div key={t.id} className="rounded-lg bg-teal-500/8 p-3 ring-1 ring-teal-500/20">
                <p className="text-sm font-medium text-teal-200">{t.artist}</p>
                <p className="text-xs text-teal-400/70">{t.title}</p>
                <p className="mt-1 text-[10px] text-zinc-500">{t.reason.slice(0, 60)}…</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
