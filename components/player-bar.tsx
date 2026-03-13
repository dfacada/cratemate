"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, Music, ChevronUp, ChevronDown } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { getCamelotColor } from "@/lib/theme";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    scResult,
    status,
    errorMsg,
    playbackSource,
    isPlaying,
    position,
    duration,
    volume,
    pause,
    resume,
    togglePlay,
    next,
    prev,
    hasNext,
    hasPrev,
    seek,
    setVolume: setVolumeControl,
    audioRef,
  } = usePlayer();

  const [expanded, setExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(volume);

  if (!currentTrack || status === "idle") return null;

  const isLoading = status === "loading";
  const isError = status === "error";
  const isReady = status === "ready";
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const currentTimeMs = position;
  const durationMs = duration;

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
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newPosition = percent * duration;
    seek(newPosition);
  };

  return (
    <motion.div
      layout
      className="fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300"
      style={{
        backgroundColor: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border-subtle, #1e1e30)",
        height: expanded ? 160 : 80,
      }}
    >
      {/* Compact Mode (80px) */}
      <div className="h-20 px-4 flex items-center gap-3 overflow-hidden">
        {/* Album Art */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-transparent to-black/20 backdrop-blur-sm border border-white/10">
          {currentTrack.albumCover ? (
            <img
              src={currentTrack.albumCover}
              alt={`${currentTrack.artist} - ${currentTrack.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
              <Music size={20} />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {currentTrack.artist}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {currentTrack.title}
          </p>
        </div>

        {/* Status Indicator */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)" }}
            >
              <Loader2 size={14} style={{ color: "var(--accent-primary)", animation: "spin 1s linear infinite" }} />
            </motion.div>
          )}
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.3)" }}
            >
              <AlertCircle size={14} style={{ color: "var(--accent-danger)" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Badge */}
        {currentTrack.key && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 text-xs font-bold"
            style={{
              backgroundColor: `${getCamelotColor(currentTrack.key)}22`,
              border: `1px solid ${getCamelotColor(currentTrack.key)}44`,
              color: getCamelotColor(currentTrack.key),
            }}
            title={`Key: ${currentTrack.key}`}
          >
            {currentTrack.key.replace(/([0-9]+)/, "$1")}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={prev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary)" }}
            title="Previous"
          >
            <SkipBack size={16} fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: "rgba(0,212,170,0.2)",
              border: "1px solid rgba(0,212,170,0.4)",
              color: "var(--accent-primary)",
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
          </button>

          <button
            onClick={next}
            disabled={!hasNext}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary)" }}
            title="Next"
          >
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16"
            style={{
              accentColor: "var(--accent-primary)",
              cursor: "pointer",
            }}
            title="Volume"
          />
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
          title={expanded ? "Compact" : "Expand"}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Expanded Mode (160px total) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                {formatTime(currentTimeMs / 1000)}
              </span>
              <div
                onClick={handleProgressClick}
                className="flex-1 h-1.5 rounded-full cursor-pointer overflow-hidden"
                style={{
                  backgroundColor: "rgba(0,212,170,0.1)",
                  border: "1px solid rgba(0,212,170,0.2)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: "var(--accent-primary)",
                  }}
                />
              </div>
              <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                {formatTime(durationMs / 1000)}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <div className="flex items-center gap-2">
                {currentTrack.bpm && (
                  <span className="font-mono">{currentTrack.bpm} BPM</span>
                )}
                {currentTrack.label && (
                  <>
                    <span>•</span>
                    <span className="truncate">{currentTrack.label}</span>
                  </>
                )}
              </div>
              {currentTrack.energy !== undefined && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-8 h-1.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(0,212,170,0.2)`,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(currentTrack.energy / 100) * 100}%`,
                        height: "100%",
                        backgroundColor: "var(--accent-primary)",
                      }}
                    />
                  </div>
                  <span>{Math.round(currentTrack.energy)}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for Deezer preview fallback */}
      <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

      {/* SoundCloud iframe for SC playback */}
      {scResult?.embed_url && playbackSource === "soundcloud" && (
        <iframe
          key={scResult.embed_url}
          src={scResult.embed_url}
          width="100%"
          height="0"
          allow="autoplay"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
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
