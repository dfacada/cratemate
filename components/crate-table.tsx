"use client";

import { useState } from "react";
import {
  Trash2,
  Download,
  ListMusic,
  ArrowUpDown,
  Music2,
  PlayCircle,
  MoreVertical,
} from "lucide-react";
import type { CrateTrack } from "@/lib/crates";
import type { Track } from "@/types/track";
import { mockTracks } from "@/data/mockTracks";
import PlayButton from "@/components/play-button";
import { usePlayer, type PlayerTrack } from "@/context/player-context";
import { getCamelotColor } from "@/lib/theme";

type SortKey = "artist" | "bpm" | "key" | "title" | "energy";

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

interface TableRow {
  id: string;
  artist: string;
  title: string;
  label?: string;
  bpm?: number;
  key?: string;
  energy?: number;
  year?: number;
  genre?: string;
  source: string;
  duration?: number; // in seconds
}

export default function CrateTable({
  crateTracks,
  crateName,
  onRemoveTrack,
  tracks,
  onBuildSet,
  onExport,
}: CrateTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { playAll } = usePlayer();

  // Normalize: if crateTracks provided, map them to displayable rows; else fall back to legacy
  const rows: TableRow[] = crateTracks
    ? crateTracks.map((t, i) => ({
        id: `ct-${i}`,
        artist: t.artist,
        title: t.title,
        label: t.label,
        bpm: t.bpm,
        key: t.key,
        energy: t.energy,
        year: t.year,
        genre: t.genre,
        source: t.source === "original" ? "original" : "recommended",
        duration: t.duration,
      }))
    : (tracks || mockTracks.slice(0, 8)).map((t) => ({
        id: t.id,
        artist: t.artist,
        title: t.title,
        label: t.label,
        bpm: t.bpm,
        key: t.key,
        energy: t.energy,
        year: t.year,
        genre: Array.isArray(t.genre) ? t.genre.join(", ") : t.genre,
        source: t.source?.replace(/_/g, " ") || "",
        duration: undefined,
      }));

  // Sorting
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];

    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }

    return sortDir === "asc"
      ? String(av ?? "").localeCompare(String(bv ?? ""))
      : String(bv ?? "").localeCompare(String(av ?? ""));
  });

  // Stats
  const bpms = rows.filter((r) => r.bpm).map((r) => r.bpm!);
  const avgBpm = bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 0;
  const totalDuration =
    rows.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;

  // Format duration MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Empty state
  if (rows.length === 0) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-secondary)",
          padding: "36px 24px",
          textAlign: "center",
        }}
      >
        <Music2
          size={32}
          style={{
            color: "var(--text-muted)",
            marginBottom: 12,
            opacity: 0.5,
          }}
        />
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          No tracks yet. Start a New Dig to find tracks.
        </p>
      </div>
    );
  }

  // Table styles
  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border)",
    backgroundColor: "var(--bg-tertiary)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 13,
    borderBottom: "1px solid var(--border-subtle)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header with stats and controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "var(--text-secondary)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Music2 size={13} color="var(--accent-primary)" />
            <b style={{ color: "var(--text-primary)" }}>{rows.length}</b> tracks
          </span>
          {avgBpm > 0 && (
            <span>
              Avg <b style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{avgBpm}</b> BPM
            </span>
          )}
          {totalDuration > 0 && (
            <span>
              <b style={{ color: "var(--text-primary)" }}>
                {Math.round(totalDuration)}
              </b>{" "}
              min
            </span>
          )}
          {crateName && (
            <span style={{ color: "var(--text-muted)" }}>
              in <b style={{ color: "var(--text-primary)" }}>{crateName}</b>
            </span>
          )}
        </div>

        {/* Control buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {rows.length > 0 && (
            <button
              onClick={() => {
                const playerTracks: PlayerTrack[] = sorted.map((r) => ({
                  id: r.id,
                  artist: r.artist,
                  title: r.title,
                  label: r.label,
                  bpm: r.bpm,
                  key: r.key,
                  energy: r.energy,
                }));
                playAll(playerTracks);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "var(--accent-primary)",
                fontSize: 12,
                color: "#ffffff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <PlayCircle size={12} /> Play All
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                fontSize: 12,
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Download size={12} /> Export
            </button>
          )}
          {onBuildSet && (
            <button
              onClick={onBuildSet}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "var(--accent-primary)",
                fontSize: 12,
                color: "#ffffff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <ListMusic size={12} /> Build Set
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-secondary)",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {/* # column */}
              <th style={{ ...thStyle, width: 36 }}></th>

              {/* Play button column */}
              <th style={{ ...thStyle, width: 32 }}></th>

              {/* Artist */}
              <th
                style={{
                  ...thStyle,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleSort("artist")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                Artist{" "}
                <ArrowUpDown
                  size={10}
                  style={{
                    display: "inline",
                    marginLeft: 4,
                    opacity: sortKey === "artist" ? 1 : 0.5,
                  }}
                />
              </th>

              {/* Title */}
              <th
                style={{
                  ...thStyle,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleSort("title")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                Title{" "}
                <ArrowUpDown
                  size={10}
                  style={{
                    display: "inline",
                    marginLeft: 4,
                    opacity: sortKey === "title" ? 1 : 0.5,
                  }}
                />
              </th>

              {/* Key */}
              <th
                style={{
                  ...thStyle,
                  width: 60,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleSort("key")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                Key{" "}
                <ArrowUpDown
                  size={10}
                  style={{
                    display: "inline",
                    marginLeft: 4,
                    opacity: sortKey === "key" ? 1 : 0.5,
                  }}
                />
              </th>

              {/* BPM */}
              <th
                style={{
                  ...thStyle,
                  width: 60,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleSort("bpm")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                BPM{" "}
                <ArrowUpDown
                  size={10}
                  style={{
                    display: "inline",
                    marginLeft: 4,
                    opacity: sortKey === "bpm" ? 1 : 0.5,
                  }}
                />
              </th>

              {/* Energy */}
              <th
                style={{
                  ...thStyle,
                  width: 80,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleSort("energy")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                Energy{" "}
                <ArrowUpDown
                  size={10}
                  style={{
                    display: "inline",
                    marginLeft: 4,
                    opacity: sortKey === "energy" ? 1 : 0.5,
                  }}
                />
              </th>

              {/* Label */}
              <th style={{ ...thStyle }}>Label</th>

              {/* Duration */}
              <th style={{ ...thStyle, width: 60 }}>Duration</th>

              {/* Source tag */}
              <th style={{ ...thStyle, width: 80 }}>Source</th>

              {/* Actions */}
              <th style={{ ...thStyle, width: 32 }}></th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((row, i) => {
              const origIndex = rows.findIndex((r) => r.id === row.id);

              return (
                <tr
                  key={row.id}
                  style={{
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Row number */}
                  <td
                    style={{
                      ...tdStyle,
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                      fontSize: 11,
                      textAlign: "right",
                    }}
                  >
                    {i + 1}
                  </td>

                  {/* Play button */}
                  <td style={{ ...tdStyle, paddingLeft: 8, paddingRight: 4 }}>
                    <PlayButton
                      track={{
                        id: row.id,
                        artist: row.artist,
                        title: row.title,
                        label: row.label,
                        bpm: row.bpm,
                        key: row.key,
                        energy: row.energy,
                      }}
                      queueTracks={sorted.map((r) => ({
                        id: r.id,
                        artist: r.artist,
                        title: r.title,
                        label: r.label,
                        bpm: r.bpm,
                        key: r.key,
                        energy: r.energy,
                      }))}
                      queueIndex={i}
                      size="sm"
                      variant="ghost"
                    />
                  </td>

                  {/* Artist */}
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.artist}
                  </td>

                  {/* Title */}
                  <td
                    style={{
                      ...tdStyle,
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.title}
                    {row.year && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)" }}>
                        {row.year}
                      </span>
                    )}
                  </td>

                  {/* Key badge */}
                  <td style={tdStyle}>
                    {row.key ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: 5,
                          fontFamily: "monospace",
                          fontSize: 10,
                          fontWeight: 700,
                          color: getCamelotColor(row.key),
                          backgroundColor: getCamelotColor(row.key) + "22",
                        }}
                      >
                        {row.key}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* BPM */}
                  <td
                    style={{
                      ...tdStyle,
                      fontFamily: "monospace",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.bpm || "—"}
                  </td>

                  {/* Energy bar */}
                  <td style={tdStyle}>
                    {row.energy !== undefined && row.energy > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 20,
                            backgroundColor: "var(--bg-tertiary)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 20,
                              background:
                                "linear-gradient(to right, var(--accent-primary), var(--accent-secondary))",
                              width: `${Math.min(row.energy, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "monospace",
                            minWidth: 20,
                            textAlign: "right",
                          }}
                        >
                          {Math.round(row.energy)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Label */}
                  <td
                    style={{
                      ...tdStyle,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label || "—"}
                  </td>

                  {/* Duration */}
                  <td
                    style={{
                      ...tdStyle,
                      fontFamily: "monospace",
                      color: "var(--text-muted)",
                      fontSize: 11,
                    }}
                  >
                    {formatDuration(row.duration)}
                  </td>

                  {/* Source badge */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 7px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: row.source === "recommended" ? 600 : 400,
                        backgroundColor:
                          row.source === "recommended"
                            ? "rgba(0, 212, 170, 0.09)"
                            : "var(--bg-tertiary)",
                        color:
                          row.source === "recommended"
                            ? "var(--accent-primary)"
                            : "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.source}
                    </span>
                  </td>

                  {/* Delete button */}
                  <td style={tdStyle}>
                    {onRemoveTrack && (
                      <button
                        onClick={() => onRemoveTrack(origIndex)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 5,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                          color: "var(--text-muted)",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 68, 68, 0.1)";
                          e.currentTarget.style.color = "var(--accent-danger)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
