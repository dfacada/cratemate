"use client";
import { Play, Square, Loader2 } from "lucide-react";
import { usePlayer, PlayerTrack } from "@/context/player-context";

interface PlayButtonProps {
  track: PlayerTrack;
  size?: number;
  /** If provided, clicking play will load the full list as a queue starting from this track */
  queueTracks?: PlayerTrack[];
  queueIndex?: number;
}

export default function PlayButton({ track, size = 28, queueTracks, queueIndex }: PlayButtonProps) {
  const { currentTrack, status, play, stop, playAll } = usePlayer();
  const isThis   = currentTrack?.id === track.id;
  const loading  = isThis && status === "loading";
  const active   = isThis && status === "ready";
  const accent   = "#00B4D8";
  const iconSize = Math.round(size * 0.42);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    if (active) {
      stop();
    } else if (queueTracks && queueIndex != null) {
      // Play this track and load the full queue for next/prev
      playAll(queueTracks, queueIndex);
    } else {
      play(track);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={active ? "Close player" : "Play preview"}
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${active ? accent : "#e2e8f0"}`,
        backgroundColor: active ? accent : "transparent",
        cursor: loading ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : "#94a3b8", transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.08)"; e.currentTarget.style.color = accent; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}}
    >
      {loading ? <Loader2 size={iconSize} style={{ animation: "spin 0.7s linear infinite" }} /> :
       active   ? <Square  size={iconSize} fill="currentColor" /> :
                  <Play    size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />}
    </button>
  );
}
