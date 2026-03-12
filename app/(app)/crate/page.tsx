"use client";
import { useState, useEffect, useCallback } from "react";
import { Archive, Plus, Trash2, Pencil, Check, X, Music2, Clock, ChevronRight } from "lucide-react";
import { getCrates, saveCrate, deleteCrate, type Crate } from "@/lib/crates";
import CrateTable from "@/components/crate-table";

const A = {
  bg: "#F0F4F8", panel: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t2: "#1e293b", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function CratePage() {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const reload = useCallback(() => {
    const all = getCrates();
    setCrates(all);
    return all;
  }, []);

  useEffect(() => {
    const all = reload();
    if (all.length > 0 && !selectedId) setSelectedId(all[0].id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = crates.find(c => c.id === selectedId) || null;

  const handleRename = (crate: Crate) => {
    if (!editName.trim()) return;
    saveCrate({ ...crate, name: editName.trim() });
    setEditingId(null);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteCrate(id);
    setConfirmDeleteId(null);
    const all = reload();
    if (selectedId === id) setSelectedId(all.length > 0 ? all[0].id : null);
  };

  const handleRemoveTrack = (crateId: string, trackIndex: number) => {
    const crate = crates.find(c => c.id === crateId);
    if (!crate) return;
    saveCrate({ ...crate, tracks: crate.tracks.filter((_, i) => i !== trackIndex) });
    reload();
  };

  // Empty state
  if (crates.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>Crates</h1>
          <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>Your saved tracks and active crate sessions.</p>
        </div>
        <div style={{
          borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel,
          padding: "48px 24px", textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, backgroundColor: A.accentBg,
            border: `1px solid ${A.accentBorder}`, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Archive size={20} color={A.accent} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: A.t1 }}>No crates yet</p>
          <p style={{ fontSize: 13, color: A.t4, marginTop: 6, maxWidth: 320, margin: "6px auto 0" }}>
            Start a New Dig to analyze a playlist and save your first crate.
          </p>
          <a
            href="/new-dig"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 20, padding: "8px 16px", borderRadius: 8,
              backgroundColor: A.accent, color: "#fff", fontSize: 13,
              fontWeight: 500, textDecoration: "none", fontFamily: "inherit",
            }}
          >
            <Plus size={14} /> New Dig
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>Crates</h1>
        <p style={{ fontSize: 13, color: A.t4, marginTop: 4 }}>Your saved tracks and active crate sessions.</p>
      </div>

      {/* Crate list */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 260, flexShrink: 0, borderRadius: 12, border: `1px solid ${A.border}`,
          backgroundColor: A.panel, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            padding: "12px 14px", borderBottom: `1px solid ${A.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: A.t5 }}>
              {crates.length} crate{crates.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {crates.map(crate => {
              const isSelected = crate.id === selectedId;
              const isEditing = crate.id === editingId;
              const isDeleting = crate.id === confirmDeleteId;
              const originals = crate.tracks.filter(t => t.source === "original").length;
              const added = crate.tracks.filter(t => t.source === "added").length;

              return (
                <div
                  key={crate.id}
                  onClick={() => { if (!isEditing && !isDeleting) setSelectedId(crate.id); }}
                  style={{
                    padding: "10px 14px", cursor: "pointer",
                    backgroundColor: isSelected ? A.accentBg : "transparent",
                    borderLeft: isSelected ? `3px solid ${A.accent}` : "3px solid transparent",
                    borderBottom: `1px solid ${A.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {isDeleting ? (
                    <div>
                      <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>Delete this crate?</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(crate.id); }}
                          style={{
                            padding: "4px 10px", borderRadius: 6, border: "none",
                            backgroundColor: "#ef4444", color: "#fff", fontSize: 11,
                            fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                          }}
                        >Delete</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          style={{
                            padding: "4px 10px", borderRadius: 6, border: `1px solid ${A.border}`,
                            backgroundColor: "#fff", color: A.t4, fontSize: 11,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { if (e.key === "Enter") handleRename(crate); if (e.key === "Escape") setEditingId(null); }}
                        autoFocus
                        style={{
                          flex: 1, padding: "3px 6px", borderRadius: 4, fontSize: 12,
                          border: `1px solid ${A.accent}`, outline: "none", fontFamily: "inherit",
                        }}
                      />
                      <button onClick={e => { e.stopPropagation(); handleRename(crate); }}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
                        <Check size={13} color={A.accent} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setEditingId(null); }}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
                        <X size={13} color={A.t5} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600, color: isSelected ? A.accent : A.t1,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160,
                        }}>
                          {crate.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingId(crate.id); setEditName(crate.name); }}
                            style={{ border: "none", background: "none", cursor: "pointer", padding: 2, opacity: 0.4 }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                          >
                            <Pencil size={11} color={A.t4} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDeleteId(crate.id); }}
                            style={{ border: "none", background: "none", cursor: "pointer", padding: 2, opacity: 0.4 }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                          >
                            <Trash2 size={11} color="#ef4444" />
                          </button>
                          {isSelected && <ChevronRight size={12} color={A.accent} />}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 11, color: A.t5 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Music2 size={10} /> {crate.tracks.length}
                        </span>
                        {originals > 0 && <span>{originals} orig</span>}
                        {added > 0 && <span style={{ color: A.accent }}>{added} added</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={10} /> {timeAgo(crate.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected crate tracks */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <CrateTable
              key={selected.id}
              crateTracks={selected.tracks}
              crateName={selected.name}
              onRemoveTrack={(idx) => handleRemoveTrack(selected.id, idx)}
            />
          ) : (
            <div style={{
              borderRadius: 12, border: `1px solid ${A.border}`, backgroundColor: A.panel,
              padding: "40px 24px", textAlign: "center",
            }}>
              <p style={{ fontSize: 13, color: A.t4 }}>Select a crate to view its tracks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
