"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Loader2,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Shuffle,
  Repeat,
} from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { getCamelotColor } from "@/lib/theme";

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    scResult,
    status,
    playbackSource,
    isPlaying,
    position,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    hasNext,
    hasPrev,
    seek,
    setVolume: setVolumeControl,
    audioRef,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(volume);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentTrack || status === "idle") return null;

  const isLoading = status === "loading";
  const isError = status === "error";
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const handleVolumeChange = (newVolume: number) => {
    const bounded = Math.max(0, Math.min(1, newVolume));
    setVolumeControl(bounded);
    if (bounded > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      handleVolumeChange(volumeBeforeMute);
      setIsMuted(false);
    } else {
      setVolumeBeforeMute(volume);
      handleVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newPosition = percent * duration;
    seek(newPosition);
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  return (
    <motion.div
      layout
      className="fixed bottom-0 left-0 right-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: "rgba(12,13,20,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Progress Bar - Always Visible */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="h-1 w-full cursor-pointer hover:h-1.5 transition-all duration-150"
        style={{
          backgroundColor: "rgba(0,212,170,0.12)",
          position: "relative",
        }}
        title="Click to seek"
      >
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: "var(--accent-primary, #00d4aa)",
          }}
        />
      </div>

      {/* Main Player Container */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Left: Album Art + Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Album Art */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.12)",
              position: "relative",
            }}
          >
            {currentTrack.albumCover ? (
              <img
                src={currentTrack.albumCover}
                alt={`${currentTrack.artist} - ${currentTrack.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music
                size={18}
                style={{
                  color: "rgba(0,212,170,0.4)",
                }}
              />
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate leading-tight"
              style={{ color: "var(--text-primary, #ffffff)" }}
            >
              {currentTrack.artist}
            </p>
            <p
              className="text-xs truncate leading-tight"
              style={{ color: "var(--text-secondary, #a0aec0)" }}
            >
              {currentTrack.title}
            </p>
          </div>

          {/* Status & Metadata */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2
                    size={16}
                    style={{
                      color: "var(--accent-primary, #00d4aa)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </motion.div>
              )}
              {isError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <AlertCircle size={16} style={{ color: "#ff4444" }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Genre & BPM */}
            <div
              className="text-xs px-2 py-1 rounded-md hidden sm:block"
              style={{
                backgroundColor: "rgba(0,212,170,0.08)",
                color: "var(--text-secondary, #a0aec0)",
              }}
            >
              {currentTrack.genre ? currentTrack.genre : "Track"}
              {currentTrack.bpm && ` • ${currentTrack.bpm} BPM`}
            </div>

            {/* Key Badge */}
            {currentTrack.key && (
              <div
                className="text-xs font-bold px-2 py-1 rounded-md flex-shrink-0"
                style={{
                  backgroundColor: `${getCamelotColor(currentTrack.key)}22`,
                  border: `1px solid ${getCamelotColor(currentTrack.key)}44`,
                  color: getCamelotColor(currentTrack.key),
                }}
                title={`Key: ${currentTrack.key}`}
              >
                {currentTrack.key}
              </div>
            )}
          </div>
        </div>

        {/* Center: Transport Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Shuffle */}
          <button
            onClick={() => setShuffle(!shuffle)}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{
              color: shuffle ? "var(--accent-primary, #00d4aa)" : "var(--text-secondary, #a0aec0)",
            }}
            title="Shuffle"
          >
            <Shuffle size={16} fill={shuffle ? "currentColor" : "none"} />
          </button>

          {/* Previous */}
          <button
            onClick={prev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary, #a0aec0)" }}
            title="Previous"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          {/* Play/Pause - Large Circle */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--accent-primary, #00d4aa)",
              color: "#0c0d14",
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            disabled={!hasNext}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary, #a0aec0)" }}
            title="Next"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{
              color:
                repeatMode !== "off"
                  ? "var(--accent-primary, #00d4aa)"
                  : "var(--text-secondary, #a0aec0)",
            }}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat size={16} fill={repeatMode !== "off" ? "currentColor" : "none"} />
            {repeatMode === "one" && (
              <span
                className="absolute text-xs font-bold ml-2"
                style={{
                  color: "var(--accent-primary, #00d4aa)",
                }}
              >
                1
              </span>
            )}
          </button>
        </div>

        {/* Right: Volume + Time */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          {/* Time Display */}
          <div
            className="text-xs font-mono hidden md:flex items-center gap-1"
            style={{ color: "var(--text-secondary, #a0aec0)" }}
          >
            <span>{formatTime(position)}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteToggle}
              className="p-1 rounded-lg transition-all hover:bg-white/5"
              style={{ color: "var(--text-secondary, #a0aec0)" }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value) / 100)}
              className="w-20"
              style={{
                accentColor: "var(--accent-primary, #00d4aa)",
                cursor: "pointer",
              }}
              title="Volume"
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element for Deezer preview fallback */}
      <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

      {/* SoundCloud iframe for SC playback */}
      {scResult?.embed_url && playbackSource === "soundcloud" && (
        <iframe
          key={scResult.embed_url}
          src={scResult.embed_url}
          allow="autoplay"
          style={{
            position: "absolute",
            bottom: -9999,
            left: -9999,
            width: 0,
            height: 0,
            border: "none",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
          title="SoundCloud Player"
        />
      )}
    </motion.div>
  );
}
