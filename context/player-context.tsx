"use client";
import { createContext, useContext, useState, useCallback } from "react";

export interface PlayerTrack {
  id: string;
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  energy?: number;
}

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  play: (track: PlayerTrack) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);

  const play = useCallback((track: PlayerTrack) => {
    setCurrentTrack(track);
  }, []);

  const stop = useCallback(() => {
    setCurrentTrack(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentTrack, play, stop }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
