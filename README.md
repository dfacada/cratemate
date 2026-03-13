# CrateMate 🎛️

> AI-powered crate digging tool for DJs — discover tracks, mine artist catalogs, and build DJ sets.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 → redirects to /dashboard.

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Recharts, Radix UI, Lucide React, Framer Motion

## Pages
- /dashboard — Stats, recent finds, active crate
- /new-dig — Paste link, upload screenshot, paste tracklist, or mine artist
- /crate — Manage crates and tracks  
- /set-builder — Visual DJ set arrangement by phase
- /artists — Browse artists + catalog miner
- /labels — Label roster explorer
- /radar — Underground signal detection feed

## AI Stubs
All AI integrations in lib/ are stubbed with realistic delays.
Replace stub fetches with real API calls (OCR, Spotify, Discogs, etc.)

## Database
Types/ folder is schema-ready for Supabase/Postgres.
