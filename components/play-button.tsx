"use client";
import { Play, Pause } from "lucide-react";
import { usePlayer, PlayerTrack } from "@/context/player-context";

export default function PlayButton({ track, size = "sm" }: { track: PlayerTrack; size?: "sm" | "md" }) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const playing = isThis && isPlaying;
  const dim = size === "sm" ? 24 : 30;
  const iconSize = size === "sm" ? 9 : 12;

  return (
    <button
      onClick={e => { e.stopPropagation(); isThis ? (isPlaying ? pause() : resume()) : play(track); }}
      title={playing ? "Pause" : `Play ${track.artist} — ${track.title}`}
      style={{ width:dim, height:dim, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s",
        backgroundColor: playing ? "#00B4D8" : "#f1f5f9",
        color: playing ? "#fff" : "#64748b",
        boxShadow: playing ? "0 2px 8px rgba(0,180,216,0.35)" : "none",
        transform: playing ? "scale(1.1)" : "scale(1)",
      }}
      onMouseEnter={e => { if (!playing) { e.currentTarget.style.backgroundColor = "#00B4D8"; e.currentTarget.style.color = "#fff"; }}}
      onMouseLeave={e => { if (!playing) { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}}
    >
      {playing
        ? <Pause size={iconSize} style={{ fill:"currentColor" }} />
        : <Play size={iconSize} style={{ fill:"currentColor", marginLeft:1 }} />}
    </button>
  );
}
