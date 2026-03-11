"use client";

import { Search, Bell, ChevronDown, Archive } from "lucide-react";
import { useState } from "react";
import { mockCrates } from "@/data/mockCrate";

export default function Topbar() {
  const [activeCrate, setActiveCrate] = useState(mockCrates[0]);
  const [crateOpen, setCrateOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-56 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-[#0E0E10]/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
        <input
          type="text"
          placeholder="Search tracks, artists, labels…"
          className="h-8 w-full rounded-md border border-white/8 bg-white/4 pl-8 pr-3 text-sm text-zinc-300 placeholder-zinc-600 outline-none transition focus:border-teal-500/40 focus:bg-white/6 focus:ring-1 focus:ring-teal-500/20"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-600">
          ⌘K
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Crate selector */}
        <div className="relative">
          <button
            onClick={() => setCrateOpen(!crateOpen)}
            className="flex items-center gap-2 rounded-md border border-white/8 bg-white/4 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/7 hover:border-white/12"
          >
            <Archive className="h-3.5 w-3.5 text-teal-400" />
            <span className="max-w-[140px] truncate">{activeCrate.name}</span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>

          {crateOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-lg border border-white/10 bg-[#15151B] py-1 shadow-2xl shadow-black/60">
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Your Crates
              </p>
              {mockCrates.map((crate) => (
                <button
                  key={crate.id}
                  onClick={() => { setActiveCrate(crate); setCrateOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: crate.color }}
                  />
                  <span className="flex-1 truncate">{crate.name}</span>
                  <span className="text-xs text-zinc-600">{crate.trackIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-white/8 bg-white/4 text-zinc-500 transition hover:bg-white/7 hover:text-zinc-300">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-teal-500" />
        </button>

        {/* Avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-xs font-semibold text-white ring-2 ring-teal-500/20">
          DJ
        </button>
      </div>
    </header>
  );
}
