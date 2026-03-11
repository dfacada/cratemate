"use client";

import { Search, Bell, ChevronDown, Archive } from "lucide-react";
import { useState } from "react";
import { mockCrates } from "@/data/mockCrate";

export default function Topbar() {
  const [activeCrate, setActiveCrate] = useState(mockCrates[0]);
  const [crateOpen, setCrateOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-56 z-30 flex h-14 items-center justify-between border-b border-black/10 bg-[#D4D4DA]/90 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9595A0]" />
        <input
          type="text"
          placeholder="Search tracks, artists, labels…"
          className="h-8 w-full rounded-md border border-black/10 bg-black/5 pl-8 pr-3 text-sm text-[#2E2E38] placeholder-[#B8B8C2] outline-none transition focus:border-orange-500/30 focus:bg-black/7 focus:ring-1 focus:ring-orange-500/15"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-black/10 px-1.5 py-0.5 font-mono text-[9px] text-[#B8B8C2]">
          ⌘K
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Crate selector */}
        <div className="relative">
          <button
            onClick={() => setCrateOpen(!crateOpen)}
            className="flex items-center gap-2 rounded-md border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-[#2E2E38] transition hover:bg-black/8 hover:border-black/15"
          >
            <Archive className="h-3.5 w-3.5 text-orange-600" />
            <span className="max-w-[140px] truncate">{activeCrate.name}</span>
            <ChevronDown className="h-3 w-3 text-[#9595A0]" />
          </button>

          {crateOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-lg border border-black/10 bg-[#CACACF] py-1 shadow-xl shadow-black/10">
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[#9595A0]">
                Your Crates
              </p>
              {mockCrates.map((crate) => (
                <button
                  key={crate.id}
                  onClick={() => { setActiveCrate(crate); setCrateOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#4A4A58] transition hover:bg-black/5 hover:text-[#111114]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: crate.color }} />
                  <span className="flex-1 truncate">{crate.name}</span>
                  <span className="text-xs text-[#9595A0]">{crate.trackIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-black/5 text-[#72727E] transition hover:bg-black/8 hover:text-[#2E2E38]">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-orange-500" />
        </button>

        {/* Avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-xs font-semibold text-white ring-2 ring-orange-500/20">
          DJ
        </button>
      </div>
    </header>
  );
}
