"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import type { TrackInput } from "@/app/api/analyze/route";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8",
};

interface Props {
  onTracks: (tracks: TrackInput[], playlistName: string) => void;
}

type Status = "idle" | "loading-widget" | "loading-tracks" | "done" | "error";

declare global {
  interface Window { SC?: any; }
}

function isSoundCloudUrl(url: string) {
  return /soundcloud\.com\/.+/.test(url);
}

export default function SoundCloudImport({ onTracks }: Props) {
  const [url,    setUrl]    = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error,  setError]  = useState<string | null>(null);
  const [count,  setCount]  = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  // Inject SC Widget script once
  useEffect(() => {
    if (document.getElementById("sc-widget-script")) return;
    const s = document.createElement("script");
    s.id  = "sc-widget-script";
    s.src = "https://w.soundcloud.com/player/api.js";
    document.head.appendChild(s);
  }, []);

  const handleImport = async () => {
    if (!isSoundCloudUrl(url)) {
      setError("Please enter a valid SoundCloud playlist or set URL.");
      return;
    }
    setError(null);
    setStatus("loading-widget");
    setCount(0);
  };

  // When iframe src is set, wait for SC widget to be ready
  useEffect(() => {
    if (status !== "loading-widget" || !iframeRef.current) return;

    let attempts = 0;
    const interval = setInterval(() => {
      if (!window.SC || !iframeRef.current) {
        if (++attempts > 40) { // 10s timeout
          clearInterval(interval);
          setStatus("error");
          setError("SoundCloud widget failed to load. Check the URL and try again.");
        }
        return;
      }

      clearInterval(interval);
      setStatus("loading-tracks");

      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.getSounds((sounds: any[]) => {
          if (!sounds?.length) {
            setStatus("error");
            setError("No tracks found. The playlist may be private or empty.");
            return;
          }

          const tracks: TrackInput[] = sounds.map((s: any) => ({
            artist: s.user?.username || s.publisher_metadata?.artist || "Unknown",
            title:  s.title?.replace(/ - .*$/, "") || "Unknown", // strip " - Artist" suffixes
            label:  s.label_name || s.publisher_metadata?.release_title || undefined,
            year:   s.created_at ? new Date(s.created_at).getFullYear() : undefined,
            bpm:    s.bpm || undefined,
          }));

          setCount(tracks.length);
          setStatus("done");

          // Get playlist title
          widget.getCurrentSound((current: any) => {
            const name = current?.playlist_title || "SoundCloud Playlist";
            onTracks(tracks, name);
          });
        });
      });

      widget.bind(window.SC.Widget.Events.ERROR, () => {
        setStatus("error");
        setError("SoundCloud couldn't load this URL. Make sure it's a public playlist or set.");
      });
    }, 250);

    return () => clearInterval(interval);
  }, [status]);

  const iframeSrc = status === "loading-widget" || status === "loading-tracks" || status === "done"
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false`
    : "";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: error ? 8 : 0 }}>
        <input
          value={url}
          onChange={e => { setUrl(e.target.value); setError(null); }}
          onKeyDown={e => e.key === "Enter" && url && handleImport()}
          placeholder="https://soundcloud.com/artist/sets/playlist-name"
          style={{
            flex: 1, height: 42, padding: "0 14px", borderRadius: 9,
            border: `1.5px solid ${error ? "#fca5a5" : A.border}`,
            fontSize: 13, color: A.t1, fontFamily: "inherit",
            outline: "none", backgroundColor: "#fafafa",
          }}
        />
        <button
          onClick={handleImport}
          disabled={!url || status === "loading-widget" || status === "loading-tracks"}
          style={{
            padding: "0 20px", borderRadius: 9, border: "none",
            backgroundColor: status === "done" ? "#16a34a" : url ? "#FF5500" : "#e2e8f0",
            color: url ? "#fff" : A.t5,
            fontSize: 13, fontWeight: 600, cursor: url ? "pointer" : "not-allowed",
            fontFamily: "inherit", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 8,
          }}>
          {status === "loading-widget" || status === "loading-tracks"
            ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Loading…</>
            : status === "done"
            ? <><Check size={14} /> {count} tracks</>
            : "Import"}
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", gap: 7, padding: "9px 12px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", marginBottom: 4 }}>
          <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      {(status === "loading-widget" || status === "loading-tracks") && (
        <p style={{ fontSize: 11, color: A.t5, marginTop: 6 }}>
          {status === "loading-widget" ? "Connecting to SoundCloud…" : "Reading track list…"}
        </p>
      )}

      {/* Hidden SC widget iframe */}
      {iframeSrc && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          style={{ display: "none" }}
          allow="autoplay"
        />
      )}

    </div>
  );
}
