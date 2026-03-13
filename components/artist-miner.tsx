"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, ArrowUpDown, Gem, Loader2 } from "lucide-react";
import { cn, gemScoreColor } from "@/lib/utils";
import { mockArtists, mockCatalogEntries } from "@/data/mockArtists";
import { ArtistCatalogEntry } from "@/types/artist";
import PlayButton from "@/components/play-button";

type FilterMode = "all" | "originals" | "remixes" | "collaborations" | "hidden_gems";
const FILTERS: { label: string; value: FilterMode }[] = [
  { label: "All", value: "all" }, { label: "Originals", value: "originals" },
  { label: "Remixes", value: "remixes" }, { label: "Collaborations", value: "collaborations" },
  { label: "Hidden Gems", value: "hidden_gems" },
];

const cssVars = {
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  accentPrimary: "var(--accent-primary)",
  border: "var(--border)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
};

export default function ArtistMiner({ defaultArtistId = "a001", onAddToCrate }: {
  defaultArtistId?: string; onAddToCrate?: (e: ArtistCatalogEntry) => void;
}) {
  const [selectedArtistId, setSelectedArtistId] = useState(defaultArtistId);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortDesc, setSortDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ArtistCatalogEntry[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const artist = mockArtists.find((a) => a.id === selectedArtistId);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let result = mockCatalogEntries.filter((e) => e.artistId === selectedArtistId);
      if (filter === "originals") result = result.filter((e) => !e.isRemix && !e.isCollaboration);
      if (filter === "remixes") result = result.filter((e) => e.isRemix);
      if (filter === "collaborations") result = result.filter((e) => e.isCollaboration);
      if (filter === "hidden_gems") result = result.filter((e) => e.gemScore >= 85);
      result = [...result].sort((a, b) => sortDesc ? b.year - a.year : a.year - b.year);
      setEntries(result);
      setLoading(false);
    }, 400);
  }, [selectedArtistId, filter, sortDesc]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Artist pills */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
        {mockArtists.slice(0, 4).map((a) => (
          <button key={a.id} onClick={() => setSelectedArtistId(a.id)}
            style={{
              borderRadius: "9999px", padding: "6px 12px", fontSize: "12px", fontWeight: 500, transition: "all 0.15s", border: "none", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: selectedArtistId === a.id ? cssVars.accentPrimary : cssVars.border,
              color: selectedArtistId === a.id ? "#fff" : cssVars.textSecondary,
              boxShadow: selectedArtistId === a.id ? "0 2px 8px rgba(0,212,170,0.3)" : "none"
            }}>{a.name}</button>
        ))}
      </div>

      {/* Artist info card */}
      {artist && (
        <div style={{ borderRadius: "12px", border: `1px solid ${cssVars.border}`, backgroundColor: cssVars.bgSecondary, padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: cssVars.textPrimary }}>{artist.name}</h3>
              <p style={{ fontSize: "12px", color: cssVars.textSecondary }}>{artist.origin} · Active since {artist.activeFrom}{artist.activeTo ? `–${artist.activeTo}` : ""}</p>
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {artist.genres.map((g) => (
                  <span key={g} style={{ borderRadius: "9999px", backgroundColor: cssVars.bgHover, padding: "4px 8px", fontSize: "10px", color: cssVars.textSecondary }}>{g}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "28px", fontWeight: 700, color: cssVars.textPrimary }}>{artist.trackCount}</p>
              <p style={{ fontSize: "10px", color: cssVars.textMuted }}>tracks</p>
              <p style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700, color: cssVars.accentPrimary }}>{artist.gemTracks}</p>
              <p style={{ fontSize: "10px", color: cssVars.textMuted }}>gems</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter + sort bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", transition: "all 0.15s", border: "none", cursor: "pointer", fontFamily: "inherit",
                backgroundColor: filter === f.value ? cssVars.bgTertiary : "transparent",
                color: filter === f.value ? cssVars.textPrimary : cssVars.textSecondary
              }}>
              {f.value === "hidden_gems" && <Gem style={{ height: "12px", width: "12px" }} />}{f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setSortDesc((d) => !d)}
          style={{
            display: "flex", alignItems: "center", gap: "6px", borderRadius: "8px", border: `1px solid ${cssVars.border}`, backgroundColor: cssVars.bgSecondary, padding: "6px 12px", fontSize: "12px", color: cssVars.textSecondary, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", transition: "all 0.15s", cursor: "pointer", fontFamily: "inherit"
          }}>
          <ArrowUpDown style={{ height: "12px", width: "12px" }} />{sortDesc ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Catalog table */}
      <div style={{ overflow: "hidden", borderRadius: "12px", border: `1px solid ${cssVars.border}`, backgroundColor: cssVars.bgSecondary, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display: "flex", height: "160px", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ height: "20px", width: "20px", animation: "spin 0.7s linear infinite", color: cssVars.accentPrimary }} /></div>
        ) : entries.length === 0 ? (
          <div style={{ display: "flex", height: "160px", alignItems: "center", justifyContent: "center", fontSize: "14px", color: cssVars.textMuted }}>No tracks found</div>
        ) : (
          <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${cssVars.border}`, backgroundColor: cssVars.bgHover }}>
                <th style={{ width: "40px", padding: "12px 16px" }} />
                {["Year", "Track", "Label", "Cat#", "BPM", "Gem Score", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: cssVars.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderTop: `1px solid ${cssVars.border}` }}>
              {entries.map((entry) => {
                const isAdded = addedIds.has(entry.id);
                const artistName = artist?.name ?? "";
                return (
                  <tr key={entry.id} style={{ borderBottom: `1px solid ${cssVars.border}`, transition: "background-color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cssVars.bgHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <td style={{ padding: "10px 16px" }}>
                      <PlayButton track={{ id: entry.id, artist: artistName, title: entry.title, label: entry.label, bpm: entry.bpm, energy: entry.energy }} />
                    </td>
                    <td style={{ width: "56px", padding: "10px 16px", fontFamily: "monospace", fontSize: "12px", color: cssVars.textMuted }}>{entry.year}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 500, color: cssVars.textPrimary }}>{entry.title}</span>
                        {entry.isRemix && <span style={{ borderRadius: "4px", backgroundColor: "rgba(168,85,247,0.1)", padding: "2px 6px", fontSize: "9px", fontWeight: 500, color: "#a855f7" }}>REMIX</span>}
                        {entry.isCollaboration && <span style={{ borderRadius: "4px", backgroundColor: "rgba(59,130,246,0.1)", padding: "2px 6px", fontSize: "9px", fontWeight: 500, color: "#3b82f6" }}>COLLAB</span>}
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: cssVars.textSecondary }}>{entry.label}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: "12px", color: cssVars.textMuted }}>{entry.catalogNumber ?? "—"}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: "12px", color: cssVars.textSecondary }}>{entry.bpm ?? "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ height: "6px", width: "48px", overflow: "hidden", borderRadius: "9999px", backgroundColor: cssVars.bgHover }}>
                          <div style={{ height: "100%", borderRadius: "9999px", background: "linear-gradient(to right, #00d4aa, #00d4aa)", width: `${entry.gemScore}%` }} />
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: cssVars.accentPrimary }}>{entry.gemScore}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", opacity: 0, transition: "opacity 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}>
                        <button onClick={() => { setAddedIds((p) => new Set([...p, entry.id])); onAddToCrate?.(entry); }} disabled={isAdded}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 500, transition: "all 0.15s", border: "none", cursor: "pointer", fontFamily: "inherit",
                            backgroundColor: isAdded ? "rgba(0,212,170,0.1)" : cssVars.bgHover,
                            color: isAdded ? cssVars.accentPrimary : cssVars.textSecondary
                          }}>
                          <Plus style={{ height: "12px", width: "12px" }} />{isAdded ? "Added" : "Add"}
                        </button>
                        <button style={{ display: "flex", height: "24px", width: "24px", alignItems: "center", justifyContent: "center", borderRadius: "4px", border: "none", background: "none", color: cssVars.textMuted, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cssVars.bgHover; e.currentTarget.style.color = cssVars.textSecondary; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = cssVars.textMuted; }}>
                          <ExternalLink style={{ height: "12px", width: "12px" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
