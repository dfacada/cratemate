"use client";
import { useState, useCallback } from "react";
import {
  Sparkles, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  Plus, Check, Loader2, Users, Tag, BarChart2, Save, Upload,
  Music, X
} from "lucide-react";
import type { TrackInput, AnalyzeResponse, RecommendedTrack, PlaylistDNA } from "@/app/api/analyze/route";
import { usePlayer } from "@/context/player-context";
import PlayButton from "@/components/play-button";
import SoundCloudImport from "@/components/soundcloud-import";
import SoundCloudExport from "@/components/soundcloud-export";
import { saveCrate, newCrateId, type CrateTrack } from "@/lib/crates";

const A = {
  bg: "#F0F4F8", panel: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t2: "#1e293b", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTrackLines(text: string): TrackInput[] {
  return text.split("\n").map(l => l.trim()).filter(l => l.length > 2)
    .map(line => {
      const clean = line.replace(/^\d+[\.\)]\s*/, "");
      const sep   = clean.match(/\s[-–—]\s/);
      if (sep) {
        const idx = clean.search(/\s[-–—]\s/);
        return { artist: clean.slice(0, idx).trim(), title: clean.slice(idx + 3).trim() };
      }
      return { artist: clean, title: "" };
    }).filter(t => t.artist);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({ label, accent, mono }: { label: string; accent?: boolean; mono?: boolean }) {
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 20, fontSize: 11,
      fontFamily: mono ? "monospace" : "inherit",
      backgroundColor: accent ? A.accentBg : "#f1f5f9",
      border: `1px solid ${accent ? A.accentBorder : A.border}`,
      color: accent ? A.accent : A.t3, whiteSpace: "nowrap" as const,
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

function StatCard({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Icon size={12} color={A.accent} />
        <span style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function DNAPanel({ dna }: { dna: PlaylistDNA }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ padding: "14px 18px", borderRadius: 12, backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6 }}>Playlist DNA</p>
        <p style={{ fontSize: 14, color: A.t2, lineHeight: 1.6 }}>{dna.setCharacter}</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 10 }}>
          {dna.mood.map(m => <Chip key={m} label={m} accent />)}
          {dna.keyThemes.map(k => <Chip key={k} label={k} />)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard icon={Users} label="Artists">
          {dna.topArtists.slice(0, 4).map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: A.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.name}</span>
              <MiniBar value={a.count} max={Math.max(...dna.topArtists.map(x => x.count))} />
              <span style={{ fontSize: 10, color: A.t5, fontFamily: "monospace", width: 14, textAlign: "right" as const }}>{a.count}</span>
            </div>
          ))}
        </StatCard>
        <StatCard icon={Tag} label="Labels">
          {dna.topLabels.slice(0, 4).map(l => (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: A.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{l.name}</span>
              <MiniBar value={l.count} max={Math.max(...dna.topLabels.map(x => x.count))} />
              <span style={{ fontSize: 10, color: A.t5, fontFamily: "monospace", width: 14, textAlign: "right" as const }}>{l.count}</span>
            </div>
          ))}
        </StatCard>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6 }}>BPM Range</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: A.t1, letterSpacing: "-0.03em" }}>{dna.bpmRange.avg}<span style={{ fontSize: 12, fontWeight: 500, color: A.t4 }}> avg</span></p>
          <p style={{ fontSize: 11, color: A.t5, marginTop: 2 }}>{dna.bpmRange.min}–{dna.bpmRange.max} BPM</p>
        </div>
        <div style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${A.border}`, backgroundColor: A.panel }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: A.t5, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6 }}>Character</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: A.t1 }}>{dna.era}</p>
          <p style={{ fontSize: 11, color: A.t5, marginTop: 2 }}>{Math.round(dna.undergroundRatio * 100)}% underground</p>
          <p style={{ fontSize: 11, color: A.t4, marginTop: 4, lineHeight: 1.4 }}>{String(dna.energy)}</p>
        </div>
      </div>
    </div>
  );
}

function TrackRow({
  track, index, tag, added, onToggle
}: {
  track: { artist: string; title: string; label?: string; bpm?: number; key?: string; year?: number; why?: string };
  index: number; tag?: string; added?: boolean; onToggle?: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
      borderRadius: 10,
      border: `1px solid ${added ? A.accent + "60" : A.border}`,
      backgroundColor: added ? A.accentBg : A.panel,
      transition: "all 0.12s",
    }}>
      <span style={{ fontSize: 11, color: A.t5, fontFamily: "monospace", width: 22, textAlign: "right" as const, flexShrink: 0 }}>
        {index + 1}
      </span>
      <PlayButton
        track={{ id: `${tag === "ORIGINAL" ? "orig" : "rec"}-${index}`, artist: track.artist, title: track.title, label: track.label || "" }}
        size={24}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{track.artist}</p>
        <p style={{ fontSize: 11, color: A.t4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{track.title}</p>
      </div>
      <div style={{ display: "flex", gap: 5, flexShrink: 0, flexWrap: "wrap" as const }}>
        {track.bpm  && <Chip label={`${track.bpm}`} mono />}
        {track.key  && <Chip label={track.key}    mono accent />}
        {track.label && <Chip label={track.label} />}
        {track.year  && <Chip label={`${track.year}`} mono />}
      </div>
      {track.why && (
        <span style={{ fontSize: 10, color: A.t5, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
          ✦ {track.why}
        </span>
      )}
      {onToggle && (
        <button onClick={onToggle} style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1px solid ${added ? A.accent : A.border}`,
          backgroundColor: added ? A.accent : "transparent",
          color: added ? "#fff" : A.t4,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s",
        }}>
          {added ? <Check size={12} /> : <Plus size={12} />}
        </button>
      )}
      {tag && !onToggle && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 7px", borderRadius: 20, backgroundColor: "#f1f5f9", border: `1px solid ${A.border}`, color: A.t5, flexShrink: 0 }}>
          {tag}
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "input" | "analyzing" | "results";

export default function DigEngine() {
  const [phase,         setPhase]         = useState<Phase>("input");
  const [inputMode,     setInputMode]     = useState<"url" | "soundcloud" | "paste">("url");
  const [urlInput,      setUrlInput]      = useState("");
  const [pasteInput,    setPasteInput]    = useState("");
  const [spotifyError,  setSpotifyError]  = useState<string | null>(null);
  const [loadingMsg,    setLoadingMsg]    = useState("");
  const [recCount,      setRecCount]      = useState(20);
  const [tracks,        setTracks]        = useState<TrackInput[]>([]);
  const [playlistName,  setPlaylistName]  = useState("");
  const [result,        setResult]        = useState<AnalyzeResponse | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [addedIdxs,     setAddedIdxs]     = useState<Set<number>>(new Set());
  const [showAllRecs,   setShowAllRecs]   = useState(false);
  const [showOriginal,  setShowOriginal]  = useState(true);
  const [progress,      setProgress]      = useState(0);
  const [showExport,    setShowExport]    = useState(false);
  const [crateSaved,    setCrateSaved]    = useState(false);
  const [crateName,     setCrateName]     = useState("");

  // ── URL import (auto-detect Spotify or Deezer) ─────────────────────────────
  const handleUrlImport = async () => {
    setSpotifyError(null);
    const isDeezer = /deezer\.com\//.test(urlInput);
    const isSpotify = /spotify\.com\//.test(urlInput);

    if (!isDeezer && !isSpotify) {
      setSpotifyError("Paste a Spotify or Deezer playlist URL.");
      return;
    }

    setLoadingMsg(isDeezer ? "Fetching playlist from Deezer\u2026" : "Fetching playlist from Spotify\u2026");
    setPhase("analyzing");
    setProgress(0);
    try {
      const endpoint = isDeezer
        ? `/api/deezer?url=${encodeURIComponent(urlInput)}`
        : `/api/spotify?url=${encodeURIComponent(urlInput)}`;
      const res  = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "SPOTIFY_NOT_CONFIGURED") {
          setPhase("input");
          setSpotifyError("Spotify credentials not configured. Use the paste method instead.");
          return;
        }
        throw new Error(data.error || "Failed to fetch playlist");
      }
      const name = data.name || (isDeezer ? "Deezer Playlist" : "Spotify Playlist");
      setPlaylistName(name);
      setCrateName(name);
      setTracks(data.tracks);
      await runAnalysis(data.tracks, name);
    } catch (e: any) {
      setError(e.message); setPhase("input");
    }
  };

  // ── Paste import ───────────────────────────────────────────────────────────
  const handlePasteImport = async () => {
    const parsed = parseTrackLines(pasteInput);
    if (parsed.length < 3) { setError("Paste at least 3 tracks in 'Artist - Title' format."); return; }
    setTracks(parsed);
    setPlaylistName("My Playlist");
    setCrateName("My Playlist");
    setPhase("analyzing");
    await runAnalysis(parsed, "My Playlist");
  };

  // ── Core analysis ──────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async (trackList: TrackInput[], name: string) => {
    setError(null);
    setProgress(0);
    setLoadingMsg("Analyzing your playlist…");
    setAddedIdxs(new Set());

    const safeJson = async (res: Response) => {
      const text = await res.text();
      try { return { data: JSON.parse(text), ok: res.ok }; }
      catch { throw new Error(text.slice(0, 120).trim() || `Server error ${res.status}`); }
    };

    // Progress ticker
    let pct = 0;
    const tick = setInterval(() => {
      pct = pct + (88 - pct) * 0.05;
      setProgress(Math.round(pct));
    }, 300);

    try {
      setLoadingMsg("Claude is reading the vibe…");
      const firstRes  = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: trackList, count: Math.min(recCount, 20) }),
      });
      const { data: firstData, ok } = await safeJson(firstRes);
      if (!ok || firstData.error) throw new Error(firstData.error || "Analysis failed");

      clearInterval(tick);
      const batchTotal  = Math.max(1, Math.ceil(recCount / 20));
      setProgress(Math.round(90 / batchTotal));

      const partial: AnalyzeResponse = { dna: firstData.dna, recommendations: firstData.recommendations || [], trackCount: trackList.length };
      setResult(partial);

      if (recCount <= 20) {
        setProgress(100);
        await new Promise(r => setTimeout(r, 300));
        setPhase("results");
        return;
      }

      setPhase("results");

      // Fetch remaining batches
      const dnaSummary = firstData.dnaSummary || "";
      const allRecs    = [...(firstData.recommendations || [])];
      const seen       = new Set(allRecs.map((r: any) => `${r.artist}::${r.title}`.toLowerCase()));
      let   done       = 1;

      while (allRecs.length < recCount) {
        const remaining = recCount - allRecs.length;
        setLoadingMsg(`Finding more tracks… (${allRecs.length}/${recCount})`);
        const batchRes  = await fetch("/api/analyze?mode=recs", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks: trackList.slice(0, 30), count: Math.min(20, remaining), dnaSummary, exclude: Array.from(seen) }),
        });
        const { data: batchData } = await safeJson(batchRes);
        if (batchData.error) break;
        const newRecs = (batchData.recommendations || []).filter((r: any) => {
          const key = `${r.artist}::${r.title}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
        allRecs.push(...newRecs);
        done++;
        setProgress(Math.min(95, Math.round((90 / batchTotal) * done)));
        setResult(prev => prev ? { ...prev, recommendations: [...allRecs] } : prev);
      }

      setProgress(100);
      setLoadingMsg("");
    } catch (e: any) {
      clearInterval(tick);
      setError(e.message);
      if (!result) setPhase("input");
    }
  }, [recCount]);

  // ── Save crate ─────────────────────────────────────────────────────────────
  const handleSaveCrate = () => {
    if (!result) return;
    const originalTracks: CrateTrack[] = tracks.map(t => ({
      artist: t.artist, title: t.title, label: t.label,
      bpm: t.bpm, key: t.key, year: t.year, source: "original" as const,
    }));
    const addedTracks: CrateTrack[] = result.recommendations
      .filter((_, i) => addedIdxs.has(i))
      .map(r => ({
        artist: r.artist, title: r.title, label: r.label,
        bpm: r.bpm, key: r.key, year: r.year, genre: r.genre,
        source: "added" as const,
      }));

    saveCrate({
      id:        newCrateId(),
      name:      crateName || playlistName || "New Crate",
      createdAt: Date.now(),
      tracks:    [...originalTracks, ...addedTracks],
    });
    setCrateSaved(true);
    setTimeout(() => setCrateSaved(false), 2500);
  };

  // ── Crate tracks for export ────────────────────────────────────────────────
  const exportTracks: CrateTrack[] = [
    ...tracks.map(t => ({ artist: t.artist, title: t.title, label: t.label, bpm: t.bpm, key: t.key, year: t.year, source: "original" as const })),
    ...(result?.recommendations.filter((_, i) => addedIdxs.has(i)).map(r => ({
      artist: r.artist, title: r.title, label: r.label, bpm: r.bpm, key: r.key, year: r.year, source: "added" as const,
    })) || []),
  ];

  const toggleAdd = (i: number) => setAddedIdxs(prev => {
    const n = new Set(prev);
    n.has(i) ? n.delete(i) : n.add(i);
    return n;
  });

  const displayedRecs = result ? (showAllRecs ? result.recommendations : result.recommendations.slice(0, 10)) : [];

  // ── INPUT PHASE ────────────────────────────────────────────────────────────
  if (phase === "input") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>New Dig</h1>
        <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>Give CrateMate a playlist. It'll read the vibe and find tracks that belong.</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 0, borderRadius: 9, border: `1px solid ${A.border}`, backgroundColor: "#f8fafc", overflow: "hidden", alignSelf: "flex-start" }}>
        {([
          { key: "url",        label: "🎵  Playlist URL" },
          { key: "soundcloud", label: "☁️  SoundCloud" },
          { key: "paste",      label: "📋  Paste Tracks" },
        ] as const).map(mode => (
          <button key={mode.key} onClick={() => setInputMode(mode.key)} style={{
            padding: "7px 18px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s", margin: 2, borderRadius: 7,
            backgroundColor: inputMode === mode.key ? "#fff" : "transparent",
            color: inputMode === mode.key ? A.t1 : A.t5,
            boxShadow: inputMode === mode.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>{mode.label}</button>
        ))}
      </div>

      {/* Spotify */}
      {inputMode === "url" && (
        <div style={{ borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel, padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: A.t1, marginBottom: 4 }}>Paste a playlist URL</p>
          <p style={{ fontSize: 12, color: A.t5, marginBottom: 16 }}>Spotify or Deezer. Public playlists only.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={urlInput} onChange={e => { setUrlInput(e.target.value); setSpotifyError(null); }}
              onKeyDown={e => e.key === "Enter" && urlInput && handleUrlImport()}
              placeholder="https://open.spotify.com/playlist/... or https://deezer.com/playlist/..."
              style={{ flex: 1, height: 42, padding: "0 14px", borderRadius: 9, border: `1.5px solid ${A.border}`, fontSize: 13, color: A.t1, fontFamily: "inherit", outline: "none", backgroundColor: "#fafafa" }} />
            <button onClick={handleUrlImport} disabled={!urlInput}
              style={{ padding: "0 20px", borderRadius: 9, border: "none", backgroundColor: urlInput ? A.accent : "#e2e8f0", color: urlInput ? "#fff" : A.t5, fontSize: 13, fontWeight: 600, cursor: urlInput ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
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

      {/* SoundCloud */}
      {inputMode === "soundcloud" && (
        <div style={{ borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel, padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: A.t1, marginBottom: 4 }}>Paste a SoundCloud URL</p>
          <p style={{ fontSize: 12, color: A.t5, marginBottom: 16 }}>Public sets and playlists. Loads via the SoundCloud widget.</p>
          <SoundCloudImport onTracks={(t, name) => {
            setTracks(t); setPlaylistName(name); setCrateName(name);
            setPhase("analyzing"); runAnalysis(t, name);
          }} />
        </div>
      )}

      {/* Paste */}
      {inputMode === "paste" && (
        <div style={{ borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel, padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: A.t1, marginBottom: 4 }}>Paste your track list</p>
          <p style={{ fontSize: 12, color: A.t5, marginBottom: 16 }}>One per line: <code style={{ backgroundColor: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>Artist - Title</code></p>
          <textarea value={pasteInput} onChange={e => setPasteInput(e.target.value)}
            placeholder={"DJ Koze - XTC\nBicep - Glue\nTale Of Us - Goa\n..."}
            style={{ width: "100%", height: 180, padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${A.border}`, fontSize: 13, color: A.t1, fontFamily: "monospace", resize: "vertical", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" as const }} />
          <p style={{ fontSize: 11, color: A.t5, marginTop: 5 }}>{parseTrackLines(pasteInput).length > 0 ? `${parseTrackLines(pasteInput).length} tracks detected` : ""}</p>
        </div>
      )}

      {/* Rec count */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <p style={{ fontSize: 12, color: A.t4 }}>Find me</p>
        <div style={{ display: "flex", gap: 6 }}>
          {[10, 20, 30, 50, 100].map(n => (
            <button key={n} onClick={() => setRecCount(n)} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${recCount === n ? A.accent : A.border}`, backgroundColor: recCount === n ? A.accentBg : A.panel, color: recCount === n ? A.accent : A.t4, fontSize: 12, fontWeight: recCount === n ? 700 : 400, cursor: "pointer" }}>
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

      {inputMode !== "soundcloud" && (
        <button onClick={inputMode === "url" ? handleUrlImport : handlePasteImport}
          disabled={inputMode === "url" ? !urlInput : parseTrackLines(pasteInput).length < 3}
          style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, border: "none", backgroundColor: A.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,180,216,0.3)" }}>
          <Sparkles size={15} /> Analyze & Find Tracks
        </button>
      )}
    </div>
  );

  // ── ANALYZING PHASE ────────────────────────────────────────────────────────
  if (phase === "analyzing") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, minHeight: 340 }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle cx="48" cy="48" r="40" fill="none" stroke={A.accent} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.4s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: A.t1, letterSpacing: "-0.03em" }}>{progress}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: A.t1, marginBottom: 6 }}>Reading the vibe…</p>
        <p style={{ fontSize: 13, color: A.t4 }}>{loadingMsg}</p>
      </div>
      <div style={{ width: 240 }}>
        <div style={{ height: 4, borderRadius: 20, backgroundColor: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 20, backgroundColor: A.accent, width: `${progress}%`, transition: "width 0.4s ease" }} />
        </div>
      </div>
    </div>
  );

  // ── RESULTS PHASE ──────────────────────────────────────────────────────────
  if (!result) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={crateName}
              onChange={e => setCrateName(e.target.value)}
              style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", minWidth: 200, maxWidth: 400 }}
            />
          </div>
          <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>
            {result.trackCount} original · {result.recommendations.length} recommendations · {addedIdxs.size} selected
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button onClick={() => { setPhase("input"); setResult(null); setAddedIdxs(new Set()); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: A.panel, fontSize: 12, color: A.t4, cursor: "pointer" }}>
            <RefreshCw size={12} /> New Dig
          </button>
          <button onClick={handleSaveCrate}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: crateSaved ? "#f0fdf4" : A.panel, color: crateSaved ? "#16a34a" : A.t4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {crateSaved ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save Crate</>}
          </button>
          {exportTracks.length > 0 && (
            <button onClick={() => setShowExport(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #FF550040", backgroundColor: "#FF550008", color: "#FF5500", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Upload size={12} /> Export to SoundCloud
            </button>
          )}
        </div>
      </div>

      {/* DNA */}
      <DNAPanel dna={result.dna} />

      {/* Original playlist tracks */}
      <div>
        <button onClick={() => setShowOriginal(!showOriginal)}
          style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", cursor: "pointer", padding: "0 0 10px", width: "100%" }}>
          <Music size={14} color={A.t4} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: A.t1, flex: 1, textAlign: "left" as const }}>
            Original Playlist <span style={{ fontSize: 12, fontWeight: 400, color: A.t5 }}>({tracks.length} tracks)</span>
          </h2>
          {showOriginal ? <ChevronUp size={14} color={A.t5} /> : <ChevronDown size={14} color={A.t5} />}
        </button>
        {showOriginal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tracks.map((t, i) => (
              <TrackRow key={i} track={t} index={i} tag="ORIGINAL" />
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} color={A.accent} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>
              Recommendations <span style={{ fontSize: 12, fontWeight: 400, color: A.t5 }}>({result.recommendations.length} tracks)</span>
            </h2>
          </div>
          {addedIdxs.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: A.accent, fontWeight: 600 }}>{addedIdxs.size} selected</span>
              <button onClick={handleSaveCrate}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", backgroundColor: A.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Save size={11} /> Save to Crate
              </button>
            </div>
          )}
        </div>
        <p style={{ fontSize: 12, color: A.t5, marginBottom: 10 }}>Click + to select tracks to add to your crate</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {displayedRecs.map((track, i) => (
            <TrackRow
              key={i} track={track} index={i}
              added={addedIdxs.has(i)}
              onToggle={() => toggleAdd(i)}
            />
          ))}
          {loadingMsg && result.recommendations.length < recCount && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: `1px dashed ${A.border}`, color: A.t5, fontSize: 12 }}>
              <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} />
              {loadingMsg}
            </div>
          )}
        </div>
        {result.recommendations.length > 10 && (
          <button onClick={() => setShowAllRecs(!showAllRecs)}
            style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "8px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: A.panel, fontSize: 12, color: A.t4, cursor: "pointer", width: "100%", justifyContent: "center" }}>
            {showAllRecs ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {result.recommendations.length}</>}
          </button>
        )}
      </div>

      {/* SoundCloud export modal */}
      {showExport && (
        <SoundCloudExport
          crateName={crateName || playlistName}
          tracks={exportTracks}
          onClose={() => setShowExport(false)}
        />
      )}

    </div>
  );
}
