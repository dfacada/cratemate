"use client";
import { useState, useRef } from "react";
import {
  ArrowRight, Loader2, Plus, Check, X, ChevronDown, ChevronUp,
  Music, Zap, Tag, Users, BarChart2, Sparkles, AlertCircle, RefreshCw,
  Search
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { TrackInput, AnalyzeResponse, RecommendedTrack, PlaylistDNA } from "@/app/api/analyze/route";
import { usePlayer } from "@/context/player-context";
import PlayButton from "@/components/play-button";

const A = {
  bg: "#F0F4F8", panel: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t2: "#1e293b", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTrackLines(text: string): TrackInput[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 2)
    .map(line => {
      // Remove leading numbers: "1. " or "1) "
      const clean = line.replace(/^\d+[\.\)]\s*/, "");
      // Try "Artist - Title" or "Artist – Title"
      const sep = clean.match(/\s[-–—]\s/);
      if (sep) {
        const idx = clean.search(/\s[-–—]\s/);
        return { artist: clean.slice(0, idx).trim(), title: clean.slice(idx + 3).trim() };
      }
      // Fallback: whole line as artist
      return { artist: clean, title: "" };
    })
    .filter(t => t.artist);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11,
      backgroundColor: accent ? A.accentBg : "#f1f5f9",
      border: `1px solid ${accent ? A.accentBorder : A.border}`,
      color: accent ? A.accent : A.t3,
    }}>{label}</span>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ height: 4, borderRadius: 20, backgroundColor: "#f1f5f9", flex: 1, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 20, background: `linear-gradient(to right, ${A.accent}, #67e8f9)`, width: `${(value / max) * 100}%` }} />
    </div>
  );
}

function DNAPanel({ dna }: { dna: PlaylistDNA }) {
  const energyData = [5, 5, 6, 6, 7, 8, 8, 9, 9, 8, 7, 6].map((e, i) => ({ i, e }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Character banner */}
      <div style={{ padding: "14px 18px", borderRadius: 12, backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Playlist DNA</p>
        <p style={{ fontSize: 14, color: A.t2, lineHeight: 1.6 }}>{dna.setCharacter}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {dna.mood.map(m => <Chip key={m} label={m} accent />)}
          {dna.keyThemes.map(k => <Chip key={k} label={k} />)}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

        {/* Top artists */}
        <StatCard icon={Users} label="Artists">
          {dna.topArtists.slice(0, 4).map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: A.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
              <MiniBar value={a.count} max={Math.max(...dna.topArtists.map(x => x.count))} />
              <span style={{ fontSize: 10, color: A.t5, fontFamily: "monospace", width: 14, textAlign: "right" }}>{a.count}</span>
            </div>
          ))}
        </StatCard>

        {/* Top labels */}
        <StatCard icon={Tag} label="Labels">
          {dna.topLabels.slice(0, 4).map(l => (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: A.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
              <MiniBar value={l.count} max={Math.max(...dna.topLabels.map(x => x.count))} />
              <span style={{ fontSize: 10, color: A.t5, fontFamily: "monospace", width: 14, textAlign: "right" }}>{l.count}</span>
            </div>
          ))}
        </StatCard>

        {/* Genres */}
        <StatCard icon={BarChart2} label="Genres">
          {dna.genres.slice(0, 4).map(g => (
            <div key={g.name} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: A.t3 }}>{g.name}</span>
                <span style={{ fontSize: 10, color: A.t5, fontFamily: "monospace" }}>{Math.round(g.weight * 100)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 20, backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 20, background: `linear-gradient(to right, ${A.accent}, #67e8f9)`, width: `${g.weight * 100}%` }} />
              </div>
            </div>
          ))}
        </StatCard>
      </div>

      {/* BPM + Underground */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>BPM Range</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: A.t1, letterSpacing: "-0.03em" }}>
            {dna.bpmRange.avg}<span style={{ fontSize: 13, fontWeight: 500, color: A.t4 }}> avg</span>
          </p>
          <p style={{ fontSize: 11, color: A.t5, marginTop: 2 }}>{dna.bpmRange.min}–{dna.bpmRange.max} BPM</p>
        </div>
        <div style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Character</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: A.t1 }}>{dna.era}</p>
          <p style={{ fontSize: 11, color: A.t5, marginTop: 2 }}>
            {Math.round(dna.undergroundRatio * 100)}% underground
          </p>
          <p style={{ fontSize: 11, color: A.t4, marginTop: 4, lineHeight: 1.4 }}>{String(dna.energy)}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Icon size={12} color={A.accent} />
        <span style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function RecommendationCard({
  track, index, added, onAdd, onRemove
}: {
  track: RecommendedTrack; index: number;
  added: boolean; onAdd: () => void; onRemove: () => void;
}) {
  const { play, stop, currentTrack, status } = usePlayer();
  const isPlaying = currentTrack?.artist === track.artist && currentTrack?.title === track.title;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
      borderRadius: 10, border: `1px solid ${added ? A.accent + "50" : A.border}`,
      backgroundColor: added ? A.accentBg : A.panel,
      transition: "all 0.15s",
    }}>
      {/* Index */}
      <span style={{ fontSize: 11, color: A.t5, fontFamily: "monospace", width: 20, textAlign: "right", flexShrink: 0 }}>
        {index + 1}
      </span>

      {/* Play */}
      <PlayButton
        track={{ id: `rec-${index}`, artist: track.artist, title: track.title, label: track.label }}
        size={24}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {track.artist}
        </p>
        <p style={{ fontSize: 11, color: A.t4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {track.title}
        </p>
      </div>

      {/* Meta chips */}
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        {track.bpm && <span style={{ fontSize: 10, fontFamily: "monospace", color: A.t4, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", border: `1px solid ${A.border}` }}>{track.bpm}</span>}
        {track.key && <span style={{ fontSize: 10, fontFamily: "monospace", color: A.accent, padding: "2px 6px", borderRadius: 4, backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}` }}>{track.key}</span>}
        <span style={{ fontSize: 10, color: A.t5, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", border: `1px solid ${A.border}` }}>{track.label}</span>
        <span style={{ fontSize: 10, color: A.t5, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", border: `1px solid ${A.border}` }}>{track.year}</span>
      </div>

      {/* Why chip */}
      <div style={{ maxWidth: 200, flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
        <Sparkles size={10} color={A.t5} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: A.t5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.why}</span>
      </div>

      {/* Add/remove */}
      <button
        onClick={added ? onRemove : onAdd}
        style={{
          width: 28, height: 28, borderRadius: 8, border: `1px solid ${added ? A.accent : A.border}`,
          backgroundColor: added ? A.accent : "transparent",
          color: added ? "#fff" : A.t4,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.15s",
        }}>
        {added ? <Check size={12} /> : <Plus size={12} />}
      </button>
    </div>
  );
}

// ─── Main DigEngine ───────────────────────────────────────────────────────────

type Phase = "input" | "analyzing" | "results";

export default function DigEngine() {
  const [phase,        setPhase]        = useState<Phase>("input");
  const [inputMode,    setInputMode]    = useState<"url" | "paste">("url");
  const [urlInput,     setUrlInput]     = useState("");
  const [pasteInput,   setPasteInput]   = useState("");
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [loadingMsg,   setLoadingMsg]   = useState("");
  const [recCount,     setRecCount]     = useState(20);
  const [tracks,       setTracks]       = useState<TrackInput[]>([]);
  const [playlistName, setPlaylistName] = useState<string>("");
  const [result,       setResult]       = useState<AnalyzeResponse | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [addedIdxs,    setAddedIdxs]    = useState<Set<number>>(new Set());
  const [showAll,      setShowAll]      = useState(false);

  const handleUrlImport = async () => {
    setSpotifyError(null);
    setLoadingMsg("Fetching playlist from Spotify…");
    setPhase("analyzing");

    try {
      const res  = await fetch(`/api/spotify?url=${encodeURIComponent(urlInput)}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "SPOTIFY_NOT_CONFIGURED") {
          setPhase("input");
          setSpotifyError("Spotify credentials not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your Vercel environment variables, or use the paste method instead.");
          return;
        }
        throw new Error(data.error || "Failed to fetch playlist");
      }

      setPlaylistName(data.name);
      setTracks(data.tracks);
      await runAnalysis(data.tracks, data.name);
    } catch (e: any) {
      setError(e.message);
      setPhase("input");
    }
  };

  const handlePasteImport = async () => {
    const parsed = parseTrackLines(pasteInput);
    if (parsed.length < 3) {
      setError("Please paste at least 3 tracks in 'Artist - Title' format.");
      return;
    }
    setTracks(parsed);
    setPlaylistName("My Playlist");
    setPhase("analyzing");
    await runAnalysis(parsed, "My Playlist");
  };

  const runAnalysis = async (trackList: TrackInput[], name: string) => {
    setLoadingMsg(`Analyzing ${trackList.length} tracks…`);
    setError(null);

    try {
      setLoadingMsg("Claude is reading the vibe…");
      const res  = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: trackList, count: recCount }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Analysis failed");
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
      setPhase("results");
    } catch (e: any) {
      setError(e.message);
      setPhase("input");
    }
  };

  const toggleAdd = (i: number) => {
    setAddedIdxs(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const addedTracks = result?.recommendations.filter((_, i) => addedIdxs.has(i)) ?? [];
  const displayedRecs = result ? (showAll ? result.recommendations : result.recommendations.slice(0, 10)) : [];

  // ── Input phase ───────────────────────────────────────────────────────────
  if (phase === "input") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>New Dig</h1>
          <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>
            Give CrateMate a playlist. It'll read the vibe and find tracks that belong in the same world.
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, borderRadius: 9, border: `1px solid ${A.border}`, backgroundColor: "#f8fafc", overflow: "hidden", alignSelf: "flex-start" }}>
          {(["url", "paste"] as const).map(mode => (
            <button key={mode} onClick={() => setInputMode(mode)} style={{
              padding: "7px 20px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s", margin: 2, borderRadius: 7,
              backgroundColor: inputMode === mode ? "#fff" : "transparent",
              color: inputMode === mode ? A.t1 : A.t5,
              boxShadow: inputMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
              {mode === "url" ? "🔗  Spotify URL" : "📋  Paste Tracks"}
            </button>
          ))}
        </div>

        {/* URL mode */}
        {inputMode === "url" && (
          <div style={{ borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel, padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: A.t1, marginBottom: 4 }}>Paste a Spotify playlist URL</p>
            <p style={{ fontSize: 12, color: A.t5, marginBottom: 16 }}>
              Public playlists only. Requires Spotify credentials in Vercel env vars.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setSpotifyError(null); }}
                onKeyDown={e => e.key === "Enter" && urlInput && handleUrlImport()}
                placeholder="https://open.spotify.com/playlist/..."
                style={{ flex: 1, height: 42, padding: "0 14px", borderRadius: 9, border: `1.5px solid ${A.border}`, fontSize: 13, color: A.t1, fontFamily: "inherit", outline: "none", backgroundColor: "#fafafa" }}
              />
              <button onClick={handleUrlImport} disabled={!urlInput}
                style={{ padding: "0 20px", borderRadius: 9, border: "none", backgroundColor: urlInput ? A.accent : "#e2e8f0", color: urlInput ? "#fff" : A.t5, fontSize: 13, fontWeight: 600, cursor: urlInput ? "pointer" : "not-allowed", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                Import
              </button>
            </div>
            {spotifyError && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, backgroundColor: "#fef9c3", border: "1px solid #fde047", display: "flex", gap: 8 }}>
                <AlertCircle size={13} color="#ca8a04" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>{spotifyError}</p>
              </div>
            )}
          </div>
        )}

        {/* Paste mode */}
        {inputMode === "paste" && (
          <div style={{ borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel, padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: A.t1, marginBottom: 4 }}>Paste your track list</p>
            <p style={{ fontSize: 12, color: A.t5, marginBottom: 16, lineHeight: 1.5 }}>
              One track per line in <code style={{ backgroundColor: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>Artist - Title</code> format.
              Works with Rekordbox exports, plain lists, or anything copy-pasted.
            </p>
            <textarea
              value={pasteInput}
              onChange={e => setPasteInput(e.target.value)}
              placeholder={"DJ Koze - XTC\nBicep - Glue\nTale Of Us - Goa\nDixon - Polymorphic Swing\n..."}
              style={{ width: "100%", height: 180, padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${A.border}`, fontSize: 13, color: A.t1, fontFamily: "monospace", resize: "vertical", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 11, color: A.t5, marginTop: 6 }}>
              {parseTrackLines(pasteInput).length > 0 && `${parseTrackLines(pasteInput).length} tracks detected`}
            </p>
          </div>
        )}

        {/* Rec count */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{ fontSize: 12, color: A.t4 }}>Find me</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[10, 20, 30, 50].map(n => (
              <button key={n} onClick={() => setRecCount(n)}
                style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${recCount === n ? A.accent : A.border}`, backgroundColor: recCount === n ? A.accentBg : A.panel, color: recCount === n ? A.accent : A.t4, fontSize: 12, fontWeight: recCount === n ? 700 : 400, cursor: "pointer" }}>
                {n}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: A.t4 }}>new tracks</p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: 8 }}>
            <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button
          onClick={inputMode === "url" ? handleUrlImport : handlePasteImport}
          disabled={inputMode === "url" ? !urlInput : pasteInput.trim().split("\n").filter(l => l.trim()).length < 3}
          style={{
            alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 10, border: "none",
            backgroundColor: A.accent, color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(0,180,216,0.3)",
          }}>
          <Sparkles size={15} /> Analyze & Find Tracks
        </button>
      </div>
    );
  }

  // ── Analyzing phase ───────────────────────────────────────────────────────
  if (phase === "analyzing") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, minHeight: 300 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={24} color={A.accent} style={{ animation: "spin 0.7s linear infinite" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: A.t1, marginBottom: 6 }}>Reading the vibe…</p>
          <p style={{ fontSize: 13, color: A.t4 }}>{loadingMsg}</p>
        </div>
        <div style={{ width: 200, height: 3, borderRadius: 20, backgroundColor: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 20, backgroundColor: A.accent, animation: "progress 2s ease-in-out infinite" }} />
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes progress { 0% { width: 0%; margin-left: 0; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
        `}</style>
      </div>
    );
  }

  // ── Results phase ─────────────────────────────────────────────────────────
  if (!result) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>
            {playlistName || "Your Playlist"}
          </h1>
          <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>
            {result.trackCount} tracks analyzed · {result.recommendations.length} recommendations found
          </p>
        </div>
        <button onClick={() => { setPhase("input"); setResult(null); setAddedIdxs(new Set()); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: A.panel, fontSize: 12, color: A.t4, cursor: "pointer" }}>
          <RefreshCw size={12} /> New Dig
        </button>
      </div>

      {/* DNA */}
      <DNAPanel dna={result.dna} />

      {/* Recommendations */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: A.t1 }}>Recommended Tracks</h2>
            <p style={{ fontSize: 12, color: A.t4, marginTop: 2 }}>Click + to add to your crate</p>
          </div>
          {addedIdxs.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: A.accent, fontWeight: 600 }}>{addedIdxs.size} selected</span>
              <button
                onClick={() => {
                  // TODO: wire to actual crate — for now show confirmation
                  alert(`${addedIdxs.size} tracks added to your crate!`);
                  setAddedIdxs(new Set());
                }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", backgroundColor: A.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={12} /> Add {addedIdxs.size} to Crate
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayedRecs.map((track, i) => (
            <RecommendationCard
              key={i} track={track} index={i}
              added={addedIdxs.has(i)}
              onAdd={() => toggleAdd(i)}
              onRemove={() => toggleAdd(i)}
            />
          ))}
        </div>

        {result.recommendations.length > 10 && (
          <button onClick={() => setShowAll(!showAll)}
            style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: A.panel, fontSize: 12, color: A.t4, cursor: "pointer", width: "100%", justifyContent: "center" }}>
            {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {result.recommendations.length} recommendations</>}
          </button>
        )}
      </div>
    </div>
  );
}
