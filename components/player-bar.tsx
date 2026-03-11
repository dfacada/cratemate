"use client";
import { useState } from "react";
import { X, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { usePlayer } from "@/context/player-context";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)",
};

// Deezer embeddable widget — no API key, plays full 30s preview
// Works on iOS since the iframe is self-contained
function deezerWidgetUrl(trackId: number, dark = false) {
  const theme = dark ? "dark" : "light";
  return `https://widget.deezer.com/widget/${theme}/track/${trackId}?autoplay=1&tracklist=false&radius=false`;
}

export default function PlayerBar() {
  const { currentTrack, deezerResult, status, errorMsg, stop, swapCandidate, play } = usePlayer();
  const [expanded,       setExpanded]       = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);

  if (!currentTrack || status === "idle") return null;

  const loading = status === "loading";
  const isError = status === "error";
  const isReady = status === "ready" && !!deezerResult;
  const wrongMatch = isReady && deezerResult && (
    deezerResult.title.toLowerCase() !== currentTrack.title.toLowerCase() ||
    deezerResult.artist.toLowerCase() !== currentTrack.artist.toLowerCase()
  );

  return (
    <>
      <div className="player-bar">

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: A.accentBg, border: "1px solid rgba(0,180,216,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Loader2 size={16} color={A.accent} style={{ animation: "spin 0.7s linear infinite" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1 }}>{currentTrack.artist} — {currentTrack.title}</p>
              <p style={{ fontSize: 11, color: A.t4 }}>Finding on Deezer…</p>
            </div>
            <button onClick={stop} style={closeBtn}><X size={12} /></button>
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={16} color="#ef4444" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1 }}>{currentTrack.artist} — {currentTrack.title}</p>
              <p style={{ fontSize: 11, color: "#dc2626" }}>{errorMsg}</p>
            </div>
            <button onClick={() => play(currentTrack)} style={{ ...actionBtn, color: A.accent, borderColor: "rgba(0,180,216,0.3)", backgroundColor: A.accentBg }}>Retry</button>
            <button onClick={stop} style={closeBtn}><X size={12} /></button>
          </div>
        )}

        {/* ── Ready: Deezer widget ── */}
        {isReady && deezerResult && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", height: 46, padding: "0 14px", gap: 10, borderBottom: `1px solid ${A.border}` }}>

              {/* Deezer badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 12, backgroundColor: "#a855f715", border: "1px solid #a855f730", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#a855f7" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", letterSpacing: "0.05em" }}>DEEZER</span>
              </div>

              {/* Track info — show if wrong match */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {wrongMatch ? (
                    <>
                      <span style={{ color: A.t4, fontWeight: 400, fontSize: 11, marginRight: 6 }}>
                        {currentTrack.artist} — {currentTrack.title} →
                      </span>
                      {deezerResult.artist} — {deezerResult.title}
                    </>
                  ) : (
                    <>{currentTrack.artist} — {currentTrack.title}</>
                  )}
                </p>
              </div>

              {/* Chips (desktop only) */}
              <div className="player-chips">
                {currentTrack.bpm && <Chip label={`${currentTrack.bpm} BPM`} />}
                {currentTrack.key && <Chip label={currentTrack.key} />}
              </div>

              {/* Wrong match picker */}
              {deezerResult.candidates?.length > 1 && (
                <button onClick={() => setShowCandidates(!showCandidates)}
                  style={{ ...actionBtn, color: showCandidates ? A.accent : A.t5, borderColor: showCandidates ? "rgba(0,180,216,0.3)" : A.border, backgroundColor: showCandidates ? A.accentBg : "transparent" }}>
                  Wrong?
                </button>
              )}

              {/* Expand */}
              <button onClick={() => setExpanded(!expanded)} style={iconBtn} title={expanded ? "Compact" : "Full player"}>
                {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>

              {/* Open on Deezer */}
              <a href={deezerResult.link} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: "none" } as any}>
                <ExternalLink size={12} />
              </a>

              {/* Close */}
              <button onClick={stop} style={closeBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = A.t5; }}>
                <X size={12} />
              </button>
            </div>

            {/* Candidate picker */}
            {showCandidates && (
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${A.border}`, backgroundColor: "#fafafa" }}>
                <p style={{ fontSize: 10, color: A.t5, marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>DEEZER MATCHES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {deezerResult.candidates.map((c) => (
                    <button key={c.id} onClick={() => { swapCandidate(c.id); setShowCandidates(false); }}
                      style={{ textAlign: "left", padding: "6px 10px", borderRadius: 6, border: `1px solid ${c.id === deezerResult.id ? A.accent : A.border}`, backgroundColor: c.id === deezerResult.id ? A.accentBg : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                        <p style={{ fontSize: 10, color: A.t4 }}>{c.artist}</p>
                      </div>
                      <span style={{ fontSize: 10, color: A.t5 }}>score {c.score}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Deezer Widget iframe */}
            <iframe
              key={deezerResult.id}
              src={deezerWidgetUrl(deezerResult.id)}
              width="100%"
              height={expanded ? 250 : 80}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ display: "block", border: "none" }}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .player-bar {
          position: fixed;
          bottom: 0; left: 224px; right: 0;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
          z-index: 39;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .player-bar { left: 0; bottom: 56px; }
          .player-chips { display: none; }
        }
      `}</style>
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, backgroundColor: "#f1f5f9", color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const closeBtn: React.CSSProperties = {
  width: 28, height: 28, border: `1px solid #e2e8f0`, borderRadius: 7,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  color: "#94a3b8", backgroundColor: "transparent", flexShrink: 0,
};
const iconBtn: React.CSSProperties = {
  ...closeBtn,
};
const actionBtn: React.CSSProperties = {
  padding: "4px 9px", fontSize: 11, fontWeight: 600,
  border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer",
  backgroundColor: "transparent", color: "#94a3b8", flexShrink: 0,
};
