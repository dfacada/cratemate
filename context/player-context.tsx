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

export interface DeezerResult {
  id: number;
  title: string;
  artist: string;
  cover: string | null;
  link: string;
  score: number;
  candidates: Array<{ id: number; title: string; artist: string; score: number }>;
}

type Status = "idle" | "loading" | "ready" | "error";

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  deezerResult: DeezerResult | null;
  status: Status;
  errorMsg: string | null;
  play: (track: PlayerTrack) => void;
  stop: () => void;
  swapCandidate: (id: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const cache = new Map<string, DeezerResult>();

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack,  setCurrentTrack]  = useState<PlayerTrack | null>(null);
  const [deezerResult,  setDeezerResult]  = useState<DeezerResult | null>(null);
  const [status,        setStatus]        = useState<Status>("idle");
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());

  const play = useCallback(async (track: PlayerTrack) => {
    if (currentTrack?.id === track.id && status === "ready") return;

    setCurrentTrack(track);
    setDeezerResult(null);
    setErrorMsg(null);

    if (cache.has(track.id)) {
      setDeezerResult(cache.get(track.id)!);
      setStatus("ready");
      return;
    }

    if (fetchingRef.current.has(track.id)) return;
    fetchingRef.current.add(track.id);
    setStatus("loading");

    try {
      const params = new URLSearchParams({ artist: track.artist, title: track.title });
      const res  = await fetch(`/api/deezer?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || `Error ${res.status}`);
        return;
      }

      cache.set(track.id, data);
      setDeezerResult(data);
      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Failed to find track");
    } finally {
      fetchingRef.current.delete(track.id);
    }
  }, [currentTrack, status]);

  const swapCandidate = useCallback((id: number) => {
    if (!deezerResult || !currentTrack) return;
    const candidate = deezerResult.candidates.find(c => c.id === id);
    if (!candidate) return;
    const updated: DeezerResult = {
      ...deezerResult,
      id:     candidate.id,
      title:  candidate.title,
      artist: candidate.artist,
    };
    cache.set(currentTrack.id, updated);
    setDeezerResult(updated);
  }, [deezerResult, currentTrack]);

  const stop = useCallback(() => {
    setCurrentTrack(null);
    setDeezerResult(null);
    setStatus("idle");
    setErrorMsg(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, deezerResult, status, errorMsg, play, stop, swapCandidate }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
