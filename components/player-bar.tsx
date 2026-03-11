"use client";
import { useState } from "react";
import { X, Music2, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Loader2, Settings } from "lucide-react";
import { usePlayer } from "@/context/player-context";

const A = {
  bg: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)",
};

// Build the SC widget iframe URL
function scWidgetUrl(permalink: string) {
  const encoded = encodeURIComponent(permalink);
  return [
    `https://w.soundcloud.com/player/?url=${encoded}`,
    "auto_play=true",
    "visual=true",
    "show_artwork=true",
    "hide_related=true",
    "show_comments=false",
    "show_user=true",
    "show_reposts=false",
    "show_teaser=false",
    "buying=false",
    "liking=false",
    "download=false",
    "sharing=false",
    `color=${encodeURIComponent("#00B4D8")}`,
  ].join("&");
}

export default function PlayerBar() {
  const { currentTrack, scResult, status, errorMsg, stop, swapCandidate, play } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);

  if (!currentTrack || status === "idle") return null;

  const isLoading = status === "loading";
  const isError   = status === "error" || status === "no_client_id";
  const isReady   = status === "ready" && !!scResult;
  const noClientId = status === "no_client_id";

  // Compact height when not expanded, tall when expanded
  const widgetHeight = expanded ? 300 : 166;

  return (
    <>
      <div className="player-bar">

        {/* ── Loading state ── */}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 68, padding: "0 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: A.accentBg, border: `1px solid rgba(0,180,216,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Loader2 size={16} color={A.accent} style={{ animation: "spin 0.7s linear infinite" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, marginBottom: 2 }}>{currentTrack.title}</p>
              <p style={{ fontSize: 11, color: A.t4 }}>Searching SoundCloud…</p>
            </div>
            <button onClick={stop} style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent" }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 68, padding: "0 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: noClientId ? "#fff7ed" : "#fef2f2", border: `1px solid ${noClientId ? "#fed7aa" : "#fecaca"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {noClientId ? <Settings size={16} color="#f97316" /> : <AlertCircle size={16} color="#ef4444" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, marginBottom: 2 }}>{currentTrack.title}</p>
              <p style={{ fontSize: 11, color: noClientId ? "#ea580c" : "#dc2626" }}>{errorMsg}</p>
              {noClientId && (
                <p style={{ fontSize: 10, color: A.t5, marginTop: 2 }}>
                  Add <code style={{ fontSize: 10, backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>SOUNDCLOUD_CLIENT_ID</code> to Vercel env vars
                </p>
              )}
            </div>
            <button onClick={() => play(currentTrack)} style={{ padding: "5px 10px", fontSize: 11, color: A.accent, fontWeight: 600, border: `1px solid rgba(0,180,216,0.3)`, borderRadius: 6, cursor: "pointer", backgroundColor: A.accentBg, marginRight: 6 }}>Retry</button>
            <button onClick={stop} style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent" }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── Ready: SoundCloud widget ── */}
        {isReady && scResult && (
          <div>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", height: 48, padding: "0 14px", gap: 10, borderBottom: expanded ? `1px solid ${A.border}` : "none" }}>

              {/* SC logo pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 12, backgroundColor: "#ff550015", border: "1px solid #ff550030", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF5500" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FF5500", letterSpacing: "0.05em" }}>SOUNDCLOUD</span>
              </div>

              {/* Track name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {scResult.scTitle}
                  {scResult.scTitle.toLowerCase() !== currentTrack.title.toLowerCase() && (
                    <span style={{ fontSize: 10, color: A.t5, marginLeft: 6, fontWeight: 400 }}>
                      (searched: {currentTrack.title})
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: A.t4 }}>{scResult.scArtist}</p>
              </div>

              {/* Wrong match? — show candidates */}
              {scResult.candidates && scResult.candidates.length > 1 && (
                <button
                  onClick={() => setShowCandidates(!showCandidates)}
                  title="Wrong track? Pick a different match"
                  style={{ padding: "4px 8px", fontSize: 10, color: A.t4, border: `1px solid ${A.border}`, borderRadius: 6, cursor: "pointer", backgroundColor: "transparent", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}
                >
                  Wrong match?
                  {showCandidates ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              )}

              {/* Expand / collapse widget height */}
              <button
                onClick={() => setExpanded(!expanded)}
                title={expanded ? "Compact view" : "Expand player"}
                style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent", flexShrink: 0 }}
              >
                {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>

              {/* Open on SC */}
              <a href={scResult.permalink_url} target="_blank" rel="noopener noreferrer"
                style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, textDecoration: "none", flexShrink: 0 }}>
                <ExternalLink size={12} />
              </a>

              {/* Close */}
              <button onClick={stop}
                style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = A.t5; }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Candidate picker */}
            {showCandidates && scResult.candidates && (
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${A.border}`, backgroundColor: "#fafafa" }}>
                <p style={{ fontSize: 10, color: A.t5, marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>ALTERNATIVE MATCHES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {scResult.candidates.map((c, i) => (
                    <button key={i} onClick={() => { swapCandidate(c.url); setShowCandidates(false); }}
                      style={{ textAlign: "left", padding: "6px 10px", borderRadius: 6, border: `1px solid ${c.url === scResult.permalink_url ? A.accent : A.border}`, backgroundColor: c.url === scResult.permalink_url ? A.accentBg : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                        <p style={{ fontSize: 10, color: A.t4 }}>{c.artist}</p>
                      </div>
                      <span style={{ fontSize: 10, color: A.t5, flexShrink: 0 }}>score: {Math.round(c.score)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* The SC widget iframe */}
            <iframe
              key={scResult.permalink_url}  // force remount when track changes
              src={scWidgetUrl(scResult.permalink_url)}
              width="100%"
              height={widgetHeight}
              scrolling="no"
              frameBorder="0"
              allow="autoplay"
              style={{ display: "block", border: "none" }}
            />
          </div>
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
        }
      `}</style>
    </>
  );
}
