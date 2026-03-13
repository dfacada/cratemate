# CrateMate v2 — Architecture Redesign

## Core Problem
CrateMate v1 has a strong concept (AI-powered DJ crate digging) but a broken execution: SoundCloud-only playback means 8-second waits per track, Claude hallucinates non-existent tracks, half the app is stubs, and the recommendation engine doesn't understand harmonic mixing.

## Design Principles
1. **Instant playback** — A DJ tool where you can't instantly hear tracks is useless
2. **No hallucinated tracks** — Every recommendation must be validated against a real catalog
3. **Musically intelligent** — Understand keys (Camelot), BPM, energy flow, mixing compatibility
4. **Dark by default** — DJs work in dark environments

## Playback Strategy: Multi-Source with Deezer Previews

### The Problem
SoundCloud playback requires Claude to web-search for each track URL (5-8s per track, rate limited, often fails). This is the #1 UX killer.

### The Solution
**Deezer 30-second MP3 previews** as the instant default layer:
- Free, no auth required
- Direct MP3 URL returned in search results
- Plays instantly via HTML5 `<audio>` element
- Full programmatic control (seek, volume, waveform)

**SoundCloud full tracks** as the upgrade layer:
- Background search continues while Deezer preview plays
- When SC link found, user can "upgrade" to full track
- Non-blocking — never wait for SC

### Playback Priority
1. Click play → instant Deezer 30s preview (< 200ms)
2. Background: search SoundCloud for full track
3. If SC found → show "Full Track Available" badge, auto-switch if user enables
4. If SC not found → preview continues, no error

## Recommendation Engine v2

### Current Problem
Claude generates track names from memory, many don't exist. Confidence scoring helps but doesn't eliminate hallucination.

### New Pipeline
```
User Input (playlist)
  → Claude Playlist DNA Analysis (keep this — it's good)
  → Claude generates candidate recommendations with:
      - Camelot key compatibility reasoning
      - BPM proximity (±5 BPM)
      - Energy flow awareness
      - Label/artist lineage connections
  → For EACH recommendation:
      → Search Deezer API (artist + title)
      → If found: include with preview_url + metadata
      → If NOT found: search Beatport API
      → If neither found: DISCARD (not hallucinated)
  → Return only validated tracks with real preview URLs
```

### Recommendation Context
Each recommendation includes:
- **Why it fits**: "Harmonic match (8A → 9A), similar energy (0.72), same label family"
- **Mixing note**: "±3 BPM from previous track, compatible Camelot key"
- **Preview URL**: Instant playback available

### Camelot Compatibility Rules (built into Claude prompt)
- Same key: 8A → 8A ✅
- Adjacent number: 8A → 7A or 9A ✅
- Relative major/minor: 8A → 8B ✅
- Energy shift: allow ±2 keys for intentional mood changes
- Avoid: opposite side of wheel (clash)

## API Routes

### New: POST /api/deezer-search
- Search Deezer catalog by artist + title
- Returns: track metadata + 30s preview MP3 URL
- No auth required (public API)
- Rate limit: respect 429s with backoff

### Modified: POST /api/analyze
- Phase 1: Playlist DNA (unchanged)
- Phase 2: Recommendations now include Camelot key reasoning
- Phase 3: Server-side validation loop — search Deezer for each rec
- Only return tracks with confirmed preview URLs

### Modified: GET /api/soundcloud-search
- Now runs as background enrichment, not blocking
- Results cached and surfaced as "upgrade" option

### Kept: GET /api/beatport
- Still used for BPM/key enrichment
- Falls back gracefully if not configured

## Theme System

### Kill Inline Styles
Replace the `A = { bg, panel, border, ... }` pattern repeated in 15+ files with:
- Tailwind CSS custom theme in `tailwind.config.ts`
- CSS custom properties for dynamic theming
- Dark mode as default (toggle to light)

### Color Tokens
```
--bg-primary: #0a0a0f        (deep dark)
--bg-secondary: #12121a      (panels)
--bg-tertiary: #1a1a2e       (cards)
--border: #2a2a3e             (subtle borders)
--text-primary: #e8e8f0       (main text)
--text-secondary: #8888a0     (muted text)
--accent-primary: #00d4aa     (teal — CrateMate brand)
--accent-secondary: #ff5500   (orange — SoundCloud/energy)
--accent-danger: #ff4444      (errors)
--accent-success: #44ff88     (confirmations)
```

## Component Architecture

### Player (Rewrite)
- `AudioEngine` class: manages HTML5 `<audio>` for Deezer + SC iframe
- Unified controls: play/pause, next/prev, volume, progress bar
- Waveform visualization (Web Audio API analyser node)
- Queue with drag-to-reorder

### Dig Engine (Refactor)
- Split into: `ImportPanel`, `AnalysisPanel`, `ResultsPanel`
- Results show instant-play buttons (Deezer preview)
- Each recommendation card shows: why it fits, Camelot key, BPM, energy

### Crate Table (Enhance)
- Energy flow mini-chart in header
- Camelot key column with color coding
- BPM column with mixing compatibility indicators
- Bulk actions: add all to queue, export

### New: Camelot Wheel View
- Visual wheel showing crate tracks by key
- Highlight compatible transitions
- Suggest next track based on current position

### New: Energy Flow Chart
- Recharts area chart showing energy curve across crate
- Drag tracks to reorder, chart updates in real time
- Target curve templates: "Warm Up", "Peak Hour", "Cool Down"

## Data Types (Consolidated)

```typescript
interface Track {
  id: string
  title: string
  artist: string
  // Metadata
  bpm?: number
  key?: string           // Camelot notation: "8A", "11B"
  energy?: number        // 0.0 - 1.0
  genre?: string
  label?: string
  year?: number
  // Playback
  deezerPreviewUrl?: string
  deezerTrackId?: string
  soundcloudUrl?: string
  soundcloudEmbedUrl?: string
  // Analysis
  gemScore?: number      // 0-100, recommendation quality
  matchReason?: string   // Why this track was recommended
  camelotCompatible?: boolean
  bpmDelta?: number      // Difference from reference track
}
```

## Migration Plan
1. Add Deezer search API route
2. Update analyze route with validation pipeline
3. Rewrite player context for multi-source
4. Update player bar UI
5. Add theme system
6. Refactor dig engine
7. Add Camelot + energy visualizations
8. Clean up stubs
