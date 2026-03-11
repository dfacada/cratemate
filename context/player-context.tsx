"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface PlayerTrack {
  id: string; artist: string; title: string;
  label?: string; bpm?: number; key?: string; energy?: number; duration?: string;
}

interface PlayerCtx {
  currentTrack: PlayerTrack | null; isPlaying: boolean;
  play: (t: PlayerTrack) => void; pause: () => void; resume: () => void; stop: () => void;
}

const PlayerContext = createContext<PlayerCtx>({ currentTrack:null, isPlaying:false, play:()=>{}, pause:()=>{}, resume:()=>{}, stop:()=>{} });

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const play = useCallback((t: PlayerTrack) => { setCurrentTrack(t); setIsPlaying(true); }, []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => setIsPlaying(true), []);
  const stop = useCallback(() => { setCurrentTrack(null); setIsPlaying(false); }, []);
  return <PlayerContext.Provider value={{ currentTrack, isPlaying, play, pause, resume, stop }}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);
