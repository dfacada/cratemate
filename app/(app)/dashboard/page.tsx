import Link from "next/link";
import { Search, Archive, Disc3, Radio, TrendingUp, Clock, Gem, ArrowRight, Zap } from "lucide-react";
import { mockTracks } from "@/data/mockTracks";
import { mockCrates } from "@/data/mockCrate";
import { mockRadarTracks } from "@/data/mockCrate";
import { cn, energyColor, gemScoreColor } from "@/lib/utils";

const stats = [
  { label: "Tracks Catalogued", value: "1,284", icon: Disc3, color: "text-orange-600", bg: "bg-orange-500/10" },
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
        <p className="mt-1 text-sm text-[#72727E]">
          You have {mockRadarTracks.filter((t) => t.undergroundScore >= 85).length} high-signal radar hits waiting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-black/9 bg-[#D4D4DA] p-4">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-[#B8B8C2]" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-xs text-[#72727E]">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-black/9 bg-[#D4D4DA] p-4 transition hover:border-orange-500/25 hover:bg-orange-500/5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/5 ring-1 ring-white/10 transition group-hover:bg-orange-500/12 group-hover:ring-orange-500/25">
              <Icon className="h-4 w-4 text-[#4A4A58] transition group-hover:text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1E1E26] group-hover:text-[#111114]">{label}</p>
              <p className="text-xs text-[#9595A0]">{desc}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#B8B8C2] transition group-hover:translate-x-0.5 group-hover:text-orange-600" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent tracks */}
        <div className="lg:col-span-3 rounded-xl border border-black/9 bg-[#D4D4DA] overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/7 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#9595A0]" />
              <h2 className="text-sm font-semibold text-[#1E1E26]">Recent Finds</h2>
            </div>
            <Link href="/crate" className="text-xs text-orange-600 hover:text-orange-600">
              View crate →
            </Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/4">
              {recentTracks.map((track) => (
                <tr key={track.id} className="group transition hover:bg-black/2">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[#1E1E26]">{track.artist}</p>
                      <p className="text-xs text-[#72727E]">{track.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9595A0]">{track.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#72727E]">{track.bpm}</td>
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
        <div className="lg:col-span-2 rounded-xl border border-black/9 bg-[#D4D4DA] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1E1E26]">Active Crate</h2>
            <Link href="/crate" className="text-xs text-orange-600 hover:text-orange-600">Open →</Link>
          </div>
          <div
            className="mb-3 flex items-center gap-2 rounded-lg p-3"
            style={{ background: `${topCrate.color}14`, border: `1px solid ${topCrate.color}30` }}
          >
            <Archive className="h-4 w-4 shrink-0" style={{ color: topCrate.color }} />
            <div>
              <p className="text-sm font-medium text-white">{topCrate.name}</p>
              <p className="text-xs text-[#72727E]">{topCrate.trackIds.length} tracks · Avg {topCrate.avgBpm} BPM</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {(topCrate.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="mr-1.5 inline-block rounded-full border border-black/10 px-2 py-0.5 text-[10px] text-[#72727E]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Radar teaser */}
          <div className="mt-4 border-t border-black/7 pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">
              Top Radar Hit
            </p>
            {mockRadarTracks.slice(0, 1).map((t) => (
              <div key={t.id} className="rounded-lg bg-orange-500/8 p-3 ring-1 ring-orange-500/20">
                <p className="text-sm font-medium text-orange-700">{t.artist}</p>
                <p className="text-xs text-orange-500/70">{t.title}</p>
                <p className="mt-1 text-[10px] text-[#72727E]">{t.reason.slice(0, 60)}…</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
