"use client";

import { useState } from "react";
import { Link2, Image, AlignLeft, Users, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ScreenshotUpload from "@/components/screenshot-upload";
import OcrReviewTable from "@/components/ocr-review-table";
import PlaylistDNA from "@/components/playlist-dna";
import ArtistMiner from "@/components/artist-miner";

type DigMode = "paste_link" | "screenshot" | "paste_tracklist" | "artist";

const DIG_MODES = [
  {
    id: "paste_link" as DigMode,
    icon: Link2,
    label: "Paste Playlist",
    desc: "Drop a Spotify, SoundCloud, or Mixcloud URL to extract and analyze the set",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    id: "screenshot" as DigMode,
    icon: Image,
    label: "Upload Screenshot",
    desc: "Upload a screenshot of a playlist, Rekordbox export, or any DJ set image",
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20 hover:border-orange-500/30",
  },
  {
    id: "paste_tracklist" as DigMode,
    icon: AlignLeft,
    label: "Paste Track List",
    desc: "Paste a raw list of Artist — Track entries and let AI parse and enrich them",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20 hover:border-yellow-500/40",
  },
  {
    id: "artist" as DigMode,
    icon: Users,
    label: "Start From Artist",
    desc: "Choose an artist and mine their full discography oldest → newest",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
];

export default function NewDigPage() {
  const [mode, setMode] = useState<DigMode | null>(null);
  const [url, setUrl] = useState("");
  const [tracklist, setTracklist] = useState("");
  const [ocrDone, setOcrDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleScreenshotUpload = async (file: File) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setOcrDone(true);
  };

  const handleAnalyzeUrl = async () => {
    if (!url) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  const handleAnalyzeTracklist = async () => {
    if (!tracklist) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">New Dig</h1>
        <p className="mt-1 text-sm text-[#72727E]">
          Choose how you want to start building your crate
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-3">
        {DIG_MODES.map(({ id, icon: Icon, label, desc, color, bg, border }) => (
          <button
            key={id}
            onClick={() => setMode(id === mode ? null : id)}
            className={cn(
              "group relative flex flex-col gap-3 rounded-xl border bg-[#D4D4DA] p-5 text-left transition-all duration-200",
              mode === id
                ? cn("border-black/20 shadow-lg", bg)
                : cn("border-black/9", border)
            )}
          >
            {mode === id && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-white">{label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#72727E]">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active mode panel */}
      {mode === "paste_link" && (
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Paste Playlist URL</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9595A0]" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://open.spotify.com/playlist/… or soundcloud.com/…"
                className="h-10 w-full rounded-lg border border-black/10 bg-black/4 pl-9 pr-3 text-sm text-[#1E1E26] placeholder-zinc-600 outline-none transition focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/20"
              />
            </div>
            <button
              onClick={handleAnalyzeUrl}
              disabled={!url || analyzing}
              className="flex items-center gap-2 rounded-lg bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30 disabled:opacity-40"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Analyze
            </button>
          </div>
          {analyzed && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-orange-600">✓ Playlist extracted · 12 tracks found</p>
              <PlaylistDNA />
            </div>
          )}
        </div>
      )}

      {mode === "screenshot" && (
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Upload Screenshot</h2>
          <ScreenshotUpload onUpload={handleScreenshotUpload} processing={processing} />
          {ocrDone && (
            <div className="pt-2">
              <OcrReviewTable />
            </div>
          )}
        </div>
      )}

      {mode === "paste_tracklist" && (
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Paste Track List</h2>
          <p className="text-xs text-[#72727E]">
            One track per line. Formats supported: "Artist — Track", "Artist - Track [Label]", or plain titles.
          </p>
          <textarea
            value={tracklist}
            onChange={(e) => setTracklist(e.target.value)}
            rows={8}
            placeholder={"Rampa — Keinemusik\nHot Natured — Amber\nTrikk — Body Talk [Tsuba]"}
            className="w-full resize-none rounded-lg border border-black/10 bg-black/4 p-3 font-mono text-xs text-[#2E2E38] placeholder-zinc-700 outline-none transition focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/20"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeTracklist}
              disabled={!tracklist.trim() || analyzing}
              className="flex items-center gap-2 rounded-lg bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30 disabled:opacity-40"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Parse & Analyze
            </button>
          </div>
          {analyzed && (
            <div className="pt-2">
              <OcrReviewTable />
            </div>
          )}
        </div>
      )}

      {mode === "artist" && (
        <div className="rounded-xl border border-black/9 bg-[#D4D4DA] p-5">
          <ArtistMiner />
        </div>
      )}
    </div>
  );
}
