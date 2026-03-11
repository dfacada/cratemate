"use client";
import { createContext, useContext, useRef, useState, useCallback } from "react";

export interface PlayerTrack {
  id: string;
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  energy?: number;
}

export interface SCResult {
  permalink_url: string;
  artwork_url: string | null;
  duration_ms: number;
  scTitle: string;
  scArtist: string;
  candidates?: Array<{ title: string; artist: string; url: string; score: number }>;
}

type PlayerStatus = "idle" | "loading" | "ready" | "error" | "no_client_id";

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  scResult: SCResult | null;
  status: PlayerStatus;
  errorMsg: string | null;
  play: (track: PlayerTrack) => void;
  stop: () => void;
  swapCandidate: (url: string) => void; // pick a different candidate if wrong match
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// Cache trackId → SCResult
const scCache = new Map<string, SCResult>();

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [scResult,     setScResult]     = useState<SCResult | null>(null);
  const [status,       setStatus]       = useState<PlayerStatus>("idle");
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());

  const play = useCallback(async (track: PlayerTrack) => {
    // Same track already loaded → no-op (widget is self-contained)
    if (currentTrack?.id === track.id && status === "ready") return;

    setCurrentTrack(track);
    setScResult(null);
    setErrorMsg(null);

    // Already cached
    if (scCache.has(track.id)) {
      setScResult(scCache.get(track.id)!);
      setStatus("ready");
      return;
    }

    // Deduplicate concurrent fetches
    if (fetchingRef.current.has(track.id)) return;
    fetchingRef.current.add(track.id);
    setStatus("loading");

    try {
      const params = new URLSearchParams({ artist: track.artist, title: track.title });
      const res = await fetch(`/api/soundcloud?${params}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.setup) {
          setStatus("no_client_id");
          setErrorMsg("SoundCloud client ID not configured yet.");
        } else {
          setStatus("error");
          setErrorMsg(data.error || `Error ${res.status}`);
        }
        return;
      }

      const result: SCResult = {
        permalink_url: data.permalink_url,
        artwork_url:   data.artwork_url,
        duration_ms:   data.duration_ms,
        scTitle:       data.title,
        scArtist:      data.artist,
        candidates:    data.candidates,
      };
      scCache.set(track.id, result);
      setScResult(result);
      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Failed to find track");
    } finally {
      fetchingRef.current.delete(track.id);
    }
  }, [currentTrack, status]);

  const swapCandidate = useCallback((url: string) => {
    if (!scResult) return;
    const updated = { ...scResult, permalink_url: url };
    if (currentTrack) scCache.set(currentTrack.id, updated);
    setScResult(updated);
  }, [scResult, currentTrack]);

  const stop = useCallback(() => {
    setCurrentTrack(null);
    setScResult(null);
    setStatus("idle");
    setErrorMsg(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, scResult, status, errorMsg, play, stop, swapCandidate }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
