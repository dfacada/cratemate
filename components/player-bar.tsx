"use client";
import { useState } from "react";
import { X, ExternalLink, AlertCircle, Loader2, ChevronDown, ChevronUp, RefreshCw, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import BeatportEnrichment from "@/components/beatport-enrichment";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)",
};
const SC_ORANGE = "#FF5500";

export default function PlayerBar() {
  const {
    currentTrack, scResult, status, errorMsg, stop, play,
    queue, queueIndex, next, prev, hasNext, hasPrev,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack || status === "idle") return null;

  const loading = status === "loading";
  const isError = status === "error";
  const isReady = status === "ready" && !!scResult?.embed_url;
  const inQueue = queue.length > 1;

  // Transport controls (next/prev) — shown in all states when there's a queue
  const transportControls = inQueue ? (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button
        onClick={prev}
        disabled={!hasPrev}
        style={{
          ...navBtn,
          opacity: hasPrev ? 1 : 0.3,
          cursor: hasPrev ? "pointer" : "default",
        }}
        title="Previous track"
      >
        <SkipBack size={13} fill="currentColor" />
      </button>
      <span style={{
        fontSize: 10, color: A.t5, fontFamily: "monospace",
        minWidth: 38, textAlign: "center",
      }}>
        {queueIndex + 1}/{queue.length}
      </span>
      <button
        onClick={next}
        disabled={!hasNext}
        style={{
          ...navBtn,
          opacity: hasNext ? 1 : 0.3,
          cursor: hasNext ? "pointer" : "default",
        }}
        title="Next track"
      >
        <SkipForward size={13} fill="currentColor" />
      </button>
    </div>
  ) : null;

  return (
    <>
      <div className="player-bar">

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 16px" }}>
            {transportControls}
            <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: "#FF550012", border: "1px solid #FF550030", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Loader2 size={16} color={SC_ORANGE} style={{ animation: "spin 0.7s linear infinite" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentTrack.artist} — {currentTrack.title}
              </p>
              <p style={{ fontSize: 11, color: A.t4 }}>Finding on SoundCloud…</p>
            </div>
            <button onClick={stop} style={closeBtn}><X size={12} /></button>
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 16px" }}>
            {transportControls}
            <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={16} color="#ef4444" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentTrack.artist} — {currentTrack.title}
              </p>
              <p style={{ fontSize: 11, color: "#dc2626" }}>{errorMsg}</p>
            </div>
            <div className="player-chips">
              <BeatportEnrichment track={currentTrack} />
            </div>
            <button onClick={() => play(currentTrack, true)} style={actionBtn} title="Retry">
              <RefreshCw size={11} style={{ marginRight: 4 }} /> Retry
            </button>
            {/* If error and there's a next track, offer to skip */}
            {hasNext && (
              <button onClick={next} style={actionBtn} title="Skip to next">
                <SkipForward size={11} style={{ marginRight: 4 }} /> Skip
              </button>
            )}
            <button onClick={stop} style={closeBtn}><X size={12} /></button>
          </div>
        )}

        {/* ── Ready ── */}
        {isReady && scResult && (
          <>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", height: 46, padding: "0 14px", gap: 10, borderBottom: `1px solid ${A.border}` }}>

              {/* Transport controls */}
              {transportControls}

              {/* SC badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 12, backgroundColor: "#FF550012", border: "1px solid #FF550030", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: SC_ORANGE }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: SC_ORANGE, letterSpacing: "0.05em" }}>SOUNDCLOUD</span>
                {scResult.confidence != null && (
                  <span style={{ fontSize: 9, color: "#FF550080" }}>{Math.round(scResult.confidence * 100)}%</span>
                )}
              </div>

              {/* Track name */}
              <div style={{ flex: "0 1 280px", minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentTrack.artist} — {currentTrack.title}
                </p>
              </div>

              {/* Beatport chips */}
              <div className="player-chips" style={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden" }}>
                <BeatportEnrichment track={currentTrack} />
              </div>

              <button onClick={() => setExpanded(!expanded)} style={iconBtn} title={expanded ? "Compact" : "Full player"}>
                {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
              {scResult.soundcloud_url && (
                <a href={scResult.soundcloud_url} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: "none" } as any} title="Open on SoundCloud">
                  <ExternalLink size={12} />
                </a>
              )}
              <button onClick={stop} style={closeBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = A.t5; }}>
                <X size={12} />
              </button>
            </div>

            {/* SC widget iframe */}
            <iframe
              key={scResult.embed_url!}
              src={scResult.embed_url!}
              width="100%"
              height={expanded ? 166 : 80}
              scrolling="no"
              frameBorder="0"
              allow="autoplay"
              style={{ display: "block", border: "none" }}
            />
          </>
        )}
      </div>

    </>
  );
}

const closeBtn: React.CSSProperties = {
  width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 7,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  color: "#94a3b8", backgroundColor: "transparent", flexShrink: 0,
};
const iconBtn: React.CSSProperties = { ...closeBtn };
const actionBtn: React.CSSProperties = {
  display: "flex", alignItems: "center",
  padding: "4px 9px", fontSize: 11, fontWeight: 600,
  border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer",
  backgroundColor: "transparent", color: "#94a3b8", flexShrink: 0,
};
const navBtn: React.CSSProperties = {
  width: 30, height: 30, border: "none", borderRadius: 7,
  display: "flex", alignItems: "center", justifyContent: "center",
  backgroundColor: "transparent", color: "#64748b", flexShrink: 0,
  transition: "all 0.15s",
};
