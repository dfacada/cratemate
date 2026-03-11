"use client";
import { Play, Pause, Loader2 } from "lucide-react";
import { usePlayer, PlayerTrack } from "@/context/player-context";

export default function PlayButton({ track, size = 28 }: { track: PlayerTrack; size?: number }) {
  const { currentTrack, isPlaying, isLoading, play, pause, resume } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const thisLoading = isThis && isLoading;
  const thisPlaying = isThis && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thisLoading) return;
    if (thisPlaying) { pause(); return; }
    if (isThis && !isPlaying) { resume(); return; }
    play(track);
  };

  const iconSize = Math.round(size * 0.45);
  const accent = "#00B4D8";

  return (
    <button
      onClick={handleClick}
      title={thisPlaying ? "Pause" : "Play preview"}
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${isThis ? accent : "#e2e8f0"}`,
        backgroundColor: isThis ? (thisPlaying ? accent : "rgba(0,180,216,0.08)") : "transparent",
        cursor: thisLoading ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isThis ? accent : "#94a3b8",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        if (!isThis) {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.06)";
          e.currentTarget.style.color = accent;
        }
      }}
      onMouseLeave={e => {
        if (!isThis) {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#94a3b8";
        }
      }}
    >
      {thisLoading
        ? <Loader2 size={iconSize} style={{ animation: "spin 0.7s linear infinite" }} />
        : thisPlaying
        ? <Pause size={iconSize} fill="currentColor" />
        : <Play  size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />
      }
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
