"use client";
import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import type { SCSearchResult } from "@/app/api/soundcloud-search/route";

export interface PlayerTrack {
  id:      string;
  artist:  string;
  title:   string;
  label?:  string;
  bpm?:    number;
  key?:    string;
  energy?: number;
}

type Status = "idle" | "loading" | "ready" | "error";

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  scResult:     SCSearchResult | null;
  status:       Status;
  errorMsg:     string | null;
  play:         (track: PlayerTrack, retry?: boolean) => void;
  stop:         () => void;
  // Queue controls
  queue:        PlayerTrack[];
  queueIndex:   number;
  playAll:      (tracks: PlayerTrack[], startIndex?: number) => void;
  next:         () => void;
  prev:         () => void;
  hasNext:      boolean;
  hasPrev:      boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const cache = new Map<string, SCSearchResult>();

// Pre-fetch a track's SC URL and store in cache (fire-and-forget)
async function prefetchTrack(track: PlayerTrack) {
  if (cache.has(track.id)) return;
  try {
    const params = new URLSearchParams({ artist: track.artist, title: track.title });
    const res = await fetch(`/api/soundcloud-search?${params}`);
    if (res.ok) {
      const data: SCSearchResult = await res.json();
      cache.set(track.id, data);
    }
  } catch {
    // Silently fail — will retry on actual play
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [scResult,     setScResult]     = useState<SCSearchResult | null>(null);
  const [status,       setStatus]       = useState<Status>("idle");
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const [queue,        setQueue]        = useState<PlayerTrack[]>([]);
  const [queueIndex,   setQueueIndex]   = useState(-1);

  const fetchingRef = useRef<Set<string>>(new Set());
  const currentTrackRef = useRef<PlayerTrack | null>(null);
  const statusRef = useRef<Status>("idle");
  const queueRef = useRef<PlayerTrack[]>([]);
  const queueIndexRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  const play = useCallback(async (track: PlayerTrack, retry = false) => {
    if (currentTrackRef.current?.id === track.id && statusRef.current === "ready" && !retry) return;

    if (retry) cache.delete(track.id);

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setScResult(null);
    setErrorMsg(null);

    if (cache.has(track.id)) {
      const cached = cache.get(track.id)!;
      if (cached.validated && cached.embed_url) {
        setScResult(cached);
        setStatus("ready");
        statusRef.current = "ready";
        return;
      }
      setStatus("error");
      statusRef.current = "error";
      setErrorMsg(cached.reason || "No SoundCloud link found.");
      return;
    }

    if (fetchingRef.current.has(track.id)) return;
    fetchingRef.current.add(track.id);
    setStatus("loading");
    statusRef.current = "loading";

    try {
      const params = new URLSearchParams({ artist: track.artist, title: track.title });
      const res    = await fetch(`/api/soundcloud-search?${params}`);
      const data: SCSearchResult = await res.json();

      if (!res.ok || (data as any).error) {
        setStatus("error");
        statusRef.current = "error";
        setErrorMsg((data as any).error || `Error ${res.status}`);
        return;
      }

      cache.set(track.id, data);

      if (data.validated && data.embed_url) {
        setScResult(data);
        setStatus("ready");
        statusRef.current = "ready";
      } else {
        setStatus("error");
        statusRef.current = "error";
        setErrorMsg(data.reason || "No verified SoundCloud link found.");
      }
    } catch (err: any) {
      setStatus("error");
      statusRef.current = "error";
      setErrorMsg(err?.message || "Failed to find track");
    } finally {
      fetchingRef.current.delete(track.id);
    }
  }, []);

  // Pre-cache next track whenever current track or queue index changes
  useEffect(() => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      prefetchTrack(queue[nextIdx]);
    }
    // Also pre-cache the one after that for even smoother transitions
    const nextNextIdx = queueIndex + 2;
    if (nextNextIdx < queue.length) {
      prefetchTrack(queue[nextNextIdx]);
    }
  }, [queueIndex, queue]);

  const stop = useCallback(() => {
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setScResult(null);
    setStatus("idle");
    statusRef.current = "idle";
    setErrorMsg(null);
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playAll = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    if (!tracks.length) return;
    setQueue(tracks);
    setQueueIndex(startIndex);
    play(tracks[startIndex]);
    // Prefetch first few tracks immediately
    tracks.slice(startIndex + 1, startIndex + 3).forEach(prefetchTrack);
  }, [play]);

  const next = useCallback(() => {
    const idx = queueIndexRef.current + 1;
    const q = queueRef.current;
    if (idx < q.length) {
      setQueueIndex(idx);
      play(q[idx]);
    }
  }, [play]);

  const prev = useCallback(() => {
    const idx = queueIndexRef.current - 1;
    const q = queueRef.current;
    if (idx >= 0) {
      setQueueIndex(idx);
      play(q[idx]);
    }
  }, [play]);

  const hasNext = queueIndex >= 0 && queueIndex < queue.length - 1;
  const hasPrev = queueIndex > 0;

  return (
    <PlayerContext.Provider value={{
      currentTrack, scResult, status, errorMsg, play, stop,
      queue, queueIndex, playAll, next, prev, hasNext, hasPrev,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
