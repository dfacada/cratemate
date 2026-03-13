"use client";

import { Play, Square, Loader2 } from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/player-context";

interface PlayButtonProps {
  /** The track to play */
  track: PlayerTrack;
  /** Button size: 'sm' (24px), 'md' (32px), 'lg' (40px) */
  size?: "sm" | "md" | "lg";
  /** If provided, clicking play will load the full list as a queue starting from queueIndex */
  queueTracks?: PlayerTrack[];
  /** Index in queueTracks to start playing from */
  queueIndex?: number;
  /** Button style: 'filled' (teal bg) or 'ghost' (transparent) */
  variant?: "filled" | "ghost";
}

export default function PlayButton({
  track,
  size = "md",
  queueTracks,
  queueIndex,
  variant = "filled",
}: PlayButtonProps) {
  const { currentTrack, status, play, pause, playAll, searchAndPlay } = usePlayer();

  // Compute pixel dimensions from size
  const sizeMap = { sm: 24, md: 32, lg: 40 };
  const pixels = sizeMap[size];
  const iconSize = Math.round(pixels * 0.42);

  // Track state
  const isCurrentTrack = currentTrack?.id === track.id;
  const isLoading = isCurrentTrack && status === "loading";
  const isPlaying = isCurrentTrack && status === "ready";

  // Colors
  const accentColor = "var(--accent-primary)";
  const borderColor = "var(--border)";
  const hoverBg = "rgba(0, 212, 170, 0.08)";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    if (isPlaying) {
      pause();
    } else if (queueTracks && queueIndex != null) {
      playAll(queueTracks, queueIndex);
    } else if (track.spotifyUri) {
      // Track already has Spotify URI — play directly
      play(track);
    } else {
      // No Spotify URI — search Spotify first, then play
      searchAndPlay(track);
    }
  };

  // Filled variant: teal background with white icon
  if (variant === "filled") {
    return (
      <button
        onClick={handleClick}
        title={isPlaying ? "Pause" : "Play preview"}
        style={{
          width: pixels,
          height: pixels,
          borderRadius: "50%",
          flexShrink: 0,
          border: `1.5px solid ${isPlaying ? accentColor : borderColor}`,
          backgroundColor: isPlaying ? accentColor : "transparent",
          cursor: isLoading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isPlaying ? "#ffffff" : "var(--text-secondary)",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isPlaying && !isLoading) {
            const btn = e.currentTarget;
            btn.style.borderColor = accentColor;
            btn.style.backgroundColor = hoverBg;
            btn.style.color = accentColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isPlaying) {
            const btn = e.currentTarget;
            btn.style.borderColor = borderColor;
            btn.style.backgroundColor = "transparent";
            btn.style.color = "var(--text-secondary)";
          }
        }}
      >
        {isLoading ? (
          <Loader2 size={iconSize} style={{ animation: "spin 0.7s linear infinite" }} />
        ) : isPlaying ? (
          <Square size={iconSize} fill="currentColor" />
        ) : (
          <Play size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />
        )}
      </button>
    );
  }

  // Ghost variant: transparent with teal icon
  return (
    <button
      onClick={handleClick}
      title={isPlaying ? "Pause" : "Play preview"}
      style={{
        width: pixels,
        height: pixels,
        borderRadius: "50%",
        flexShrink: 0,
        border: "none",
        backgroundColor: "transparent",
        cursor: isLoading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isPlaying ? accentColor : "var(--text-secondary)",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          const btn = e.currentTarget;
          btn.style.color = accentColor;
          btn.style.backgroundColor = hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.color = isPlaying ? accentColor : "var(--text-secondary)";
        btn.style.backgroundColor = "transparent";
      }}
    >
      {isLoading ? (
        <Loader2 size={iconSize} style={{ animation: "spin 0.7s linear infinite" }} />
      ) : isPlaying ? (
        <Square size={iconSize} fill="currentColor" />
      ) : (
        <Play size={iconSize} fill="currentColor" style={{ marginLeft: 1 }} />
      )}
    </button>
  );
}
