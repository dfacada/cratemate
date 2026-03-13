# Spotify OAuth & Web Playback SDK Integration

Complete integration for Spotify user authentication, OAuth token management, and full-track playback via Web Playback SDK for CrateMate.

## What's Implemented

### 1. **lib/spotify.ts** — Extended with OAuth & Playback Helpers

Added functions for user authentication and playback control:

#### Auth Flow
- `getSpotifyAuthUrl()` — Returns Spotify authorization URL with all required scopes
- `getSpotifyRedirectUri()` — Constructs redirect URI from environment (NEXT_PUBLIC_APP_URL or window.origin)
- `saveSpotifyUserToken(data)` — Persist tokens to localStorage (`cratemate_spotify_user_token`)
- `getSpotifyUserToken()` — Retrieve cached tokens
- `clearSpotifyUserToken()` — Clear tokens
- `isSpotifyAuthenticated()` — Check if user has valid (non-expired) token
- `getValidSpotifyUserToken()` — Auto-refresh if needed, used by Web Playback SDK

#### Playback Control (Web API)
- `spotifyPlay(deviceId, accessToken, uris, offsetIndex?)` — Play track(s)
- `spotifyPause(accessToken)` — Pause playback
- `spotifySeek(accessToken, positionMs)` — Jump to position
- `spotifySetVolume(accessToken, volumePercent)` — 0-100 volume control
- `spotifyNext(accessToken)` — Skip forward
- `spotifyPrevious(accessToken)` — Skip backward
- `spotifyGetCurrentState(accessToken)` — Fetch current player state

All playback functions are async and return boolean/data for error handling.

### 2. **app/auth/spotify/callback/page.tsx** — OAuth Callback Handler

Client-side callback page that:
- Reads `code` from URL query params
- Exchanges code for tokens via `/api/spotify-auth`
- Saves tokens to localStorage
- Posts message back to parent window (if opened via popup)
- Redirects to `/settings` or closes popup after 2 seconds
- Styled dark UI matching CrateMate design

### 3. **app/api/spotify-auth/route.ts** — Token Exchange Server

Handles two flows:
- **Authorization Code**: `POST { code, redirectUri }` → Returns access + refresh tokens
- **Token Refresh**: `POST { refreshToken }` → Returns new access token

Both return:
```json
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 }
```

Runtime: `nodejs`, maxDuration: 10s

### 4. **context/player-context.tsx** — Complete Rewrite

Full rewrite with Spotify Web Playback SDK integration:

#### New State
- `isAuthenticated` — User logged into Spotify
- `isReady` — SDK initialized and device registered
- `deviceId` — Current playback device ID

#### Priority Playback
1. **Spotify** (if user authenticated + track has spotifyUri) — Full quality, full length
2. **Deezer** (if available) — 30s preview, instant
3. **SoundCloud** (background search) — Full track if found

#### Key Features
- Auto-initializes Web Playback SDK on auth (loads script, creates player, registers device)
- State polling every 1s while playing (smooth progress bar)
- Auto-refresh tokens before expiry via callback
- Queue management with prefetching (current + next track only)
- SoundCloud persistent cache (for enrichment when Spotify/Deezer unavailable)
- Error handling: shows "Premium required" for account errors
- All playback methods are async (play, pause, resume, next, prev, seek, setVolume)

#### Context Value
```typescript
interface PlayerContextValue {
  // Auth
  isAuthenticated: boolean
  connectSpotify: () => void      // Opens OAuth popup
  disconnectSpotify: () => void

  // SDK
  isReady: boolean
  deviceId: string | null

  // Current playback
  currentTrack: PlayerTrack | null
  isPlaying: boolean
  position: number                // ms
  duration: number                // ms
  volume: number                  // 0-1

  // Controls (all async)
  play: (track, retry?) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  seek: (positionMs) => Promise<void>
  setVolume: (0-1) => Promise<void>

  // Queue
  queue: PlayerTrack[]
  playAll: (tracks, startIndex?) => Promise<void>
  hasNext: boolean
  hasPrev: boolean

  // Search utility
  searchAndPlay: (track) => Promise<void>  // Searches Spotify if needed, then plays

  // SoundCloud enrichment
  scResult: SCSearchResult | null
  scAvailable: boolean
  cachedCount: number
  cacheTotal: number
  isCaching: boolean

  // State
  status: "idle" | "loading" | "ready" | "error"
  errorMsg: string | null
  playbackSource: "spotify" | "deezer" | "soundcloud" | "none"

  // Fallback
  audioRef: React.RefObject<HTMLAudioElement>
}
```

## Environment Variables

Add these to Vercel → Settings → Environment Variables (Production + Preview):

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=https://cratemate-five.vercel.app    # or your domain
```

For local dev, add to `.env.local`:
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app (any name)
3. Accept terms, create app
4. Copy **Client ID** and **Client Secret**
5. Click "Edit Settings"
6. Under "Redirect URIs", add both:
   - `http://localhost:3000/auth/spotify/callback` (for local dev)
   - `https://cratemate-five.vercel.app/auth/spotify/callback` (or your production domain)
7. Save

## TypeScript Types

The project needs `@types/spotify-web-playback-sdk` for full type support:

```bash
npm install --save-dev @types/spotify-web-playback-sdk
```

This adds types for the global `Spotify.Player` class and all event listeners.

## Usage in Components

### Connect Button
```typescript
import { usePlayer } from "@/context/player-context";

export function SpotifyConnectButton() {
  const { isAuthenticated, connectSpotify, disconnectSpotify } = usePlayer();

  if (!isAuthenticated) {
    return <button onClick={connectSpotify}>Connect Spotify</button>;
  }

  return <button onClick={disconnectSpotify}>Disconnect</button>;
}
```

### Play a Track
```typescript
const { play, isReady } = usePlayer();

// Play a Spotify track
const track = {
  id: "track1",
  title: "Song Name",
  artist: "Artist Name",
  spotifyUri: "spotify:track:xxxxx",  // Full track URL (Spotify search returns this)
};

if (isReady) {
  await play(track);
}
```

### Play a Queue
```typescript
const { playAll } = usePlayer();

const tracks = [
  { id: "1", title: "Track 1", artist: "Artist 1", spotifyUri: "spotify:track:aaa" },
  { id: "2", title: "Track 2", artist: "Artist 2", spotifyUri: "spotify:track:bbb" },
];

// Play from index 0
await playAll(tracks);

// Or start from track 5
await playAll(tracks, 5);
```

### Player Bar
```typescript
const { isPlaying, togglePlay, next, prev, position, duration, volume, setVolume } = usePlayer();

// In component:
<button onClick={() => togglePlay()}>
  {isPlaying ? "Pause" : "Play"}
</button>

<input
  type="range"
  min="0"
  max={duration}
  value={position}
  onChange={(e) => seek(Number(e.target.value))}
/>

<input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={volume}
  onChange={(e) => setVolume(Number(e.target.value))}
/>
```

### Search & Play (for tracks not in user library)
```typescript
const { searchAndPlay } = usePlayer();

const track = { id: "1", title: "Song", artist: "Artist" };
// This searches Spotify, enriches track with spotifyUri, then plays
await searchAndPlay(track);
```

## How It Works

### Auth Flow
1. User clicks "Connect Spotify" → Opens popup to `https://accounts.spotify.com/authorize?...`
2. User grants permissions
3. Spotify redirects to `/auth/spotify/callback?code=...`
4. Callback page exchanges code for tokens via `/api/spotify-auth` (server-side)
5. Tokens saved to localStorage
6. postMessage back to main window, popup closes
7. Main app re-renders with `isAuthenticated = true`

### Playback Flow
1. SDK loads on auth mount (`https://sdk.scdn.co/spotify-player.js`)
2. `window.onSpotifyWebPlaybackSDKReady` callback fires
3. New `Spotify.Player` created with getOAuthToken callback
4. Player connects, "ready" event fires, device_id captured
5. User clicks play → `spotifyPlay(deviceId, token, [track.spotifyUri])`
6. Web Playback SDK begins playback on user's device
7. State changes → UI updates (progress bar, play button, etc.)
8. On track end → auto-advance to next in queue

### Token Refresh
- Tokens stored in localStorage with `expiresAt` timestamp
- `getValidSpotifyUserToken()` called before each API request
- If expired, automatically refreshes via `/api/spotify-auth` with refresh token
- New tokens saved to localStorage
- Transparent to UI

## Error Handling

### `authentication_error`
Token refresh failed. Show message: "Spotify authentication failed. Please reconnect."
User must click "Connect Spotify" again.

### `account_error`
User doesn't have Spotify Premium. Show message: "Spotify account error. Spotify Premium is required for playback."
Fallback to Deezer preview or SoundCloud search.

## Testing Checklist

- [ ] User can click "Connect Spotify" (Settings page or topbar)
- [ ] OAuth popup opens, user grants permissions
- [ ] Callback exchanges code for tokens
- [ ] Popup closes, main app shows "Connected"
- [ ] `isReady` becomes true after ~2-3s (SDK loading)
- [ ] Player bar appears in CrateMate
- [ ] Can click Play on any track with spotifyUri
- [ ] Track plays at full quality (not preview)
- [ ] Position/duration show correctly, progress bar works
- [ ] Pause/Resume/Next/Prev buttons work
- [ ] Volume slider works
- [ ] Auto-advance to next track on end
- [ ] Tokens refresh automatically before expiry
- [ ] Disconnect button clears auth
- [ ] Fallback to Deezer preview if token expires (graceful)
- [ ] SoundCloud search works if track not on Spotify

## Known Limitations

- Web Playback SDK requires Spotify Premium
- SoundCloud search is slow (rate-limited)
- Playback device must stay active (if user switches to another app's player, SDK player pauses)
- No offline playback support (SDK requires internet)
- Tokens stored in localStorage (XSS vulnerable but fine for personal use)

## Future Improvements

- Add Search UI for finding tracks not yet in library
- Batch Spotify search (multi-track lookup)
- Transfer playback to other devices mid-session
- Show current device in player bar
- Spotify Saved Tracks / Liked Songs import
- Playlists syncing with Spotify
- Lyrics display (via Spotify or Genius API)
