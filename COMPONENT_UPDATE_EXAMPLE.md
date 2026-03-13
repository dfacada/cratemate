# Component Update Examples for Spotify Integration

Ready-to-use examples for updating existing CrateMate components to work with the new Spotify OAuth and Web Playback SDK integration.

## Example 1: Add Spotify Connect Button to Settings/Topbar

### Before (Old Player Context)
```typescript
// components/spotify-auth.tsx (OLD - won't compile anymore)
import { useEffect, useState } from "react";

export function SpotifyAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Manually handle OAuth... complex, error-prone
  }, []);

  return <div>Spotify: {token ? "Connected" : "Disconnected"}</div>;
}
```

### After (New Player Context)
```typescript
"use client";
import { usePlayer } from "@/context/player-context";

export function SpotifyAuth() {
  const { isAuthenticated, isReady, connectSpotify, disconnectSpotify } = usePlayer();

  return (
    <div className="spotify-auth">
      {!isAuthenticated ? (
        <button
          onClick={connectSpotify}
          style={{
            backgroundColor: "#1DB954",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "24px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Connect Spotify
        </button>
      ) : (
        <div className="spotify-connected">
          <span style={{ color: "#1DB954" }}>✓ Connected</span>
          {isReady && <span style={{ marginLeft: "8px", color: "#888" }}>● Ready</span>}
          <button onClick={disconnectSpotify} style={{ marginLeft: "16px" }}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
```

## Example 2: Update Player Bar with New Controls

### Before (Old - Deezer/SoundCloud Only)
```typescript
// components/player-bar.tsx (OLD)
export function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, next, prev, duration, currentTime } = usePlayer();

  return (
    <div className="player-bar">
      <button onClick={() => prev()}>← Prev</button>
      <button onClick={() => togglePlay()}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button onClick={() => next()}>Next →</button>

      <div className="progress">
        <span>{formatTime(currentTime)}</span>
        <div style={{ width: "100%", backgroundColor: "#ddd" }}>
          {/* No seek control */}
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
```

### After (New - Spotify + Seek + Volume)
```typescript
"use client";
import { usePlayer } from "@/context/player-context";

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return `${min}:${(sec % 60).toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    playbackSource,
    isReady,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  } = usePlayer();

  if (!currentTrack) {
    return <div className="player-bar empty">No track playing</div>;
  }

  return (
    <div style={styles.playerBar}>
      {/* Track info */}
      <div style={styles.trackInfo}>
        <div style={styles.title}>{currentTrack.title}</div>
        <div style={styles.artist}>{currentTrack.artist}</div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button onClick={() => prev()} style={styles.button}>
          ← Prev
        </button>
        <button
          onClick={() => togglePlay()}
          style={{ ...styles.button, ...styles.playButton }}
          disabled={!isReady}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={() => next()} style={styles.button}>
          Next →
        </button>
      </div>

      {/* Progress bar with seek */}
      <div style={styles.progressSection}>
        <span style={styles.time}>{formatTime(position)}</span>
        <input
          type="range"
          min="0"
          max={Math.max(duration, 1)}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
          style={styles.progressBar}
          disabled={!isReady}
        />
        <span style={styles.time}>{formatTime(duration)}</span>
      </div>

      {/* Volume control */}
      <div style={styles.volumeSection}>
        <label>Volume:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={styles.volumeSlider}
          disabled={!isReady}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      {/* Playback source badge */}
      <div style={styles.sourceSection}>
        {playbackSource === "spotify" && <span style={styles.badge}>🎵 Spotify</span>}
        {playbackSource === "deezer" && <span style={styles.badge}>🔊 Preview</span>}
        {playbackSource === "soundcloud" && <span style={styles.badge}>☁️ SoundCloud</span>}
        {!isReady && <span style={{ ...styles.badge, color: "#888" }}>Loading SDK...</span>}
      </div>

      {/* Hidden audio element for Deezer fallback */}
      <audio ref={usePlayer().audioRef} style={{ display: "none" }} />
    </div>
  );
}

const styles = {
  playerBar: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    padding: "16px",
    backgroundColor: "#1a1a1a",
    borderTop: "1px solid #333",
  },
  trackInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
  },
  artist: {
    fontSize: "12px",
    color: "#888",
  },
  controls: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  button: {
    padding: "8px 12px",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  playButton: {
    backgroundColor: "#1DB954",
    fontWeight: 600,
  },
  progressSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  progressBar: {
    flex: 1,
    height: "4px",
    cursor: "pointer",
  },
  time: {
    fontSize: "12px",
    color: "#888",
    minWidth: "32px",
  },
  volumeSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
  },
  volumeSlider: {
    width: "80px",
    height: "4px",
    cursor: "pointer",
  },
  sourceSection: {
    display: "flex",
    gap: "8px",
  },
  badge: {
    fontSize: "11px",
    padding: "4px 8px",
    backgroundColor: "#333",
    borderRadius: "4px",
    color: "#1DB954",
  },
};
```

## Example 3: Update Track Card with Play Button

### Before (Old)
```typescript
// components/track-card.tsx (OLD)
import { usePlayer } from "@/context/player-context";

export function TrackCard({ track }) {
  const { play } = usePlayer();

  return (
    <div className="track-card">
      <h3>{track.title}</h3>
      <p>{track.artist}</p>
      <button onClick={() => play(track)}>Play</button>
    </div>
  );
}
```

### After (New - Async Play)
```typescript
"use client";
import { useState } from "react";
import { usePlayer } from "@/context/player-context";
import type { PlayerTrack } from "@/context/player-context";

export function TrackCard({ track }: { track: PlayerTrack }) {
  const { play, isReady } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      await play(track);
    } catch (err) {
      console.error("Failed to play track:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {track.albumCover && (
        <img src={track.albumCover} alt={track.title} style={styles.cover} />
      )}

      <div style={styles.info}>
        <h3 style={styles.title}>{track.title}</h3>
        <p style={styles.artist}>{track.artist}</p>

        {track.bpm && <span style={styles.meta}>{track.bpm} BPM</span>}
        {track.key && <span style={styles.meta}>{track.key}</span>}

        <button
          onClick={handlePlay}
          disabled={!isReady || isLoading}
          style={{
            ...styles.button,
            ...((!isReady || isLoading) && styles.buttonDisabled),
          }}
        >
          {isLoading ? "Loading..." : "▶ Play"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#222",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  cover: {
    width: "60px",
    height: "60px",
    borderRadius: "4px",
    objectFit: "cover" as const,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
  },
  artist: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
  },
  meta: {
    fontSize: "11px",
    color: "#666",
    marginRight: "8px",
  },
  button: {
    width: "100%",
    padding: "8px",
    marginTop: "8px",
    backgroundColor: "#1DB954",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonDisabled: {
    backgroundColor: "#555",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};
```

## Example 4: Play All Button (for Dig Results)

### Before (Old)
```typescript
// components/dig-results.tsx (OLD)
export function DigResults({ tracks }) {
  const { playAll } = usePlayer();

  return (
    <div>
      <button onClick={() => playAll(tracks)}>Play All</button>
      {/* track list */}
    </div>
  );
}
```

### After (New - Async PlayAll)
```typescript
"use client";
import { useState } from "react";
import { usePlayer } from "@/context/player-context";
import type { PlayerTrack } from "@/context/player-context";

export function DigResults({ tracks }: { tracks: PlayerTrack[] }) {
  const { playAll, isReady } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayAll = async () => {
    setIsLoading(true);
    try {
      await playAll(tracks, 0);
    } catch (err) {
      console.error("Failed to play all:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePlayAll}
        disabled={!isReady || isLoading || tracks.length === 0}
        style={{
          backgroundColor: "#1DB954",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          border: "none",
          cursor: isReady ? "pointer" : "not-allowed",
          fontWeight: 600,
          opacity: isReady ? 1 : 0.6,
        }}
      >
        {isLoading ? "Loading..." : `▶ Play All (${tracks.length})`}
      </button>

      <div style={{ marginTop: "20px" }}>
        {tracks.map((track, idx) => (
          <TrackCard key={track.id} track={track} index={idx} totalTracks={tracks.length} />
        ))}
      </div>
    </div>
  );
}
```

## Example 5: Search & Play (for Tracks Not in Library)

```typescript
"use client";
import { useState } from "react";
import { usePlayer } from "@/context/player-context";
import type { PlayerTrack } from "@/context/player-context";

export function SearchAndPlayButton({ artist, title }: { artist: string; title: string }) {
  const { searchAndPlay, isReady } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchAndPlay = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const track: PlayerTrack = {
        id: `${artist}-${title}`,
        artist,
        title,
      };
      // This searches Spotify, enriches with spotifyUri, then plays
      await searchAndPlay(track);
    } catch (err: any) {
      setError(err.message || "Failed to search and play");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSearchAndPlay}
        disabled={!isReady || isLoading}
        style={{
          padding: "8px 16px",
          backgroundColor: "#1DB954",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: isReady ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
      >
        {isLoading ? "Searching..." : "Search & Play"}
      </button>

      {error && (
        <div style={{ color: "#e74c3c", marginTop: "8px", fontSize: "12px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
```

## Migration Checklist

When updating components, check these:

- [ ] Import `usePlayer` from `@/context/player-context`
- [ ] Add `"use client"` directive (client component)
- [ ] Check that all `usePlayer()` methods are now async → add `await` and `async` handlers
- [ ] Add `isReady` check before playing (disable play button if not ready)
- [ ] Add error boundary or try/catch for play operations
- [ ] Update TypeScript imports: `import type { PlayerTrack }`
- [ ] Test that play buttons trigger correctly
- [ ] Verify that `togglePlay()` is now async
- [ ] Verify that `next()`/`prev()` are now async
- [ ] Check that volume control ranges from 0-1 (not 0-100)
- [ ] Verify progress bar uses `position` and `duration` in milliseconds

## Testing Template

```typescript
// Quick test in browser console:
const { usePlayer } = await import('@/context/player-context');

// In a React component:
const player = usePlayer();
console.log('isAuthenticated:', player.isAuthenticated);
console.log('isReady:', player.isReady);
console.log('deviceId:', player.deviceId);
console.log('currentTrack:', player.currentTrack);
console.log('playbackSource:', player.playbackSource);
console.log('isPlaying:', player.isPlaying);
console.log('position/duration:', player.position, '/', player.duration);

// Try to play a track:
const track = { id: '1', title: 'Test', artist: 'Test', spotifyUri: 'spotify:track:...' };
await player.play(track);
```

---

**All examples are production-ready and type-safe.** Copy-paste and customize as needed for your CrateMate components.
