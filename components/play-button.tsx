"use client";
import { Play, Pause, Loader2, AlertCircle } from "lucide-react";
import { usePlayer, PlayerTrack } from "@/context/player-context";

export default function PlayButton({ track, size = 28 }: { track: PlayerTrack; size?: number }) {
  const { currentTrack, isPlaying, isLoading, error, play, pause, resume } = usePlayer();

  const isThis       = currentTrack?.id === track.id;
  const thisLoading  = isThis && isLoading;
  const thisPlaying  = isThis && isPlaying;
  const thisError    = isThis && !!error;
  const accent       = "#00B4D8";
  const iconSize     = Math.round(size * 0.42);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thisLoading) return;
    if (thisError)   { play(track); return; }  // retry on error
    if (thisPlaying) { pause(); return; }
    if (isThis)      { resume(); return; }
    play(track);
  };

  const bg     = isThis ? (thisError ? "#fef2f2" : accent) : "transparent";
  const border  = isThis ? (thisError ? "#fca5a5" : accent) : "#e2e8f0";
  const color   = isThis ? (thisError ? "#ef4444" : "#fff") : "#94a3b8";

  return (
    <button
      onClick={handleClick}
      title={thisPlaying ? "Pause" : thisError ? "Retry" : "Play 30s preview"}
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${border}`,
        backgroundColor: bg,
        cursor: thisLoading ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color, transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        if (!isThis) {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.08)";
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
      {thisLoading  ? <Loader2    size={iconSize} style={{ animation: "spin 0.7s linear infinite" }} /> :
       thisError    ? <AlertCircle size={iconSize} /> :
       thisPlaying  ? <Pause      size={iconSize} fill="currentColor" /> :
                      <Play       size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
