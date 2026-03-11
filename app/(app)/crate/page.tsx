"use client";

import { useState } from "react";
import { Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import CrateTable from "@/components/crate-table";
import { mockCrates } from "@/data/mockCrate";
import { Crate } from "@/types/crate";

export default function CratePage() {
  const [selectedCrateId, setSelectedCrateId] = useState(mockCrates[0].id);
  const selectedCrate = mockCrates.find((c) => c.id === selectedCrateId) as Crate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Crates</h1>
          <p className="mt-1 text-sm text-[#72727E]">
            {mockCrates.length} crates · {mockCrates.reduce((a, c) => a + c.trackIds.length, 0)} total tracks
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30">
          <Plus className="h-4 w-4" />
          New Crate
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Crate list sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {mockCrates.map((crate) => (
            <button
              key={crate.id}
              onClick={() => setSelectedCrateId(crate.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition",
                selectedCrateId === crate.id
                  ? "border-black/15 bg-black/5"
                  : "border-black/7 bg-[#D4D4DA] hover:border-black/10 hover:bg-black/4"
              )}
            >
              <div
                className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: crate.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1E1E26]">{crate.name}</p>
                <p className="text-xs text-[#9595A0]">
                  {crate.trackIds.length} tracks · {crate.avgBpm} BPM
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(crate.tags ?? []).slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] text-[#9595A0]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Crate content */}
        <div className="lg:col-span-3">
          {selectedCrate && (
            <div className="space-y-4">
              {/* Crate header */}
              <div
                className="flex items-center gap-3 rounded-xl border p-4"
                style={{ background: `${selectedCrate.color}10`, borderColor: `${selectedCrate.color}30` }}
              >
                <Archive className="h-5 w-5 shrink-0" style={{ color: selectedCrate.color }} />
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">{selectedCrate.name}</h2>
                  {selectedCrate.description && (
                    <p className="text-sm text-[#4A4A58]">{selectedCrate.description}</p>
                  )}
                </div>
              </div>

              <CrateTable
                tracks={selectedCrate.tracks}
                onBuildSet={() => window.location.assign("/set-builder")}
                onExport={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
