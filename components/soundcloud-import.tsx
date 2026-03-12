"use client";
import { useState } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import type { TrackInput } from "@/app/api/analyze/route";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8",
};

interface Props {
  onTracks: (tracks: TrackInput[], playlistName: string) => void;
}

type Status = "idle" | "loading" | "done" | "error";

function isSoundCloudUrl(url: string) {
  return /soundcloud\.com\/.+/.test(url);
}

export default function SoundCloudImport({ onTracks }: Props) {
  const [url,    setUrl]    = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error,  setError]  = useState<string | null>(null);
  const [count,  setCount]  = useState(0);

  const handleImport = async () => {
    if (!isSoundCloudUrl(url)) {
      setError("Please enter a valid SoundCloud playlist or set URL.");
      return;
    }
    setError(null);
    setStatus("loading");
    setCount(0);

    try {
      const res = await fetch(
        `/api/soundcloud-resolve?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Failed to load playlist.");
        return;
      }

      if (!data.tracks?.length) {
        setStatus("error");
        setError("No tracks found. The playlist may be private or empty.");
        return;
      }

      // Map to TrackInput format expected by the analyze API
      const tracks: TrackInput[] = data.tracks.map((t: any) => ({
        artist: t.artist,
        title:  t.title,
        label:  t.label || undefined,
        year:   t.year || undefined,
        bpm:    t.bpm || undefined,
      }));

      setCount(tracks.length);
      setStatus("done");

      // Notify about partial tracks if some couldn't be resolved
      const playlistName = data.playlistName || "SoundCloud Playlist";
      if (data.partialTracks) {
        console.warn(
          `${data.partialTracks} tracks in the playlist had incomplete data and were skipped.`
        );
      }

      onTracks(tracks, playlistName);
    } catch (err) {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  };

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
          disabled={!url || status === "loading"}
          style={{
            padding: "0 20px", borderRadius: 9, border: "none",
            backgroundColor: status === "done" ? "#16a34a" : url ? "#FF5500" : "#e2e8f0",
            color: url ? "#fff" : A.t5,
            fontSize: 13, fontWeight: 600, cursor: url ? "pointer" : "not-allowed",
            fontFamily: "inherit", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 8,
          }}>
          {status === "loading"
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

      {status === "loading" && (
        <p style={{ fontSize: 11, color: A.t5, marginTop: 6 }}>
          Fetching playlist from SoundCloud…
        </p>
      )}
    </div>
  );
}
