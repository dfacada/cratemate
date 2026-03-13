"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  getValidSpotifyUserToken,
  getSpotifyAuthUrl,
  spotifyPlay,
  spotifyPause,
  spotifyNext,
  spotifyPrevious,
  spotifySeek,
  spotifySetVolume,
  spotifyGetCurrentState,
  searchSpotifyTrack,
  isSpotifyAuthenticated,
} from "@/lib/spotify";
import type { SCSearchResult } from "@/app/api/soundcloud-search/route";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface PlayerTrack {
  id: string;
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  energy?: number;
  genre?: string;
  albumCover?: string;
  gemScore?: number;
  matchReason?: string;
  // Spotify (full track, Premium required)
  spotifyUri?: string; // spotify:track:xxxxx
  spotifyId?: string;
  // Deezer (preview, instant playback)
  deezerPreviewUrl?: string;
  deezerTrackId?: string;
  // SoundCloud (full track, background enrichment)
  soundcloudUrl?: string;
  soundcloudEmbedUrl?: string;
}

type PlaybackSource = "spotify" | "deezer" | "soundcloud" | "none";
type Status = "idle" | "loading" | "ready" | "error";

interface PlayerContextValue {
  // Auth
  isAuthenticated: boolean;
  connectSpotify: () => Promise<void>;
  disconnectSpotify: () => void;

  // SDK state
  isReady: boolean; // Web Playback SDK initialized and device registered
  deviceId: string | null;

  // Current track & playback state
  currentTrack: PlayerTrack | null;
  scResult: SCSearchResult | null;
  status: Status;
  errorMsg: string | null;
  playbackSource: PlaybackSource;
  isPlaying: boolean;
  position: number; // milliseconds
  duration: number; // milliseconds
  volume: number; // 0-1

  // Playback control
  play: (track: PlayerTrack, retry?: boolean) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;

  // Queue controls
  queue: PlayerTrack[];
  queueIndex: number;
  playAll: (tracks: PlayerTrack[], startIndex?: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  hasNext: boolean;
  hasPrev: boolean;

  // Cache progress (SoundCloud enrichment)
  cachedCount: number;
  cacheTotal: number;
  isCaching: boolean;

  // Audio ref for fallback Deezer playback
  audioRef: React.RefObject<HTMLAudioElement>;

  // SC availability
  scAvailable: boolean;

  // Search utility: search Spotify + play track not yet in user's library
  searchAndPlay: (track: PlayerTrack) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ────────────────────────────────────────────────────────────────
// SoundCloud Cache (persistent, for enrichment only)
// ────────────────────────────────────────────────────────────────

const CACHE_KEY = "cratemate_sc_cache";
const CACHE_MAX_ENTRIES = 500;

function loadCache(): Map<string, SCSearchResult> {
  const map = new Map<string, SCSearchResult>();
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    if (raw) {
      const entries: [string, SCSearchResult][] = JSON.parse(raw);
      for (const [key, val] of entries) {
        if (val.validated && val.embed_url) {
          map.set(key, val);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return map;
}

function saveCache(map: Map<string, SCSearchResult>) {
  try {
    const entries = [...map.entries()]
      .filter(([, v]) => v.validated && v.embed_url)
      .slice(-CACHE_MAX_ENTRIES);
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

const cache = loadCache();

let onCacheUpdate: (() => void) | null = null;

async function fetchSCWithRetry(
  artist: string,
  title: string,
  maxRetries = 3
): Promise<{ res: Response; data: SCSearchResult } | null> {
  const params = new URLSearchParams({ artist, title });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`/api/soundcloud-search?${params}`);

      if (res.status === 429) {
        const waitMs = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.warn(
          `SC search rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      const data: SCSearchResult = await res.json();
      return { res, data };
    } catch (err) {
      if (attempt === maxRetries) return null;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

let fetchQueue: Array<{
  track: PlayerTrack;
  resolve: (result: SCSearchResult | null) => void;
}> = [];
let fetchRunning = false;

async function processQueue() {
  if (fetchRunning) return;
  fetchRunning = true;

  while (fetchQueue.length > 0) {
    const item = fetchQueue.shift()!;
    const { track, resolve } = item;

    if (cache.has(track.id)) {
      resolve(cache.get(track.id)!);
      continue;
    }

    const result = await fetchSCWithRetry(track.artist, track.title);

    if (result && result.res.ok && !(result.data as any).error) {
      cache.set(track.id, result.data);
      if (result.data.validated && result.data.embed_url) {
        saveCache(cache);
      }
      resolve(result.data);
    } else {
      if (result?.data) cache.set(track.id, result.data);
      resolve(result?.data || null);
    }

    onCacheUpdate?.();

    if (fetchQueue.length > 0) {
      await new Promise((r) => setTimeout(r, 8000));
    }
  }

  fetchRunning = false;
  onCacheUpdate?.();
}

function enqueueSearch(track: PlayerTrack): Promise<SCSearchResult | null> {
  return new Promise((resolve) => {
    fetchQueue.push({ track, resolve });
    processQueue();
  });
}

function prefetchTrack(track: PlayerTrack) {
  if (cache.has(track.id)) return;
  enqueueSearch(track);
}

function prefetchCurrentAndNext(
  tracks: PlayerTrack[],
  currentIndex: number
) {
  if (currentIndex >= 0 && currentIndex < tracks.length) {
    prefetchTrack(tracks[currentIndex]);
  }
  if (currentIndex + 1 < tracks.length) {
    prefetchTrack(tracks[currentIndex + 1]);
  }
}

function countCached(tracks: PlayerTrack[]): number {
  return tracks.filter((t) => cache.has(t.id)).length;
}

// ────────────────────────────────────────────────────────────────
// Spotify Web Playback SDK Types
// ────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: any) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  addListener: (
    event: string,
    callback: (state: any) => void
  ) => () => void;
  getCurrentState: () => Promise<any>;
  getVolume: () => Promise<number>;
  getDeviceID: () => Promise<string | null>;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  pause: () => Promise<boolean>;
  resume: () => Promise<boolean>;
  togglePlay: () => Promise<boolean>;
  previousTrack: () => Promise<boolean>;
  nextTrack: () => Promise<boolean>;
  seek: (ms: number) => Promise<boolean>;
  setVolume: (volume: number) => Promise<boolean>;
}

// ────────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────────

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // ── Auth & SDK State ────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // ── Playback State ──────────────────────────────────────────────
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [scResult, setScResult] = useState<SCSearchResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // ms
  const [duration, setDuration] = useState(0); // ms
  const [volume, setVolume] = useState(0.5); // 0-1

  // ── Queue State ─────────────────────────────────────────────────
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [cachedCount, setCachedCount] = useState(0);

  // ── Refs ────────────────────────────────────────────────────────
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const currentTrackRef = useRef<PlayerTrack | null>(null);
  const statusRef = useRef<Status>("idle");
  const queueRef = useRef<PlayerTrack[]>([]);
  const queueIndexRef = useRef(-1);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statePollingRef = useRef<NodeJS.Timeout | null>(null);

  // ── Sync refs ───────────────────────────────────────────────────
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ── Cache update callback ───────────────────────────────────────
  useEffect(() => {
    onCacheUpdate = () => {
      const q = queueRef.current;
      if (q.length > 0) {
        setCachedCount(countCached(q));
      }
    };
    return () => {
      onCacheUpdate = null;
    };
  }, []);

  useEffect(() => {
    setCachedCount(countCached(queue));
  }, [queue]);

  // ── Check auth on mount ─────────────────────────────────────────
  useEffect(() => {
    setIsAuthenticated(isSpotifyAuthenticated());
  }, []);

  // ── Initialize Web Playback SDK ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let scriptLoaded = false;
    let resolveReady: ((value: void) => void) | null = null;
    const readyPromise = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });

    const triggerReady = () => {
      if (resolveReady) resolveReady();
    };

    // Callback when SDK is ready
    window.onSpotifyWebPlaybackSDKReady = async () => {
      scriptLoaded = true;
      triggerReady();
    };

    // Check if SDK already loaded
    if (window.Spotify) {
      scriptLoaded = true;
      triggerReady();
    } else {
      // Load SDK script
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Wait for SDK, then initialize
    const initSDK = async () => {
      await readyPromise;

      if (!window.Spotify) {
        console.error("Spotify SDK not available");
        return;
      }

      const token = await getValidSpotifyUserToken();
      if (!token) {
        console.error("Failed to get valid token");
        return;
      }

      const player = new window.Spotify.Player({
        name: "CrateMate DJ",
        getOAuthToken: async (callback: (token: string) => void) => {
          const validToken = await getValidSpotifyUserToken();
          if (validToken) {
            callback(validToken);
          }
        },
        volume: 0.5,
      });

      // Ready: device registered
      player.addListener("ready", ({ device_id }: any) => {
        console.log("Spotify Player ready, device_id:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        playerRef.current = player;
      });

      // State changed
      player.addListener("player_state_changed", (state: any) => {
        if (!state) {
          setIsPlaying(false);
          return;
        }

        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        setVolume(state.volume);
      });

      // Errors
      player.addListener("authentication_error", () => {
        console.error("Spotify: authentication error");
        setErrorMsg("Spotify authentication failed. Please reconnect.");
      });

      player.addListener("account_error", () => {
        console.error("Spotify: account error (Premium required?)");
        setErrorMsg(
          "Spotify account error. Spotify Premium is required for playback."
        );
      });

      // Connect
      const connected = await player.connect();
      if (!connected) {
        console.error("Failed to connect to Spotify Player");
        setIsReady(false);
      }
    };

    initSDK();

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
      if (statePollingRef.current) {
        clearTimeout(statePollingRef.current);
      }
    };
  }, [isAuthenticated]);

  // ── Poll playback state every 1s for smooth progress bar ────────
  useEffect(() => {
    if (!isPlaying || !isReady) return;

    const poll = async () => {
      if (playerRef.current) {
        const state = await playerRef.current.getCurrentState();
        if (state && state.track_window) {
          setPosition(state.position);
          setDuration(state.duration);
        }
      }
      statePollingRef.current = setTimeout(poll, 1000);
    };

    poll();

    return () => {
      if (statePollingRef.current) clearTimeout(statePollingRef.current);
    };
  }, [isPlaying, isReady]);

  // ── Audio event listeners for Deezer preview fallback ───────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setPosition(audio.currentTime * 1000);
    const handleLoadedMetadata = () => setDuration(audio.duration * 1000);
    const handleEnded = () => {
      setIsPlaying(false);
      handlePreviewEnd();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePreviewEnd = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return;

    if (scResult?.embed_url) {
      setPlaybackSource("soundcloud");
      return;
    }

    // Auto-advance
    const idx = queueIndexRef.current + 1;
    if (idx < queueRef.current.length) {
      setQueueIndex(idx);
      play(queueRef.current[idx]);
    }
  }, [scResult?.embed_url]);

  // ── Playback Controls ───────────────────────────────────────────

  const play = useCallback(async (track: PlayerTrack, retry = false) => {
    if (
      currentTrackRef.current?.id === track.id &&
      statusRef.current === "ready" &&
      !retry
    ) {
      return;
    }

    if (retry) cache.delete(track.id);

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setScResult(null);
    setErrorMsg(null);
    setPosition(0);
    setDuration(0);

    // Priority 1: Try Spotify if available
    if (isReady && playerRef.current && track.spotifyUri) {
      try {
        const token = await getValidSpotifyUserToken();
        if (token && deviceId) {
          const success = await spotifyPlay(deviceId, token, [track.spotifyUri]);
          if (success) {
            setPlaybackSource("spotify");
            setStatus("ready");
            statusRef.current = "ready";
            // Background: search SoundCloud for enrichment
            searchSoundCloud();
            return;
          }
        }
      } catch (err) {
        console.warn("Spotify playback failed:", err);
      }
    }

    // Priority 2: Try Deezer preview
    if (track.deezerPreviewUrl) {
      const audio = audioRef.current;
      if (audio) {
        audio.src = track.deezerPreviewUrl;
        audio.play().catch((err) => {
          console.warn("Failed to play Deezer preview:", err);
          searchSoundCloud();
        });
        setPlaybackSource("deezer");
        setStatus("ready");
        statusRef.current = "ready";
        searchSoundCloud();
        return;
      }
    }

    // Priority 3: Fall back to SoundCloud
    searchSoundCloud();

    async function searchSoundCloud() {
      if (cache.has(track.id)) {
        const cached = cache.get(track.id)!;
        if (cached.validated && cached.embed_url) {
          setScResult(cached);
          if (!track.deezerPreviewUrl && !track.spotifyUri) {
            setPlaybackSource("soundcloud");
            setStatus("ready");
            statusRef.current = "ready";
          }
          return;
        }
        if (!track.deezerPreviewUrl && !track.spotifyUri) {
          setStatus("error");
          statusRef.current = "error";
          setErrorMsg(cached.reason || "No SoundCloud link found.");
        }
        return;
      }

      if (!track.deezerPreviewUrl && !track.spotifyUri) {
        setStatus("loading");
        statusRef.current = "loading";
      }

      const data = await enqueueSearch(track);

      if (currentTrackRef.current?.id !== track.id) return;

      if (!data) {
        if (!track.deezerPreviewUrl && !track.spotifyUri) {
          setStatus("error");
          statusRef.current = "error";
          setErrorMsg("Failed to find SoundCloud track. Please try again.");
        }
        return;
      }

      if (data.validated && data.embed_url) {
        setScResult(data);
        if (!track.deezerPreviewUrl && !track.spotifyUri) {
          setPlaybackSource("soundcloud");
          setStatus("ready");
          statusRef.current = "ready";
        }
      } else {
        if (!track.deezerPreviewUrl && !track.spotifyUri) {
          setStatus("error");
          statusRef.current = "error";
          setErrorMsg(
            data.reason || (data as any).error || "No verified SoundCloud link found."
          );
        }
      }
    }
  }, [isReady, deviceId]);

  const pause = useCallback(async () => {
    if (playbackSource === "spotify" && playerRef.current) {
      await playerRef.current.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [playbackSource]);

  const resume = useCallback(async () => {
    if (playbackSource === "spotify" && playerRef.current) {
      await playerRef.current.resume();
    } else if (audioRef.current) {
      audioRef.current.play().catch((err) => console.warn("Resume failed:", err));
    }
  }, [playbackSource]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [isPlaying, pause, resume]);

  const seek = useCallback(
    async (positionMs: number) => {
      if (playbackSource === "spotify" && playerRef.current) {
        await playerRef.current.seek(positionMs);
      } else if (audioRef.current) {
        audioRef.current.currentTime = positionMs / 1000;
      }
    },
    [playbackSource]
  );

  const setVolumeControl = useCallback(
    async (vol: number) => {
      const bounded = Math.max(0, Math.min(1, vol));
      setVolume(bounded);

      if (playbackSource === "spotify" && playerRef.current) {
        await playerRef.current.setVolume(bounded);
      } else if (audioRef.current) {
        audioRef.current.volume = bounded;
      }
    },
    [playbackSource]
  );

  const next = useCallback(async () => {
    if (playbackSource === "spotify" && playerRef.current) {
      await playerRef.current.nextTrack();
    }

    const idx = queueIndexRef.current + 1;
    const q = queueRef.current;
    if (idx < q.length) {
      setQueueIndex(idx);
      await play(q[idx]);
    }
  }, [playbackSource, play]);

  const prev = useCallback(async () => {
    if (playbackSource === "spotify" && playerRef.current) {
      await playerRef.current.previousTrack();
    }

    const idx = queueIndexRef.current - 1;
    const q = queueRef.current;
    if (idx >= 0) {
      setQueueIndex(idx);
      await play(q[idx]);
    }
  }, [playbackSource, play]);

  const playAll = useCallback(
    async (tracks: PlayerTrack[], startIndex = 0) => {
      if (!tracks.length) return;
      fetchQueue = [];
      setQueue(tracks);
      setQueueIndex(startIndex);
      setCachedCount(countCached(tracks));
      await play(tracks[startIndex]);
    },
    [play]
  );

  // ── Auth Controls ───────────────────────────────────────────────

  const connectSpotify = useCallback(async () => {
    try {
      const authUrl = await getSpotifyAuthUrl();
      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const popup = window.open(
        authUrl,
        "SpotifyAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for postMessage from callback
      const handleMessage = (event: MessageEvent) => {
        if (
          event.origin !== window.location.origin ||
          event.data.type !== "spotify_auth_success"
        ) {
          return;
        }
        setIsAuthenticated(true);
        window.removeEventListener("message", handleMessage);
      };

      window.addEventListener("message", handleMessage);
    } catch (err) {
      console.error("Failed to open Spotify auth:", err);
    }
  }, []);

  const disconnectSpotify = useCallback(() => {
    setIsAuthenticated(false);
    setIsReady(false);
    setDeviceId(null);
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
  }, []);

  const searchAndPlay = useCallback(
    async (track: PlayerTrack) => {
      // Try to find track on Spotify if not already known
      if (!track.spotifyUri) {
        setStatus("loading");
        const result = await searchSpotifyTrack(track.artist, track.title);
        if (result) {
          track.spotifyUri = result.spotifyUri;
          track.spotifyId = result.spotifyId;
        }
      }
      await play(track);
    },
    [play]
  );

  // ── Prefetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (queue.length <= 0) return;
    prefetchCurrentAndNext(queue, queueIndex);
  }, [queueIndex, queue]);

  // ── Computed values ─────────────────────────────────────────────
  const hasNext = queueIndex >= 0 && queueIndex < queue.length - 1;
  const hasPrev = queueIndex > 0;
  const cacheTotal = queue.length;
  const isCaching = queue.length > 1 && cachedCount < queue.length;
  const scAvailable = !!scResult?.embed_url;

  return (
    <PlayerContext.Provider
      value={{
        // Auth
        isAuthenticated,
        connectSpotify,
        disconnectSpotify,

        // SDK
        isReady,
        deviceId,

        // Playback
        currentTrack,
        scResult,
        status,
        errorMsg,
        playbackSource,
        isPlaying,
        position,
        duration,
        volume,

        // Controls
        play,
        pause,
        resume,
        togglePlay,
        seek,
        setVolume: setVolumeControl,

        // Queue
        queue,
        queueIndex,
        playAll,
        next,
        prev,
        hasNext,
        hasPrev,

        // Cache
        cachedCount,
        cacheTotal,
        isCaching,

        // Refs
        audioRef,
        scAvailable,

        // Search
        searchAndPlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
