"use client";
import { Play, Square } from "lucide-react";
import { usePlayer, PlayerTrack } from "@/context/player-context";

export default function PlayButton({ track, size = 28 }: { track: PlayerTrack; size?: number }) {
  const { currentTrack, play, stop } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const accent   = "#00B4D8";
  const iconSize = Math.round(size * 0.42);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    isActive ? stop() : play(track);
  };

  return (
    <button
      onClick={handleClick}
      title={isActive ? "Close player" : "Play on SoundCloud"}
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${isActive ? accent : "#e2e8f0"}`,
        backgroundColor: isActive ? accent : "transparent",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isActive ? "#fff" : "#94a3b8",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.08)";
          e.currentTarget.style.color = accent;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#94a3b8";
        }
      }}
    >
      {isActive
        ? <Square size={iconSize} fill="currentColor" />
        : <Play   size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />
      }
    </button>
  );
}
