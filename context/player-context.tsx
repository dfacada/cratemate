"use client";
import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

export interface PlayerTrack {
  id: string;
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  energy?: number;
}

interface DeezerResult {
  preview: string;
  cover?: string;
  link?: string;
}

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;           // 0–1
  deezerData: DeezerResult | null;
  play: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deezerData, setDeezerData] = useState<DeezerResult | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = null;
  };

  const startProgress = () => {
    clearProgress();
    progressInterval.current = setInterval(() => {
      const a = audioRef.current;
      if (a && a.duration) setProgress(a.currentTime / a.duration);
    }, 250);
  };

  const play = useCallback(async (track: PlayerTrack) => {
    // If same track, just resume
    if (audioRef.current && currentTrack?.id === track.id) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgress();
      return;
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    clearProgress();
    setProgress(0);
    setIsLoading(true);
    setCurrentTrack(track);
    setIsPlaying(false);
    setDeezerData(null);

    try {
      const q = `${track.artist} ${track.title}`;
      const res = await fetch(`/api/deezer?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("No preview found");
      const data: DeezerResult & { preview: string } = await res.json();

      setDeezerData(data);

      // Use our audio proxy to avoid CORS on the MP3 stream
      const proxyUrl = `/api/audio?url=${encodeURIComponent(data.preview)}`;

      const audio = new Audio();
      audioRef.current = audio;
      audio.src = proxyUrl;
      audio.preload = "auto";
      audio.volume = 0.85;

      audio.addEventListener("canplay", () => {
        setIsLoading(false);
        audio.play().then(() => {
          setIsPlaying(true);
          startProgress();
        }).catch(() => setIsLoading(false));
      }, { once: true });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(1);
        clearProgress();
      });

      audio.addEventListener("error", () => {
        setIsLoading(false);
        setIsPlaying(false);
      });

      audio.load();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    clearProgress();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().then(() => {
      setIsPlaying(true);
      startProgress();
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    clearProgress();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDeezerData(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    clearProgress();
    audioRef.current?.pause();
  }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, deezerData, play, pause, resume, stop }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
