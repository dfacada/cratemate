"use client";
import { useState } from "react";
import { Trash2, Download, ListMusic, ArrowUpDown, Music2, PlayCircle } from "lucide-react";
import { type CrateTrack } from "@/lib/crates";
import { mockTracks } from "@/data/mockTracks";
import { Track } from "@/types/track";
import PlayButton from "@/components/play-button";
import { usePlayer, PlayerTrack } from "@/context/player-context";

const KEY_COLORS: Record<string, string> = {
  "1A": "#FF6B6B", "2A": "#FF8E53", "3A": "#FFC300", "4A": "#C5E336", "5A": "#6BCB77", "6A": "#4D96FF",
  "7A": "#9B72CF", "8A": "#FF6B9D", "9A": "#56CFE1", "10A": "#FF9A3C", "11A": "#80F2A6", "12A": "#FFD6A5",
  "1B": "#FF4040", "2B": "#FF6B2B", "3B": "#FFA500", "4B": "#A8E063", "5B": "#2ECC40", "6B": "#0074D9",
  "7B": "#7B2FBE", "8B": "#FF2D6C", "9B": "#17B8D1", "10B": "#E07B00", "11B": "#4ADE80", "12B": "#FCC89B",
};

type SortKey = "artist" | "bpm" | "key" | "title";

const A = { panel: "#fff", border: "#e2e8f0", t1: "#0f172a", t4: "#64748b", t5: "#94a3b8", accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)" };

interface CrateTableProps {
  /** Real crate tracks from localStorage — if provided, takes priority */
  crateTracks?: CrateTrack[];
  crateName?: string;
  onRemoveTrack?: (index: number) => void;
  /** Legacy: mock Track[] for backward compat */
  tracks?: Track[];
  onBuildSet?: () => void;
  onExport?: () => void;
}

export default function CrateTable({ crateTracks, crateName, onRemoveTrack, tracks, onBuildSet, onExport }: CrateTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { playAll, queue } = usePlayer();

  // Normalize: if crateTracks provided, map them to displayable rows; else fall back to legacy tracks prop
  const rows: {
    id: string; artist: string; title: string; label?: string; bpm?: number;
    key?: string; year?: number; genre?: string; source: string;
  }[] = crateTracks
    ? crateTracks.map((t, i) => ({
        id: `ct-${i}`, artist: t.artist, title: t.title, label: t.label,
        bpm: t.bpm, key: t.key, year: t.year, genre: t.genre,
        source: t.source === "original" ? "original" : "rec",
      }))
    : (tracks || mockTracks.slice(0, 8)).map(t => ({
        id: t.id, artist: t.artist, title: t.title, label: t.label,
        bpm: t.bpm, key: t.key, year: t.year, genre: t.genre?.join(", "),
        source: t.source?.replace(/_/g, " ") || "",
      }));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc" ? String(av ?? "").localeCompare(String(bv ?? "")) : String(bv ?? "").localeCompare(String(av ?? ""));
  });

  const bpms = rows.filter(r => r.bpm).map(r => r.bpm!);
  const avgBpm = bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 0;

  const thStyle = {
    padding: "10px 14px", textAlign: "left" as const, fontSize: 10, fontWeight: 600,
    letterSpacing: "0.07em", textTransform: "uppercase" as const, color: A.t5,
    borderBottom: `1px solid ${A.border}`, backgroundColor: "#f8fafc",
  };
  const tdStyle = {
    padding: "9px 14px", fontSize: 13, borderBottom: "1px solid #f8fafc", verticalAlign: "middle" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stats bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: A.t4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Music2 size={13} color={A.accent} />
            <b style={{ color: A.t1 }}>{rows.length}</b> tracks
          </span>
          {avgBpm > 0 && <span>Avg BPM: <b style={{ color: A.t1, fontFamily: "monospace" }}>{avgBpm}</b></span>}
          {crateName && <span style={{ color: A.t5 }}>in <b style={{ color: A.t1 }}>{crateName}</b></span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {rows.length > 0 && (
            <button
              onClick={() => {
                const playerTracks: PlayerTrack[] = rows.map(r => ({
                  id: r.id, artist: r.artist, title: r.title,
                  label: r.label, bpm: r.bpm, key: r.key,
                }));
                playAll(playerTracks);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                border: "none", backgroundColor: "#FF5500", fontSize: 12, color: "#fff",
                cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              }}
            >
              <PlayCircle size={12} /> Play All
            </button>
          )}
          <button onClick={onExport} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            border: `1px solid ${A.border}`, backgroundColor: "#fff", fontSize: 12, color: A.t4,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <Download size={12} /> Export
          </button>
          <button onClick={onBuildSet} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            border: "none", backgroundColor: A.accent, fontSize: 12, color: "#fff",
            cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}>
            <ListMusic size={12} /> Build Set
          </button>
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{
          borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel,
          padding: "36px 24px", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: A.t4 }}>This crate has no tracks yet.</p>
        </div>
      ) : (
        <div style={{
          borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel,
          overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 36 }}></th>
                <th style={{ ...thStyle, width: 30 }}></th>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => toggleSort("artist")}>
                  Artist <ArrowUpDown size={10} style={{ display: "inline", marginLeft: 2 }} />
                </th>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => toggleSort("title")}>
                  Track <ArrowUpDown size={10} style={{ display: "inline", marginLeft: 2 }} />
                </th>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => toggleSort("bpm")}>
                  BPM <ArrowUpDown size={10} style={{ display: "inline", marginLeft: 2 }} />
                </th>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => toggleSort("key")}>
                  Key <ArrowUpDown size={10} style={{ display: "inline", marginLeft: 2 }} />
                </th>
                <th style={thStyle}>Label</th>
                <th style={thStyle}>Source</th>
                <th style={{ ...thStyle, width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                // Find original index for removal (pre-sort)
                const origIndex = rows.findIndex(r => r.id === row.id);
                return (
                  <tr
                    key={row.id}
                    style={{ transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ ...tdStyle, color: A.t5, fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ ...tdStyle, paddingLeft: 8, paddingRight: 0 }}>
                      <PlayButton
                        track={{ id: row.id, artist: row.artist, title: row.title, label: row.label, bpm: row.bpm, key: row.key }}
                        queueTracks={sorted.map(r => ({ id: r.id, artist: r.artist, title: r.title, label: r.label, bpm: r.bpm, key: r.key }))}
                        queueIndex={i}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: A.t1 }}>{row.artist}</td>
                    <td style={tdStyle}>
                      <span style={{ color: "#475569" }}>{row.title}</span>
                      {row.year && <span style={{ marginLeft: 8, fontSize: 11, color: A.t5 }}>{row.year}</span>}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", color: A.t4 }}>{row.bpm || "—"}</td>
                    <td style={tdStyle}>
                      {row.key ? (
                        <span style={{
                          padding: "2px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: 10,
                          fontWeight: 700, color: KEY_COLORS[row.key] ?? "#888",
                          backgroundColor: (KEY_COLORS[row.key] ?? "#888") + "22",
                        }}>
                          {row.key}
                        </span>
                      ) : <span style={{ color: A.t5 }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: A.t4 }}>{row.label || "—"}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 7px", borderRadius: 20, backgroundColor: row.source === "rec" ? A.accentBg : "#f1f5f9",
                        fontSize: 10, color: row.source === "rec" ? A.accent : A.t4,
                        fontWeight: row.source === "rec" ? 600 : 400,
                      }}>
                        {row.source}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => onRemoveTrack?.(origIndex)}
                        style={{
                          width: 22, height: 22, borderRadius: 5, border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: "transparent", color: "#cbd5e1",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#cbd5e1"; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
