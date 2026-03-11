"use client";
import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, ExternalLink, Loader2, AlertCircle, Music, RefreshCw } from "lucide-react";
import { searchBeatport, formatKey, beatportUrl, BeatportTrack, getBPToken } from "@/lib/beatport";
import { PlayerTrack } from "@/context/player-context";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

// Cache so we don't re-search on every render
const enrichCache = new Map<string, BeatportTrack | null>();

interface Props {
  track: PlayerTrack;
  onEnriched?: (enriched: Partial<PlayerTrack>) => void;
}

export default function BeatportEnrichment({ track, onEnriched }: Props) {
  const [bpTrack,  setBpTrack]  = useState<BeatportTrack | null>(null);
  const [status,   setStatus]   = useState<"idle" | "loading" | "found" | "notfound" | "noauth">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const search = useCallback(async () => {
    const key = `${track.artist}::${track.title}`;
    if (enrichCache.has(key)) {
      const cached = enrichCache.get(key)!;
      setBpTrack(cached);
      setStatus(cached ? "found" : "notfound");
      return;
    }
    if (!getBPToken()) { setStatus("noauth"); return; }

    setStatus("loading");
    setErrorMsg(null);

    const { track: found, error, setup } = await searchBeatport(track.artist, track.title);

    if (setup) { setStatus("noauth"); return; }
    if (error && !found) {
      setStatus("notfound");
      setErrorMsg(error);
      enrichCache.set(key, null);
      return;
    }

    enrichCache.set(key, found);
    setBpTrack(found);
    setStatus(found ? "found" : "notfound");

    // Bubble enriched data up so parent can update track metadata
    if (found && onEnriched) {
      onEnriched({
        bpm:   found.bpm   ?? track.bpm,
        key:   found.key   ? formatKey(found.key) : track.key,
        label: found.label?.name ?? track.label,
      });
    }
  }, [track.artist, track.title]);

  useEffect(() => { search(); }, [search]);

  // ── No auth ──────────────────────────────────────────────────────────────
  if (status === "noauth") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 8, backgroundColor: "#fff7ed", border: "1px solid #fed7aa", flexShrink: 0 }}>
        <AlertCircle size={11} color="#f97316" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#ea580c" }}>
          Beatport not connected.
        </span>
        <a href="/settings" style={{ fontSize: 11, fontWeight: 600, color: "#f97316", textDecoration: "none" }}>Setup →</a>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading" || status === "idle") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, backgroundColor: "#fafafa", border: `1px solid ${A.border}`, flexShrink: 0 }}>
        <Loader2 size={11} color={A.t5} style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: A.t5 }}>Searching Beatport…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (status === "notfound") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <a href={`https://www.beatport.com/search?q=${encodeURIComponent(track.artist + " " + track.title)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, backgroundColor: "#fafafa", border: `1px solid ${A.border}`, textDecoration: "none", fontSize: 11, color: A.t4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
          Search Beatport
          <ExternalLink size={10} />
        </a>
      </div>
    );
  }

  // ── Found ────────────────────────────────────────────────────────────────
  if (!bpTrack) return null;
  const bpUrl   = beatportUrl(bpTrack);
  const keyStr  = bpTrack.key ? formatKey(bpTrack.key) : null;
  const camelot = bpTrack.key ? `${bpTrack.key.camelot_number}${bpTrack.key.camelot_letter}` : null;
  const label   = bpTrack.label?.name;
  const catNum  = bpTrack.release?.catalog_number;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
      {/* Enriched metadata chips */}
      {bpTrack.bpm && (
        <Chip label={`${bpTrack.bpm} BPM`} mono />
      )}
      {camelot && (
        <Chip label={camelot} mono accent />
      )}
      {label && (
        <Chip label={label} />
      )}
      {catNum && (
        <Chip label={catNum} mono />
      )}

      {/* Buy on Beatport CTA */}
      <a href={bpUrl} target="_blank" rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 10px", borderRadius: 8,
          backgroundColor: "#04BE5B18", border: "1px solid #04BE5B40",
          textDecoration: "none", fontSize: 11, fontWeight: 600, color: "#059669",
          whiteSpace: "nowrap", flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#04BE5B28"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#04BE5B18"; }}
      >
        <ShoppingCart size={11} />
        Buy on Beatport
        <ExternalLink size={9} />
      </a>
    </div>
  );
}

function Chip({ label, mono, accent }: { label: string; mono?: boolean; accent?: boolean }) {
  return (
    <span style={{
      padding: "3px 7px", borderRadius: 5, fontSize: 10, whiteSpace: "nowrap",
      fontFamily: mono ? "monospace" : "inherit",
      backgroundColor: accent ? A.accentBg : "#f1f5f9",
      border: `1px solid ${accent ? A.accentBorder : A.border}`,
      color: accent ? A.accent : A.t4,
    }}>
      {label}
    </span>
  );
}
