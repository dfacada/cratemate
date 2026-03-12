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
  // Cache progress
  cachedCount:  number;   // How many queue tracks are cached
  cacheTotal:   number;   // Total queue length
  isCaching:    boolean;  // Whether background caching is in progress
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ── Persistent SC search cache (localStorage-backed) ──────────────────
// Tracks that have been searched before are stored permanently so we
// never re-fetch (and burn API tokens) for the same artist+title.
const CACHE_KEY = "cratemate_sc_cache";
const CACHE_MAX_ENTRIES = 500; // cap to prevent localStorage bloat

function loadCache(): Map<string, SCSearchResult> {
  const map = new Map<string, SCSearchResult>();
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    if (raw) {
      const entries: [string, SCSearchResult][] = JSON.parse(raw);
      // Only load validated entries (skip failed lookups so they can be retried)
      for (const [key, val] of entries) {
        if (val.validated && val.embed_url) {
          map.set(key, val);
        }
      }
    }
  } catch { /* ignore corrupt cache */ }
  return map;
}

function saveCache(map: Map<string, SCSearchResult>) {
  try {
    // Only persist validated entries (successes)
    const entries = [...map.entries()]
      .filter(([, v]) => v.validated && v.embed_url)
      .slice(-CACHE_MAX_ENTRIES); // keep most recent if over limit
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch { /* localStorage full or unavailable — ignore */ }
}

const cache = loadCache();

// ── Rate-limited fetch with retry on 429 ──────────────────────────────
// Serializes all SC search requests so only one runs at a time,
// and retries with backoff when rate-limited.

let fetchQueue: Array<{
  track: PlayerTrack;
  resolve: (result: SCSearchResult | null) => void;
}> = [];
let fetchRunning = false;

// Callback to notify React when cache state changes
let onCacheUpdate: (() => void) | null = null;

async function fetchSCWithRetry(artist: string, title: string, maxRetries = 3): Promise<{ res: Response; data: SCSearchResult } | null> {
  const params = new URLSearchParams({ artist, title });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`/api/soundcloud-search?${params}`);

      if (res.status === 429) {
        const waitMs = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.warn(`SC search rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      const data: SCSearchResult = await res.json();
      return { res, data };
    } catch (err) {
      if (attempt === maxRetries) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function processQueue() {
  if (fetchRunning) return;
  fetchRunning = true;

  while (fetchQueue.length > 0) {
    const item = fetchQueue.shift()!;
    const { track, resolve } = item;

    // Skip if already cached
    if (cache.has(track.id)) {
      resolve(cache.get(track.id)!);
      continue;
    }

    const result = await fetchSCWithRetry(track.artist, track.title);

    if (result && result.res.ok && !(result.data as any).error) {
      cache.set(track.id, result.data);
      // Persist validated results to localStorage
      if (result.data.validated && result.data.embed_url) {
        saveCache(cache);
      }
      resolve(result.data);
    } else {
      // Cache failures in memory only (not localStorage) so they can be retried next session
      if (result?.data) cache.set(track.id, result.data);
      resolve(result?.data || null);
    }

    // Notify React that cache count changed
    onCacheUpdate?.();

    // Rate limit delay between API calls
    if (fetchQueue.length > 0) {
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  fetchRunning = false;
  // Final update when queue is drained
  onCacheUpdate?.();
}

function enqueueSearch(track: PlayerTrack): Promise<SCSearchResult | null> {
  return new Promise(resolve => {
    fetchQueue.push({ track, resolve });
    processQueue();
  });
}

// Pre-fetch: adds to the serialized queue (won't fire concurrently)
function prefetchTrack(track: PlayerTrack) {
  if (cache.has(track.id)) return;
  enqueueSearch(track);
}

// Pre-fetch all remaining tracks in queue sequentially
function prefetchAll(tracks: PlayerTrack[], fromIndex: number) {
  for (let i = fromIndex; i < tracks.length; i++) {
    if (!cache.has(tracks[i].id)) {
      prefetchTrack(tracks[i]);
    }
  }
}

function countCached(tracks: PlayerTrack[]): number {
  return tracks.filter(t => cache.has(t.id)).length;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [scResult,     setScResult]     = useState<SCSearchResult | null>(null);
  const [status,       setStatus]       = useState<Status>("idle");
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const [queue,        setQueue]        = useState<PlayerTrack[]>([]);
  const [queueIndex,   setQueueIndex]   = useState(-1);
  const [cachedCount,  setCachedCount]  = useState(0);

  const currentTrackRef = useRef<PlayerTrack | null>(null);
  const statusRef = useRef<Status>("idle");
  const queueRef = useRef<PlayerTrack[]>([]);
  const queueIndexRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  // Register the cache update callback so the fetch queue can trigger React re-renders
  useEffect(() => {
    onCacheUpdate = () => {
      const q = queueRef.current;
      if (q.length > 0) {
        setCachedCount(countCached(q));
      }
    };
    return () => { onCacheUpdate = null; };
  }, []);

  // Recalculate cached count when queue changes
  useEffect(() => {
    setCachedCount(countCached(queue));
  }, [queue]);

  const play = useCallback(async (track: PlayerTrack, retry = false) => {
    if (currentTrackRef.current?.id === track.id && statusRef.current === "ready" && !retry) return;

    if (retry) cache.delete(track.id);

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setScResult(null);
    setErrorMsg(null);

    // Check cache first (instant if pre-fetched)
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

    setStatus("loading");
    statusRef.current = "loading";

    const data = await enqueueSearch(track);

    // Make sure this is still the current track (user might have skipped)
    if (currentTrackRef.current?.id !== track.id) return;

    if (!data) {
      setStatus("error");
      statusRef.current = "error";
      setErrorMsg("Failed to find track. Please try again.");
      return;
    }

    if (data.validated && data.embed_url) {
      setScResult(data);
      setStatus("ready");
      statusRef.current = "ready";
    } else {
      setStatus("error");
      statusRef.current = "error";
      setErrorMsg(data.reason || (data as any).error || "No verified SoundCloud link found.");
    }
  }, []);

  // When playAll starts or current track resolves, kick off background caching of ALL remaining tracks
  useEffect(() => {
    if (queue.length <= 1) return;
    // Start prefetching from the track after current
    const startFrom = queueIndex + 1;
    if (startFrom < queue.length) {
      prefetchAll(queue, startFrom);
    }
  }, [queueIndex, queue, status]);

  const stop = useCallback(() => {
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setScResult(null);
    setStatus("idle");
    statusRef.current = "idle";
    setErrorMsg(null);
    setQueue([]);
    setQueueIndex(-1);
    setCachedCount(0);
    fetchQueue = [];
  }, []);

  const playAll = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    if (!tracks.length) return;
    fetchQueue = [];
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCachedCount(countCached(tracks));
    play(tracks[startIndex]);
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
  const cacheTotal = queue.length;
  const isCaching = queue.length > 1 && cachedCount < queue.length;

  return (
    <PlayerContext.Provider value={{
      currentTrack, scResult, status, errorMsg, play, stop,
      queue, queueIndex, playAll, next, prev, hasNext, hasPrev,
      cachedCount, cacheTotal, isCaching,
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
