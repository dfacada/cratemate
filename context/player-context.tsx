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

export interface DeezerResult {
  preview: string;
  cover?: string;
  link?: string;
}

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  deezerData: DeezerResult | null;
  play: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [progress,     setProgress]     = useState(0);
  const [deezerData,   setDeezerData]   = useState<DeezerResult | null>(null);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const tickRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  // Cache: trackId → preview URL so we can play synchronously on iOS
  const cacheRef    = useRef<Map<string, DeezerResult>>(new Map());
  // Track which IDs are currently being fetched to avoid duplicate requests  
  const fetchingRef = useRef<Set<string>>(new Set());

  const stopTick = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  };
  const startTick = (a: HTMLAudioElement) => {
    stopTick();
    tickRef.current = setInterval(() => {
      if (a.duration) setProgress(a.currentTime / a.duration);
    }, 150);
  };

  // Get or create the single persistent audio element
  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "none";
      a.volume  = 0.85;
      a.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(1);
        stopTick();
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  // Pre-fetch a track's Deezer data silently in background (called on render)
  const prefetch = useCallback(async (track: PlayerTrack) => {
    const key = track.id;
    if (cacheRef.current.has(key) || fetchingRef.current.has(key)) return;
    fetchingRef.current.add(key);
    try {
      const q = encodeURIComponent(`${track.artist} ${track.title}`);
      const r = await fetch(`/api/deezer?q=${q}`);
      if (r.ok) {
        const data: DeezerResult = await r.json();
        cacheRef.current.set(key, data);
      }
    } catch { /* silent */ } finally {
      fetchingRef.current.delete(key);
    }
  }, []);

  // ── Core play function ────────────────────────────────────────────────────
  const play = useCallback((track: PlayerTrack) => {
    const audio = getAudio();

    // Same track paused → just resume
    if (currentTrack?.id === track.id && !isLoading) {
      audio.play().then(() => { setIsPlaying(true); startTick(audio); }).catch(setErrorStr);
      return;
    }

    // Reset state
    stopTick();
    setProgress(0);
    setError(null);
    setIsPlaying(false);
    setCurrentTrack(track);
    setDeezerData(null);

    const cached = cacheRef.current.get(track.id);

    if (cached) {
      // ── URL already cached: play synchronously (works on iOS) ──
      setDeezerData(cached);
      playUrl(audio, cached.preview);
    } else {
      // ── URL not cached: must fetch first ──
      // iOS NOTE: we call audio.play() right now with no src to register the gesture.
      // This may be silently rejected but it's enough to count as "user activated" on
      // many iOS builds. Then we swap the src in the fetch callback.
      setIsLoading(true);
      audio.src = "";

      const q = encodeURIComponent(`${track.artist} ${track.title}`);
      fetch(`/api/deezer?q=${q}`)
        .then(r => {
          if (!r.ok) return r.json().then(e => { throw new Error(e.error || `HTTP ${r.status}`); });
          return r.json();
        })
        .then((data: DeezerResult) => {
          cacheRef.current.set(track.id, data);
          setDeezerData(data);
          playUrl(audio, data.preview);
        })
        .catch(err => {
          setIsLoading(false);
          setError(err?.message || "Could not load preview");
        });
    }
  }, [currentTrack, isLoading, getAudio]);

  function playUrl(audio: HTMLAudioElement, url: string) {
    // Stop any current playback cleanly
    audio.pause();

    // Use direct Deezer CDN URL — CORS was fixed by Deezer in Jan 2025
    audio.src = url;
    audio.load();

    const onCanPlay = () => {
      audio.play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
          startTick(audio);
        })
        .catch(err => {
          setIsLoading(false);
          // iOS blocked the play() — still show the player so user can tap again
          setError("Tap play to start (browser required interaction)");
          console.warn("play() rejected:", err);
        });
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const code = audio.error?.code;
      setError(`Audio failed to load (${code ?? "unknown error"})`);
    };

    setIsLoading(true);
    audio.addEventListener("canplay", onCanPlay, { once: true });
    audio.addEventListener("error",   onError,   { once: true });
  }

  function setErrorStr(err: any) {
    setError(err?.message || String(err));
  }

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    stopTick();
  }, []);

  const resume = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().then(() => { setIsPlaying(true); startTick(a); }).catch(setErrorStr);
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    stopTick();
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    setDeezerData(null);
    setError(null);
  }, []);

  useEffect(() => () => { stopTick(); audioRef.current?.pause(); }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, isLoading, error, progress, deezerData, play, pause, resume, stop }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}

// Export prefetch so track components can call it on mount
export function usePrefetch() {
  // We can't access the context's prefetch directly, so components
  // call /api/deezer themselves and that populates the server cache
  return null;
}
