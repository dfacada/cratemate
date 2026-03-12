"use client";
import { createContext, useContext, useRef, useState, useCallback } from "react";
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
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const cache = new Map<string, SCSearchResult>();

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [scResult,     setScResult]     = useState<SCSearchResult | null>(null);
  const [status,       setStatus]       = useState<Status>("idle");
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());
  // Use refs to avoid stale closures in the play callback
  const currentTrackRef = useRef<PlayerTrack | null>(null);
  const statusRef = useRef<Status>("idle");

  const play = useCallback(async (track: PlayerTrack, retry = false) => {
    // Use refs for current state to avoid stale closure issues
    if (currentTrackRef.current?.id === track.id && statusRef.current === "ready" && !retry) return;

    // If retrying, clear the cached failure so we actually re-fetch
    if (retry) {
      cache.delete(track.id);
    }

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
      // Cached as not-found — show error immediately
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
  }, []); // No deps — uses refs for current state

  const stop = useCallback(() => {
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setScResult(null);
    setStatus("idle");
    statusRef.current = "idle";
    setErrorMsg(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, scResult, status, errorMsg, play, stop }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
