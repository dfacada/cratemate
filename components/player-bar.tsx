"use client";
import { useState } from "react";
import { X, Disc3, ExternalLink, Music } from "lucide-react";
import { usePlayer } from "@/context/player-context";

const A = { border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8" };

// Platform link builders
function buildLinks(artist: string, title: string) {
  const q = encodeURIComponent(`${artist} ${title}`);
  const qArtist = encodeURIComponent(artist);
  return [
    {
      id: "youtube",
      label: "YouTube",
      color: "#FF0000",
      bg: "#fff1f1",
      hoverBg: "#ffe0e0",
      href: `https://www.youtube.com/results?search_query=${q}`,
      abbr: "YT",
    },
    {
      id: "soundcloud",
      label: "SoundCloud",
      color: "#FF5500",
      bg: "#fff4f0",
      hoverBg: "#ffe8e0",
      href: `https://soundcloud.com/search?q=${q}`,
      abbr: "SC",
    },
    {
      id: "beatport",
      label: "Beatport",
      color: "#04BE5B",
      bg: "#f0fdf6",
      hoverBg: "#dcfce7",
      href: `https://www.beatport.com/search?q=${q}`,
      abbr: "BP",
    },
    {
      id: "spotify",
      label: "Spotify",
      color: "#1DB954",
      bg: "#f0fdf6",
      hoverBg: "#dcfce7",
      href: `https://open.spotify.com/search/${q}`,
      abbr: "SPF",
    },
  ];
}

export default function PlayerBar() {
  const { currentTrack, isPlaying, stop } = usePlayer();
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  if (!currentTrack) return null;

  const links = buildLinks(currentTrack.artist, currentTrack.title);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 68, zIndex: 50,
      backgroundColor: "#fff", borderTop: `1px solid ${A.border}`,
      boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
      display: "flex", alignItems: "stretch",
    }}>

      {/* Track info */}
      <div style={{
        width: 280, flexShrink: 0, borderRight: `1px solid #f1f5f9`,
        display: "flex", alignItems: "center", gap: 12, padding: "0 18px",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          backgroundColor: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isPlaying ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 3, borderRadius: 2, backgroundColor: A.accent,
                  animation: `playerBar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                  height: `${30 + i * 14}%`,
                }} />
              ))}
            </div>
          ) : (
            <Disc3 size={17} color={A.accent} />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentTrack.title}
          </p>
          <p style={{ fontSize: 11, color: A.t4, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentTrack.artist}{currentTrack.label ? ` · ${currentTrack.label}` : ""}
          </p>
        </div>
      </div>

      {/* Center: "Listen on" platform buttons */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, padding: "0 24px",
      }}>
        <span style={{ fontSize: 11, color: A.t5, marginRight: 4, whiteSpace: "nowrap" }}>
          Listen on
        </span>
        {links.map(link => {
          const isHovered = hoveredPlatform === link.id;
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredPlatform(link.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", borderRadius: 20,
                border: `1.5px solid ${isHovered ? link.color + "55" : A.border}`,
                backgroundColor: isHovered ? link.bg : "#fafafa",
                textDecoration: "none", transition: "all 0.15s",
                boxShadow: isHovered ? `0 2px 8px ${link.color}22` : "none",
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                backgroundColor: link.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <ExternalLink size={8} color="#fff" />
              </span>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: isHovered ? link.color : A.t3,
                whiteSpace: "nowrap",
              }}>
                {link.label}
              </span>
            </a>
          );
        })}

        {/* BPM / Key / Energy chips */}
        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          {currentTrack.bpm && (
            <span style={{ padding: "3px 8px", borderRadius: 6, backgroundColor: "#f1f5f9", fontFamily: "monospace", fontSize: 10, color: A.t4 }}>
              {currentTrack.bpm} BPM
            </span>
          )}
          {currentTrack.key && (
            <span style={{ padding: "3px 8px", borderRadius: 6, backgroundColor: "#f1f5f9", fontFamily: "monospace", fontSize: 10, color: A.t4 }}>
              {currentTrack.key}
            </span>
          )}
          {currentTrack.energy && (
            <span style={{ padding: "3px 8px", borderRadius: 6, backgroundColor: "rgba(0,180,216,0.1)", fontFamily: "monospace", fontSize: 10, color: A.accent }}>
              E{currentTrack.energy}
            </span>
          )}
        </div>
      </div>

      {/* Close */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "0 14px", borderLeft: "1px solid #f1f5f9" }}>
        <button
          onClick={stop}
          title="Close player"
          style={{
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${A.border}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: A.t5, backgroundColor: "transparent", transition: "all 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = A.t5; e.currentTarget.style.borderColor = A.border; }}
        >
          <X size={13} />
        </button>
      </div>

      <style>{`
        @keyframes playerBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
