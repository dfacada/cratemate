# CrateMate — Project Context

## What Is This
CrateMate is a personal DJ crate-digging and music discovery tool. It helps DJs find, analyze, organize, and export tracks using AI-powered playlist analysis, SoundCloud playback, and Beatport metadata enrichment.

## Live Deployment
- **URL**: https://cratemate-five.vercel.app/crate
- **Repo**: github.com/dfacada/cratemate
- **Auto-deploy**: Push to main → Vercel auto-deploys

## Tech Stack
- **Framework**: Next.js 16 (App Router), TypeScript, deployed on Vercel
- **Frontend**: React 19.2.3, Tailwind CSS v4 + inline styles (fixed layout uses `style={{}}` only)
- **UI**: shadcn/ui + Radix UI (dialog, dropdown, tabs, tooltip), Lucide React icons (v0.383.0), Framer Motion, Recharts
- **AI**: Claude Sonnet 4 (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk` — playlist analysis + SoundCloud search agent with `web_search_20250305` tool
- **Audio**: SoundCloud Widget iframe (`w.soundcloud.com/player` embed)
- **Storage**: localStorage (crates, SC token, SC client ID, Beatport token) — no database
- **State**: React Context (PlayerProvider) — no Redux/Zustand

## Architecture Overview

### Directory Structure
```
app/
├── (app)/              # Main app routes (layout with sidebar + topbar + player)
│   ├── dashboard/      # Home: stats, recent tracks, active crate, radar
│   ├── new-dig/        # Main dig engine (import → analyze → recommendations)
│   ├── crate/          # Crate table with sorting/filtering
│   ├── artists/        # Artist miner with catalog browsing
│   ├── labels/         # ⚠️ STUB — shell only
│   ├── radar/          # Underground radar with AI-detected tracks
│   ├── set-builder/    # ⚠️ STUB — skeleton UI
│   ├── settings/       # ⚠️ MOSTLY STUB — only Beatport setup works
│   └── history/        # ⚠️ STUB — minimal
├── api/
│   ├── analyze/        # Claude playlist analysis (DNA + recommendations)
│   ├── soundcloud-search/ # Claude + web_search to find/validate SC tracks
│   ├── beatport/       # Proxy for Beatport API with token refresh
│   ├── spotify/        # Spotify playlist import (Client Credentials flow)
│   ├── deezer/         # Deezer playlist import
│   └── preview/        # ⚠️ STUB
├── auth/
│   ├── soundcloud/callback  # SC OAuth implicit grant callback
│   └── beatport/callback    # Beatport OAuth callback
components/             # React UI components
context/                # PlayerContext (global playback state + SC search cache)
lib/                    # Utility functions (soundcloud.ts, beatport.ts, crates.ts, etc.)
types/                  # TypeScript types (track, crate, artist, playlist)
data/                   # Mock data for demo/dev
```

### Key Data Flow
1. **Import**: User provides playlist URL (SC/Spotify/Deezer), pastes text, or uploads screenshot
2. **Analyze**: Tracks sent to `/api/analyze` → Claude generates PlaylistDNA + recommendations
3. **Browse**: Results displayed with play buttons, metadata, gem scores
4. **Play**: Click play → PlayerContext calls `/api/soundcloud-search` → Claude finds SC URL → iframe widget plays track
5. **Export**: User can export crate as SoundCloud public playlist via OAuth

### Key Files Quick Reference
| File | Purpose | Notes |
|------|---------|-------|
| `app/api/analyze/route.ts` | Playlist DNA + recommendations | DNA on first call, recs-only batches after |
| `app/api/soundcloud-search/route.ts` | Claude SC track discovery agent | web_search tool, validates permalink |
| `app/api/beatport/route.ts` | Beatport enrichment proxy | Handles token refresh, x-bp-* headers |
| `app/api/spotify/route.ts` | Spotify playlist fetch | Client Credentials, returns track list |
| `app/auth/soundcloud/callback/page.tsx` | SC OAuth callback | Implicit grant fragment reader |
| `components/dig-engine.tsx` | Core dig UI (all 3 phases) | Input → Analyzing → Results |
| `components/player-bar.tsx` | Fixed bottom player | SC widget iframe + Beatport chips |
| `components/soundcloud-export.tsx` | SC playlist export modal | OAuth + track search + create playlist |
| `components/soundcloud-import.tsx` | SC set URL importer | Hidden iframe + Widget API |
| `components/sidebar.tsx` | Nav with New Dig CTA | New Dig = primary teal button at top |
| `context/player-context.tsx` | Global play state | Calls /api/soundcloud-search |
| `lib/crates.ts` | Crate CRUD (localStorage) | getCrates / saveCrate / deleteCrate |
| `lib/soundcloud.ts` | SC auth + export helpers | getSCToken / createSCPlaylist |
| `lib/beatport.ts` | Beatport token + search helpers | getBPToken / searchBeatport / formatKey |

## Environment Variables

Set in Vercel → Project → Settings → Environment Variables (Production + Preview). Never commit to repo. For local dev, use `.env.local`.

| Variable | Required? | Description |
|----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | **REQUIRED** | console.anthropic.com → API Keys. Powers playlist analysis and SC track search agent. |
| `SPOTIFY_CLIENT_ID` | Optional | developer.spotify.com → Dashboard → Create App. Needed for Spotify playlist URL import. |
| `SPOTIFY_CLIENT_SECRET` | Optional | Same Spotify app as above. Pair with CLIENT_ID. |
| `NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID` | Optional | soundcloud.com/you/apps — user can also paste in Settings UI. Used for SC playlist export OAuth. |

*ANTHROPIC_API_KEY is the only hard requirement. The app works without the others but Spotify import and SC export will be unavailable.*

## API Routes & Connections

### Anthropic — Playlist Analysis (POST /api/analyze)
- **Model**: claude-sonnet-4-20250514, max_tokens 8000
- **Batching**: First call returns DNA + up to 20 recs. Subsequent calls (`mode=recs`): 20 recs each, sequential, with DNA summary passed as context (no re-analysis)
- **maxDuration**: 60s (requires Vercel Pro for >10s; Hobby plan needs recs capped at 20 per call)

### Anthropic — SC Track Agent (GET /api/soundcloud-search)
- **Model**: claude-sonnet-4-20250514, max_tokens 1024
- **Tool**: web_search_20250305 (Anthropic built-in)
- **Response TTL**: 86400s (24h) via Cache-Control
- **URL validation**: Regex `^https://soundcloud.com/{user}/{track}$` — rejects set pages, profile pages, guessed slugs
- **Embed URL**: Built server-side: `w.soundcloud.com/player/?url=...` with auto_play, no related, no comments

### SoundCloud Widget Player (no auth)
- **Embed base**: `https://w.soundcloud.com/player/`
- **Params**: `url=TRACK_URL & auto_play=true & hide_related=true & show_comments=false & show_reposts=false & visual=false`
- **Height**: 80px compact / 166px expanded
- **Restriction**: Public tracks only. Private/region-locked fail silently.

### SoundCloud Playlist Export (OAuth required)
- **OAuth flow**: Implicit grant (token in URL fragment). Popup → user authorises → postMessage back to app.
- **Redirect URI**: `https://{domain}/auth/soundcloud/callback` — must be registered in SC developer app
- **API calls**: `api-v2.soundcloud.com/search/tracks` → `api-v2.soundcloud.com/playlists`
- **Rate limits**: SC API v2 is unofficial — 150ms delay between track lookups built in
- **Setup**: soundcloud.com/you/apps/new → name anything → Redirect URI → copy Client ID → paste in CrateMate Settings

### SoundCloud Playlist Import (Widget API, no auth)
- Hidden `<iframe>` + Widget JS API → extracts track list from public sets client-side
- Component: `components/soundcloud-import.tsx`

### Beatport API v4
- **Purpose**: Track enrichment only — BPM, Camelot key, label, catalogue number, Buy link
- **Auth**: OAuth2 — manual 3-step token paste flow (popup OAuth won't work: Beatport postMessage targets their own domain)
- **Client ID**: `0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd` (hardcoded in `lib/beatport.ts` and `api/beatport/route.ts`)
- **Proxy**: `app/api/beatport/route.ts` — client sends `x-bp-token` + `x-bp-refresh` headers; route forwards to Beatport, handles 401 refresh
- **Caching**: In-memory Map (`enrichCache`) per session — no localStorage for enrichment
- **If not set up**: Beatport chips don't appear. No error, fully graceful.

### Spotify Web API
- **Endpoint**: `api.spotify.com/v1/playlists/{id}/tracks`
- **Auth**: Client Credentials flow (server-side only, no user login)
- **Route**: `app/api/spotify/route.ts`
- **Returns**: Track list (artist, title, label, duration). No audio preview.
- **If not set up**: User sees "Spotify credentials not configured. Use the paste method instead."

## Client-Side Storage (localStorage)

| Key | Contents | Set by |
|-----|----------|--------|
| `cratemate_crates` | JSON array of Crate objects (id, name, createdAt, tracks[]) | `lib/crates.ts` |
| `cratemate_bp_token` | {access_token, refresh_token, expires_at} | `components/beatport-setup.tsx` |
| `cratemate_sc_token` | {access_token, expires_at} | `lib/soundcloud.ts` |
| `cratemate_sc_client_id` | User's SoundCloud app Client ID string | `lib/soundcloud.ts` |

## Feature Availability Matrix

| Feature | Works without setup? | What's needed |
|---------|---------------------|---------------|
| Paste tracks + Analyze | Yes | ANTHROPIC_API_KEY |
| SoundCloud URL import | Yes | Nothing (client-side widget) |
| Play button (SC widget) | Yes | ANTHROPIC_API_KEY |
| Spotify URL import | No | SPOTIFY_CLIENT_ID + SECRET |
| Beatport BPM/key chips | No | User pastes Beatport token in Settings |
| Export to SC playlist | No | User creates SC dev app + pastes Client ID |
| Save crate | Yes | Nothing (localStorage) |
| 100-rec dig | Yes (batches of 20) | ANTHROPIC_API_KEY + Vercel Pro (for timeout) |

## Player Context
- Global state: `currentTrack`, `scResult` (embed info), `play(track)`, `stop()`
- Built-in LRU cache prevents duplicate API calls for SC searches
- Player bar is fixed at bottom with expandable view (80px compact / 166px expanded)

## What's Working Well
- ✅ Dig engine multi-source import (SC, Spotify, Deezer, OCR, paste)
- ✅ Claude-powered playlist analysis with DNA visualization
- ✅ SoundCloud OAuth + playback via iframe widget
- ✅ Player context with LRU cache
- ✅ Crate table with sorting/filtering
- ✅ Beatport metadata enrichment + token refresh
- ✅ Responsive layout (sidebar desktop / drawer mobile at 768px)
- ✅ Dashboard with stats and recent activity
- ✅ Radar cards for underground tracks
- ✅ Type-safe throughout with strict TypeScript

## What Needs Work

### Incomplete Pages (Stubs)
- **Labels page** (`app/(app)/labels/page.tsx`) — shell only, no label browsing logic
- **History page** (`app/(app)/history/page.tsx`) — minimal, needs timeline view of past crates
- **Set Builder** (`components/set-builder.tsx`) — skeleton, needs drag-and-drop arrangement
- **Settings page** — 5 sections all "Coming soon" (Profile, Appearance, Library, Notifications, Region). Only Beatport setup works.

### Incomplete Libraries
- `lib/artist-miner.ts` — stub for catalog mining logic
- `lib/playlist-analyzer.ts` — incomplete
- `lib/ocr-parser.ts` — OCR parsing (likely using Claude Vision)

### Known Issues
- SoundCloud export is slow with large crates (sequential 150ms loop)
- No offline fallback if Claude API is down
- Beatport token stored in localStorage (XSS vulnerable, fine for personal use)
- OCR feedback has no retry mechanism
- No explicit Beatport rate limit handling beyond 401 refresh

## Development Plan

### Phase 1: Stabilize (Do First)
1. Complete Settings page (Profile, Appearance, Library sections)
2. Audit dig engine flow end-to-end — fix broken paths
3. Fix SoundCloud playback edge cases
4. Add proper error boundaries and fallbacks across API routes
5. Responsive UI polish pass

### Phase 2: Build Out
1. Labels browser page — browse by label, see release history
2. Crate history with timeline view
3. Set Builder with drag-and-drop track arrangement
4. Artist Miner catalog logic
5. Improve SC export speed (batch/parallel search)

### Phase 3: Level Up
1. Move from localStorage to IndexedDB for persistence
2. Offline support + response caching
3. Smarter Claude recommendation prompts
4. Keyboard shortcuts for power users
5. PWA wrapper for desktop-app feel

## Vercel Deployment
- **Runtime**: nodejs (set explicitly on all API routes, not edge)
- **Function timeout**: maxDuration = 60s on analyze, 45s on soundcloud-search. Vercel Pro required for >10s.
- **Build command**: `next build` (auto-detected)
- **Output directory**: `.next` (default)
- **Node version**: 18+ LTS
- **Env var scope**: Set all vars in Production + Preview environments

## Running Locally
```bash
# Create .env.local with your keys:
# ANTHROPIC_API_KEY=sk-ant-...       (Required)
# SPOTIFY_CLIENT_ID=your_id          (Optional)
# SPOTIFY_CLIENT_SECRET=your_secret  (Optional)
# NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID=your_sc_id  (Optional)

npm install
npm run dev
```
Dev server runs on http://localhost:3000/crate. Hot reload enabled.
