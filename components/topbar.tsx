"use client";

import { Search, Bell, ChevronDown, Archive } from "lucide-react";
import { useState } from "react";
import { mockCrates } from "@/data/mockCrate";

export default function Topbar() {
  const [activeCrate, setActiveCrate] = useState(mockCrates[0]);
  const [crateOpen, setCrateOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-56 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-sm shadow-sm">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tracks, artists, labels…"
          className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setCrateOpen(!crateOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            <Archive className="h-3.5 w-3.5 text-cyan-500" />
            <span className="max-w-[140px] truncate">{activeCrate.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {crateOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-200/80">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Your Crates
              </p>
              {mockCrates.map((crate) => (
                <button
                  key={crate.id}
                  onClick={() => { setActiveCrate(crate); setCrateOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: crate.color }} />
                  <span className="flex-1 truncate">{crate.name}</span>
                  <span className="text-xs text-slate-400">{crate.trackIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-cyan-500" />
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-xs font-semibold text-white ring-2 ring-cyan-500/20">
          DJ
        </button>
      </div>
    </header>
  );
}
