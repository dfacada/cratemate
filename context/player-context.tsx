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
  progress: number;
  deezerData: DeezerResult | null;
  play: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// Tiny silent MP3 (0.1s) as a data URI — used to unlock iOS audio context
// on the synchronous part of the click before the async fetch completes
const SILENT_MP3 = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgQ3JlYXRpdmUgQ29tbW9ucyBBdHRyaWJ1dGlvbgBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack]   = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [progress, setProgress]           = useState(0);
  const [deezerData, setDeezerData]       = useState<DeezerResult | null>(null);

  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlocked      = useRef(false);

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };
  const startTick = (audio: HTMLAudioElement) => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    }, 200);
  };

  // Unlock iOS audio context on first user interaction with the page
  useEffect(() => {
    const unlock = () => {
      if (unlocked.current) return;
      const a = new Audio(SILENT_MP3);
      a.volume = 0;
      a.play().then(() => { a.pause(); unlocked.current = true; }).catch(() => {});
    };
    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("click",      unlock, { once: true });
    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click",      unlock);
    };
  }, []);

  const play = useCallback((track: PlayerTrack) => {
    // ── Synchronous section (inside user gesture) ──────────────────────────
    // If same track is paused, just resume
    if (audioRef.current && currentTrack?.id === track.id && !isLoading) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        startTick(audioRef.current!);
      }).catch(console.warn);
      return;
    }

    // Tear down previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    clearTick();
    setProgress(0);
    setIsPlaying(false);
    setIsLoading(true);
    setCurrentTrack(track);
    setDeezerData(null);

    // Create audio element NOW (inside gesture) and call play() with silent src
    // This is the iOS unlock step — the gesture association is set here
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = 0.85;

    // iOS requires play() to be called synchronously in a user gesture
    // We start with the silent MP3 so the gesture is consumed here
    audio.src = SILENT_MP3;
    audio.play().catch(() => {/* expected to fail gracefully */});

    // ── Async section (safe now because gesture is already consumed) ────────
    const q = encodeURIComponent(`${track.artist} ${track.title}`);
    fetch(`/api/deezer?q=${q}`)
      .then(r => {
        if (!r.ok) throw new Error("No preview");
        return r.json();
      })
      .then((data: DeezerResult) => {
        setDeezerData(data);
        const proxyUrl = `/api/audio?url=${encodeURIComponent(data.preview)}`;

        // Swap src to real preview
        audio.pause();
        audio.src = proxyUrl;
        audio.volume = 0.85;
        audio.preload = "auto";
        audio.load();

        const onCanPlay = () => {
          audio.play()
            .then(() => {
              setIsLoading(false);
              setIsPlaying(true);
              startTick(audio);
            })
            .catch(err => {
              console.warn("play() blocked:", err);
              setIsLoading(false);
            });
        };

        const onError = () => {
          console.warn("Audio load error");
          setIsLoading(false);
          setIsPlaying(false);
        };

        const onEnded = () => {
          setIsPlaying(false);
          setProgress(1);
          clearTick();
        };

        audio.addEventListener("canplay", onCanPlay, { once: true });
        audio.addEventListener("error",   onError,   { once: true });
        audio.addEventListener("ended",   onEnded);
      })
      .catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
  }, [currentTrack, isLoading]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    clearTick();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().then(() => {
      setIsPlaying(true);
      startTick(audioRef.current!);
    }).catch(console.warn);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    clearTick();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDeezerData(null);
    setIsLoading(false);
  }, []);

  useEffect(() => () => { clearTick(); audioRef.current?.pause(); }, []);

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
