"use client";
import { useState } from "react";
import { X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { usePlayer } from "@/context/player-context";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)",
};

// Build SC widget URL using a SoundCloud search URL — no API key needed.
// The widget resolves the search client-side inside its own iframe.
function buildWidgetUrl(artist: string, title: string): string {
  const q = encodeURIComponent(`${artist} ${title}`);
  const scSearchUrl = encodeURIComponent(`https://soundcloud.com/search/sounds?q=${q}`);
  return [
    `https://w.soundcloud.com/player/?url=${scSearchUrl}`,
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
  ].join("&");
}

export default function PlayerBar() {
  const { currentTrack, stop } = usePlayer();
  const [expanded, setExpanded] = useState(true);

  if (!currentTrack) return null;

  const widgetHeight = expanded ? 300 : 166;

  return (
    <>
      <div className="player-bar">

        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center", height: 46,
          padding: "0 14px", gap: 10,
          borderBottom: `1px solid ${A.border}`,
        }}>

          {/* SC badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 8px", borderRadius: 12,
            backgroundColor: "#ff550015", border: "1px solid #ff550030", flexShrink: 0,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF5500" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#FF5500", letterSpacing: "0.05em" }}>
              SOUNDCLOUD
            </span>
          </div>

          {/* Track name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentTrack.artist} — {currentTrack.title}
            </p>
            {currentTrack.label && (
              <p style={{ fontSize: 10, color: A.t5 }}>{currentTrack.label}</p>
            )}
          </div>

          {/* Chips */}
          <div className="player-chips" style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {currentTrack.bpm && (
              <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, backgroundColor: "#f1f5f9", color: A.t4, fontFamily: "monospace" }}>
                {currentTrack.bpm} BPM
              </span>
            )}
            {currentTrack.key && (
              <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, backgroundColor: "#f1f5f9", color: A.t4, fontFamily: "monospace" }}>
                {currentTrack.key}
              </span>
            )}
          </div>

          {/* Open on SC */}
          <a
            href={`https://soundcloud.com/search/sounds?q=${encodeURIComponent(currentTrack.artist + " " + currentTrack.title)}`}
            target="_blank" rel="noopener noreferrer"
            title="Search on SoundCloud"
            style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, textDecoration: "none", flexShrink: 0 }}
          >
            <ExternalLink size={12} />
          </a>

          {/* Expand / collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Compact" : "Expand"}
            style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent", flexShrink: 0 }}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>

          {/* Close */}
          <button
            onClick={stop}
            style={{ width: 28, height: 28, border: `1px solid ${A.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t5, backgroundColor: "transparent", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = A.t5; }}
          >
            <X size={12} />
          </button>
        </div>

        {/* SC Widget iframe — loads entirely client-side, no API needed */}
        <iframe
          key={`${currentTrack.artist}-${currentTrack.title}`}
          src={buildWidgetUrl(currentTrack.artist, currentTrack.title)}
          width="100%"
          height={widgetHeight}
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          style={{ display: "block", border: "none" }}
        />
      </div>

      <style>{`
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
