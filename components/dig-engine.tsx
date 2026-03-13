"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Loader2,
  Save,
  Upload,
  Music,
  X,
  Zap,
} from "lucide-react";
import type {
  TrackInput,
  AnalyzeResponse,
  RecommendedTrack,
  PlaylistDNA,
} from "@/app/api/analyze/route";
import type { PlayerTrack } from "@/context/player-context";
import { usePlayer } from "@/context/player-context";
import PlayButton from "@/components/play-button";
import SoundCloudImport from "@/components/soundcloud-import";
import SoundCloudExport from "@/components/soundcloud-export";
import { saveCrate, newCrateId, type CrateTrack } from "@/lib/crates";
import { getCamelotColor, getEnergyColor } from "@/lib/theme";

// ─── Theme CSS Variables ──────────────────────────────────────────────────

const themeVars = {
  bgPrimary: "var(--bg-primary)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textTertiary: "var(--text-muted)",
  borderColor: "var(--border)",
  accentPrimary: "var(--accent-primary)",
  accentSecondary: "var(--accent-secondary)",
  accentDanger: "var(--accent-danger)",
  accentBg: "rgba(0, 212, 170, 0.09)",
  accentBorder: "rgba(0, 212, 170, 0.2)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTrackLines(text: string): TrackInput[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2)
    .map((line) => {
      const clean = line.replace(/^\d+[\.\)]\s*/, "");
      const sep = clean.match(/\s[-–—]\s/);
      if (sep) {
        const idx = clean.search(/\s[-–—]\s/);
        return {
          artist: clean.slice(0, idx).trim(),
          title: clean.slice(idx + 3).trim(),
        };
      }
      return { artist: clean, title: "" };
    })
    .filter((t) => t.artist);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({
  label,
  accent,
  mono,
}: {
  label: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontFamily: mono ? "monospace" : "inherit",
        backgroundColor: accent ? themeVars.accentBg : "var(--bg-tertiary)",
        border: `1px solid ${accent ? themeVars.accentBorder : themeVars.borderColor}`,
        color: accent ? themeVars.accentPrimary : themeVars.textTertiary,
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}

function EnergyBar({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div style={{ height: 4, borderRadius: 20, backgroundColor: "var(--bg-tertiary)", flex: 1, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          borderRadius: 20,
          background: `linear-gradient(to right, ${getEnergyColor(normalized / 100)}, var(--accent-secondary))`,
          width: `${normalized}%`,
        }}
      />
    </div>
  );
}

function DNACard({ dna }: { dna: PlaylistDNA }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${themeVars.accentBorder}`,
        backgroundColor: themeVars.accentBg,
        padding: "16px 18px",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: themeVars.accentPrimary,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            marginBottom: 6,
          }}
        >
          Playlist DNA
        </p>
        <p
          style={{
            fontSize: 13,
            color: themeVars.textSecondary,
            lineHeight: 1.6,
          }}
        >
          {dna.setCharacter}
        </p>
      </div>

      {/* Mood + Key themes */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
        {dna.mood.map((m) => (
          <Pill key={m} label={m} accent />
        ))}
        {dna.keyThemes.map((k) => (
          <Pill key={k} label={k} />
        ))}
      </div>

      {/* BPM range + Energy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            border: `1px solid ${themeVars.accentBorder}`,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: themeVars.textTertiary, marginBottom: 4 }}>
            BPM RANGE
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: themeVars.textPrimary }}>
            {dna.bpmRange.avg}
          </p>
          <p style={{ fontSize: 10, color: themeVars.textTertiary }}>
            {dna.bpmRange.min}–{dna.bpmRange.max}
          </p>
        </div>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            border: `1px solid ${themeVars.accentBorder}`,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: themeVars.textTertiary, marginBottom: 4 }}>
            ENERGY
          </p>
          <div style={{ height: 4, borderRadius: 20, backgroundColor: "var(--bg-tertiary)", marginBottom: 6 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 20,
                background: "linear-gradient(to right, var(--accent-primary), var(--accent-secondary))",
                width: `${(dna.averageEnergy ?? 0.5) * 100}%`,
              }}
            />
          </div>
          <p style={{ fontSize: 10, color: themeVars.textTertiary }}>
            {Math.round((dna.averageEnergy ?? 0.5) * 100)}% {dna.era}
          </p>
        </div>
      </div>

      {/* Top artists, labels, genres */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: themeVars.textTertiary, textTransform: "uppercase" as const, marginBottom: 6 }}>
            Top Artists
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {dna.topArtists.slice(0, 3).map((a) => (
              <div
                key={a.name}
                style={{
                  fontSize: 11,
                  color: themeVars.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {a.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: themeVars.textTertiary, textTransform: "uppercase" as const, marginBottom: 6 }}>
            Top Labels
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {dna.topLabels.slice(0, 3).map((l) => (
              <div
                key={l.name}
                style={{
                  fontSize: 11,
                  color: themeVars.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {l.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: themeVars.textTertiary, textTransform: "uppercase" as const, marginBottom: 6 }}>
            Genres
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {dna.genres.slice(0, 3).map((g) => (
              <div
                key={g.name}
                style={{
                  fontSize: 11,
                  color: themeVars.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {g.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  track,
  index,
  onAdd,
  added,
}: {
  track: RecommendedTrack;
  index: number;
  onAdd: () => void;
  added: boolean;
}) {
  const [showWhy, setShowWhy] = useState(false);

  const gemScore = track.gemScore || 0;
  const scoreColor =
    gemScore >= 80
      ? themeVars.accentPrimary
      : gemScore >= 60
        ? themeVars.accentSecondary
        : themeVars.accentDanger;

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${added ? themeVars.accentBorder : themeVars.borderColor}`,
        backgroundColor: added ? themeVars.accentBg : themeVars.bgSecondary,
        padding: "12px 14px",
        transition: "all 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!added) {
          e.currentTarget.style.borderColor = themeVars.accentBorder;
          e.currentTarget.style.backgroundColor = themeVars.accentBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!added) {
          e.currentTarget.style.borderColor = themeVars.borderColor;
          e.currentTarget.style.backgroundColor = themeVars.bgSecondary;
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Album art or icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 6,
            backgroundColor: themeVars.bgTertiary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {track.albumArt ? (
            <img
              src={typeof track.albumArt === "string" ? track.albumArt : track.albumArt.medium}
              alt={track.title}
              style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "cover" }}
            />
          ) : (
            <Music size={24} color={themeVars.textTertiary} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: themeVars.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {track.artist}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: themeVars.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {track.title}
              </p>
            </div>

            {/* Mix score badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: 6,
                backgroundColor: scoreColor + "15",
                border: `1px solid ${scoreColor}40`,
                minWidth: 44,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {gemScore}
              </p>
              <p style={{ fontSize: 8, color: themeVars.textTertiary, marginTop: 2 }}>
                Score
              </p>
            </div>
          </div>

          {/* Tags: Key, BPM, Energy */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {track.camelotKey && (
              <Pill label={track.camelotKey} accent mono />
            )}
            {track.bpm && (
              <Pill label={`${track.bpm}`} mono />
            )}
            {track.energy !== undefined && (
              <Pill label={`${Math.round(track.energy)}% Energy`} />
            )}
            {track.label && (
              <Pill label={track.label} />
            )}
          </div>

          {/* Why it fits */}
          {track.whyItFits && (
            <button
              onClick={() => setShowWhy(!showWhy)}
              style={{
                border: "none",
                background: "transparent",
                color: themeVars.accentPrimary,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {showWhy ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Why it fits
            </button>
          )}

          {showWhy && track.whyItFits && (
            <p
              style={{
                fontSize: 11,
                color: themeVars.textSecondary,
                marginTop: 6,
                lineHeight: 1.5,
                padding: "6px 0 0 0",
              }}
            >
              {track.whyItFits}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <PlayButton
            track={{
              id: `rec-${index}`,
              artist: track.artist,
              title: track.title,
              label: track.label || "",
              bpm: track.bpm,
              key: track.camelotKey,
              energy: track.energy,
              spotifyUri: track.spotifyUri,
              spotifyId: track.spotifyId,
              albumCover: typeof track.albumArt === "string" ? track.albumArt : track.albumArt?.medium,
            }}
            size="md"
            variant="filled"
          />

          <button
            onClick={onAdd}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${added ? themeVars.accentPrimary : themeVars.borderColor}`,
              backgroundColor: added ? themeVars.accentPrimary : "transparent",
              color: added ? "#ffffff" : themeVars.textSecondary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.borderColor = themeVars.accentPrimary;
                e.currentTarget.style.backgroundColor = themeVars.accentBg;
                e.currentTarget.style.color = themeVars.accentPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                e.currentTarget.style.borderColor = themeVars.borderColor;
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeVars.textSecondary;
              }
            }}
          >
            {added ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "input" | "analyzing" | "results";

export default function DigEngine() {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputMode, setInputMode] = useState<"url" | "soundcloud" | "paste">(
    "url"
  );
  const [urlInput, setUrlInput] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [recCount, setRecCount] = useState(20);
  const [tracks, setTracks] = useState<TrackInput[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedIdxs, setAddedIdxs] = useState<Set<number>>(new Set());
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [crateSaved, setCrateSaved] = useState(false);
  const [crateName, setCrateName] = useState("");

  // ── URL import (auto-detect Spotify or Deezer) ─────────────────────────────
  const handleUrlImport = async () => {
    setSpotifyError(null);
    const isDeezer = /deezer\.com\//.test(urlInput);
    const isSpotify = /spotify\.com\//.test(urlInput);

    if (!isDeezer && !isSpotify) {
      setSpotifyError("Paste a Spotify or Deezer playlist URL.");
      return;
    }

    setLoadingMsg(
      isDeezer ? "Fetching from Deezer…" : "Fetching from Spotify…"
    );
    setPhase("analyzing");
    setProgress(0);
    try {
      const endpoint = isDeezer
        ? `/api/deezer?url=${encodeURIComponent(urlInput)}`
        : `/api/spotify?url=${encodeURIComponent(urlInput)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "SPOTIFY_NOT_CONFIGURED") {
          setPhase("input");
          setSpotifyError(
            "Spotify credentials not configured. Use the paste method instead."
          );
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
      setError(e.message);
      setPhase("input");
    }
  };

  // ── Paste import ───────────────────────────────────────────────────────────
  const handlePasteImport = async () => {
    const parsed = parseTrackLines(pasteInput);
    if (parsed.length < 3) {
      setError("Paste at least 3 tracks in 'Artist - Title' format.");
      return;
    }
    setTracks(parsed);
    setPlaylistName("My Playlist");
    setCrateName("My Playlist");
    setPhase("analyzing");
    await runAnalysis(parsed, "My Playlist");
  };

  // ── Core analysis ──────────────────────────────────────────────────────────
  const runAnalysis = useCallback(
    async (trackList: TrackInput[], name: string) => {
      setError(null);
      setProgress(0);
      setLoadingMsg("Reading the vibe…");
      setAddedIdxs(new Set());

      const safeJson = async (res: Response) => {
        const text = await res.text();
        try {
          return { data: JSON.parse(text), ok: res.ok };
        } catch {
          throw new Error(
            text.slice(0, 120).trim() || `Server error ${res.status}`
          );
        }
      };

      // Progress ticker
      let pct = 0;
      const tick = setInterval(() => {
        pct = pct + (88 - pct) * 0.05;
        setProgress(Math.round(pct));
      }, 300);

      try {
        setLoadingMsg("Claude is analyzing…");
        const firstRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tracks: trackList,
            count: Math.min(recCount, 20),
          }),
        });
        const { data: firstData, ok } = await safeJson(firstRes);
        if (!ok || firstData.error)
          throw new Error(firstData.error || "Analysis failed");

        clearInterval(tick);
        const batchTotal = Math.max(1, Math.ceil(recCount / 20));
        setProgress(Math.round(90 / batchTotal));

        const partial: AnalyzeResponse = {
          dna: firstData.dna,
          recommendations: firstData.recommendations || [],
          trackCount: trackList.length,
        };
        setResult(partial);

        if (recCount <= 20) {
          setProgress(100);
          await new Promise((r) => setTimeout(r, 300));
          setPhase("results");
          return;
        }

        setPhase("results");

        // Fetch remaining batches
        const dnaSummary = firstData.dnaSummary || "";
        const allRecs = [...(firstData.recommendations || [])];
        const seen = new Set(
          allRecs.map((r: any) => `${r.artist}::${r.title}`.toLowerCase())
        );
        let done = 1;

        while (allRecs.length < recCount) {
          const remaining = recCount - allRecs.length;
          setLoadingMsg(
            `Finding more tracks… (${allRecs.length}/${recCount})`
          );
          const batchRes = await fetch("/api/analyze?mode=recs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tracks: trackList.slice(0, 30),
              count: Math.min(20, remaining),
              dnaSummary,
              exclude: Array.from(seen),
            }),
          });
          const { data: batchData } = await safeJson(batchRes);
          if (batchData.error) break;
          const newRecs = (batchData.recommendations || []).filter(
            (r: any) => {
              const key = `${r.artist}::${r.title}`.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            }
          );
          allRecs.push(...newRecs);
          done++;
          setProgress(
            Math.min(95, Math.round((90 / batchTotal) * done))
          );
          setResult((prev) =>
            prev
              ? { ...prev, recommendations: [...allRecs] }
              : prev
          );
        }

        setProgress(100);
        setLoadingMsg("");
      } catch (e: any) {
        clearInterval(tick);
        setError(e.message);
        if (!result) setPhase("input");
      }
    },
    [recCount, result]
  );

  // ── Save crate ─────────────────────────────────────────────────────────────
  const handleSaveCrate = () => {
    if (!result) return;
    const originalTracks: CrateTrack[] = tracks.map((t) => ({
      artist: t.artist,
      title: t.title,
      label: t.label,
      bpm: t.bpm,
      key: t.key,
      year: t.year,
      source: "original" as const,
    }));
    const addedTracks: CrateTrack[] = result.recommendations
      .filter((_, i) => addedIdxs.has(i))
      .map((r) => ({
        artist: r.artist,
        title: r.title,
        label: r.label,
        bpm: r.bpm,
        key: r.camelotKey,
        year: r.year,
        genre: r.genre,
        energy: r.energy,
        duration: r.duration,
        source: "added" as const,
      }));

    saveCrate({
      id: newCrateId(),
      name: crateName || playlistName || "New Crate",
      createdAt: Date.now(),
      tracks: [...originalTracks, ...addedTracks],
    });
    setCrateSaved(true);
    setTimeout(() => setCrateSaved(false), 2500);
  };

  // ── Export tracks ──────────────────────────────────────────────────────────
  const exportTracks: CrateTrack[] = [
    ...tracks.map((t) => ({
      artist: t.artist,
      title: t.title,
      label: t.label,
      bpm: t.bpm,
      key: t.key,
      year: t.year,
      source: "original" as const,
    })),
    ...(result?.recommendations
      .filter((_, i) => addedIdxs.has(i))
      .map((r) => ({
        artist: r.artist,
        title: r.title,
        label: r.label,
        bpm: r.bpm,
        key: r.camelotKey,
        year: r.year,
        source: "added" as const,
      })) || []),
  ];

  const toggleAdd = (i: number) =>
    setAddedIdxs((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const displayedRecs = result
    ? showAllRecs
      ? result.recommendations
      : result.recommendations.slice(0, 10)
    : [];

  // ── INPUT PHASE ────────────────────────────────────────────────────────────
  if (phase === "input")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: themeVars.textPrimary }}>
            New Dig
          </h1>
          <p style={{ fontSize: 13, color: themeVars.textSecondary, marginTop: 4 }}>
            Give CrateMate a playlist. It'll read the vibe and find tracks that belong.
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            gap: 2,
            borderRadius: 9,
            border: `1px solid ${themeVars.borderColor}`,
            backgroundColor: themeVars.bgTertiary,
            overflow: "hidden",
            alignSelf: "flex-start",
          }}
        >
          {(
            [
              { key: "url", label: "Playlist URL" },
              { key: "soundcloud", label: "SoundCloud" },
              { key: "paste", label: "Paste Tracks" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.key}
              onClick={() => setInputMode(mode.key)}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                backgroundColor:
                  inputMode === mode.key ? themeVars.bgSecondary : "transparent",
                color:
                  inputMode === mode.key
                    ? themeVars.textPrimary
                    : themeVars.textSecondary,
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Spotify/Deezer URL */}
        {inputMode === "url" && (
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: themeVars.bgSecondary,
              padding: 20,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: themeVars.textPrimary, marginBottom: 4 }}>
              Paste a playlist URL
            </p>
            <p style={{ fontSize: 12, color: themeVars.textSecondary, marginBottom: 14 }}>
              Spotify or Deezer. Public playlists only.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setSpotifyError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && urlInput && handleUrlImport()}
                placeholder="https://open.spotify.com/playlist/... or https://deezer.com/playlist/..."
                style={{
                  flex: 1,
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: `1px solid ${themeVars.borderColor}`,
                  fontSize: 13,
                  color: themeVars.textPrimary,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: themeVars.bgTertiary,
                }}
              />
              <button
                onClick={handleUrlImport}
                disabled={!urlInput}
                style={{
                  padding: "0 20px",
                  borderRadius: 9,
                  border: "none",
                  backgroundColor: urlInput ? themeVars.accentPrimary : themeVars.borderColor,
                  color: urlInput ? "#ffffff" : themeVars.textTertiary,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: urlInput ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                Import
              </button>
            </div>
            {spotifyError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 170, 0, 0.1)",
                  border: "1px solid var(--accent-warning)",
                  display: "flex",
                  gap: 8,
                }}
              >
                <AlertCircle
                  size={13}
                  color="var(--accent-warning)"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p style={{ fontSize: 12, color: "var(--accent-warning)", lineHeight: 1.5 }}>
                  {spotifyError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SoundCloud */}
        {inputMode === "soundcloud" && (
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: themeVars.bgSecondary,
              padding: 20,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: themeVars.textPrimary, marginBottom: 4 }}>
              Paste a SoundCloud URL
            </p>
            <p style={{ fontSize: 12, color: themeVars.textSecondary, marginBottom: 14 }}>
              Public sets and playlists. Loads via the SoundCloud widget.
            </p>
            <SoundCloudImport
              onTracks={(t, name) => {
                setTracks(t);
                setPlaylistName(name);
                setCrateName(name);
                setPhase("analyzing");
                runAnalysis(t, name);
              }}
            />
          </div>
        )}

        {/* Paste */}
        {inputMode === "paste" && (
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: themeVars.bgSecondary,
              padding: 20,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: themeVars.textPrimary, marginBottom: 4 }}>
              Paste your track list
            </p>
            <p style={{ fontSize: 12, color: themeVars.textSecondary, marginBottom: 14 }}>
              One per line:{" "}
              <code
                style={{
                  backgroundColor: themeVars.bgTertiary,
                  padding: "1px 5px",
                  borderRadius: 4,
                  color: themeVars.textSecondary,
                }}
              >
                Artist - Title
              </code>
            </p>
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="DJ Koze - XTC\nBicep - Glue\nTale Of Us - Goa\n..."
              style={{
                width: "100%",
                height: 160,
                padding: "10px 12px",
                borderRadius: 9,
                border: `1px solid ${themeVars.borderColor}`,
                fontSize: 13,
                color: themeVars.textPrimary,
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none",
                backgroundColor: themeVars.bgTertiary,
                boxSizing: "border-box" as const,
              }}
            />
            <p style={{ fontSize: 11, color: themeVars.textTertiary, marginTop: 6 }}>
              {parseTrackLines(pasteInput).length > 0
                ? `${parseTrackLines(pasteInput).length} tracks detected`
                : ""}
            </p>
          </div>
        )}

        {/* Recommendation count */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{ fontSize: 12, color: themeVars.textSecondary }}>Find me</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[10, 20, 30, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setRecCount(n)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: `1px solid ${recCount === n ? themeVars.accentPrimary : themeVars.borderColor}`,
                  backgroundColor:
                    recCount === n ? themeVars.accentBg : "transparent",
                  color:
                    recCount === n
                      ? themeVars.accentPrimary
                      : themeVars.textSecondary,
                  fontSize: 12,
                  fontWeight: recCount === n ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: themeVars.textSecondary }}>new tracks</p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              backgroundColor: "rgba(255, 68, 68, 0.1)",
              border: "1px solid var(--accent-danger)",
              display: "flex",
              gap: 8,
            }}
          >
            <AlertCircle
              size={13}
              color="var(--accent-danger)"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <p style={{ fontSize: 12, color: "var(--accent-danger)" }}>{error}</p>
          </div>
        )}

        {inputMode !== "soundcloud" && (
          <button
            onClick={
              inputMode === "url" ? handleUrlImport : handlePasteImport
            }
            disabled={
              inputMode === "url"
                ? !urlInput
                : parseTrackLines(pasteInput).length < 3
            }
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 10,
              border: "none",
              backgroundColor: themeVars.accentPrimary,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              boxShadow: "0 4px 14px rgba(0, 212, 170, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Sparkles size={15} /> Analyze & Find Tracks
          </button>
        )}
      </div>
    );

  // ── ANALYZING PHASE ────────────────────────────────────────────────────────
  if (phase === "analyzing")
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          minHeight: 340,
        }}
      >
        <div style={{ position: "relative", width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={themeVars.borderColor}
              strokeWidth="6"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={themeVars.accentPrimary}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: themeVars.textPrimary }}>
              {progress}%
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: themeVars.textPrimary }}>
            Reading the vibe…
          </p>
          <p style={{ fontSize: 13, color: themeVars.textSecondary, marginTop: 4 }}>
            {loadingMsg}
          </p>
        </div>
      </div>
    );

  // ── RESULTS PHASE ──────────────────────────────────────────────────────────
  if (!result) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap" as const,
        }}
      >
        <div>
          <input
            value={crateName}
            onChange={(e) => setCrateName(e.target.value)}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: themeVars.textPrimary,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              minWidth: 200,
              maxWidth: 400,
            }}
          />
          <p style={{ fontSize: 13, color: themeVars.textSecondary, marginTop: 6 }}>
            {result.trackCount} original · {result.recommendations.length} recommendations · {addedIdxs.size}{" "}
            selected
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button
            onClick={() => {
              setPhase("input");
              setResult(null);
              setAddedIdxs(new Set());
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: "transparent",
              fontSize: 12,
              color: themeVars.textSecondary,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            <RefreshCw size={12} /> New Dig
          </button>
          <button
            onClick={handleSaveCrate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: crateSaved
                ? "rgba(68, 255, 136, 0.1)"
                : "transparent",
              color: crateSaved ? "var(--accent-success)" : themeVars.textSecondary,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {crateSaved ? (
              <>
                <Check size={12} /> Saved!
              </>
            ) : (
              <>
                <Save size={12} /> Save Crate
              </>
            )}
          </button>
          {exportTracks.length > 0 && (
            <button
              onClick={() => setShowExport(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid var(--accent-secondary)",
                backgroundColor: "rgba(255, 85, 0, 0.08)",
                color: "var(--accent-secondary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <Upload size={12} /> Export to SoundCloud
            </button>
          )}
        </div>
      </div>

      {/* DNA Card */}
      {result.dna && <DNACard dna={result.dna} />}

      {/* Original playlist section */}
      <div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "0 0 10px 0",
            width: "100%",
          }}
        >
          <Music size={14} color={themeVars.textSecondary} />
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: themeVars.textPrimary,
              flex: 1,
              textAlign: "left" as const,
            }}
          >
            Original Playlist{" "}
            <span style={{ fontSize: 12, fontWeight: 400, color: themeVars.textTertiary }}>
              ({tracks.length} tracks)
            </span>
          </h2>
          {showOriginal ? (
            <ChevronUp size={14} color={themeVars.textTertiary} />
          ) : (
            <ChevronDown size={14} color={themeVars.textTertiary} />
          )}
        </button>
        {showOriginal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {tracks.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${themeVars.borderColor}`,
                  backgroundColor: themeVars.bgSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: themeVars.textTertiary,
                    fontFamily: "monospace",
                    minWidth: 20,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: themeVars.textPrimary, fontWeight: 600 }}>
                    {t.artist}
                  </p>
                  <p style={{ color: themeVars.textSecondary, fontSize: 11 }}>
                    {t.title}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {t.bpm && <Pill label={`${t.bpm}`} mono />}
                  {t.key && <Pill label={t.key} accent mono />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} color={themeVars.accentPrimary} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: themeVars.textPrimary }}>
              Recommendations{" "}
              <span style={{ fontSize: 12, fontWeight: 400, color: themeVars.textTertiary }}>
                ({result.recommendations.length} tracks)
              </span>
            </h2>
          </div>
          {addedIdxs.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: themeVars.accentPrimary, fontWeight: 600 }}>
                {addedIdxs.size} selected
              </span>
              <button
                onClick={handleSaveCrate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: themeVars.accentPrimary,
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Save size={11} /> Save to Crate
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayedRecs.map((track, i) => (
            <RecommendationCard
              key={i}
              track={track}
              index={i}
              added={addedIdxs.has(i)}
              onAdd={() => toggleAdd(i)}
            />
          ))}

          {loadingMsg && result.recommendations.length < recCount && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px dashed ${themeVars.borderColor}`,
                color: themeVars.textTertiary,
                fontSize: 12,
              }}
            >
              <Loader2
                size={13}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
              {loadingMsg}
            </div>
          )}
        </div>

        {result.recommendations.length > 10 && (
          <button
            onClick={() => setShowAllRecs(!showAllRecs)}
            style={{
              marginTop: 12,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              borderRadius: 8,
              border: `1px solid ${themeVars.borderColor}`,
              backgroundColor: "transparent",
              fontSize: 12,
              color: themeVars.textSecondary,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {showAllRecs ? (
              <>
                <ChevronUp size={13} /> Show less
              </>
            ) : (
              <>
                <ChevronDown size={13} /> Show all {result.recommendations.length}
              </>
            )}
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
