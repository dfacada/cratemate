"use client";
import { useState } from "react";
import { Edit2, Trash2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { mockOcrTracks } from "@/data/mockTracks";
import PlayButton from "@/components/play-button";

const A = { panel:"#fff", border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", bgBase:"#f8fafc" };

interface OcrRow {
  id: string; rawText: string; artist: string; title: string;
  label: string; year: number; confidence: number; verified: boolean;
  bpm?: number; key?: string;
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const level = value >= 0.85 ? "high" : value >= 0.6 ? "medium" : "low";
  const conf = { high: { icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" }, medium: { icon: AlertTriangle, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" }, low: { icon: XCircle, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" } };
  const { icon: Icon, color, bg, border } = conf[level];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 8px", borderRadius:6, backgroundColor:bg, border:`1px solid ${border}`, width:"fit-content" }}>
      <Icon size={11} color={color} />
      <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:600, color }}>{pct}%</span>
    </div>
  );
}

export default function OcrReviewTable({ tracks = mockOcrTracks as OcrRow[], onConfirm }: { tracks?: OcrRow[]; onConfirm?: (t: OcrRow[]) => void }) {
  const [rows, setRows] = useState<OcrRow[]>(tracks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OcrRow>>({});

  const lowCount = rows.filter(r => r.confidence < 0.6).length;
  const startEdit = (row: OcrRow) => { setEditingId(row.id); setEditData({ artist: row.artist, title: row.title, label: row.label, year: row.year }); };
  const saveEdit = (id: string) => { setRows(p => p.map(r => r.id === id ? { ...r, ...editData, verified: true, confidence: Math.max(r.confidence, 0.95) } : r)); setEditingId(null); };
  const rerunOcr = (id: string) => setRows(p => p.map(r => r.id === id ? { ...r, confidence: Math.min(1, r.confidence + 0.15) } : r));
  const removeRow = (id: string) => setRows(p => p.filter(r => r.id !== id));

  const thStyle: React.CSSProperties = { padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:A.t5, borderBottom:`1px solid ${A.border}`, backgroundColor:A.bgBase, whiteSpace:"nowrap" };
  const tdStyle: React.CSSProperties = { padding:"10px 14px", verticalAlign:"middle", borderBottom:`1px solid ${A.bgBase}` };
  const inputStyle: React.CSSProperties = { width:"100%", padding:"5px 8px", borderRadius:7, border:`1px solid ${A.border}`, fontSize:13, color:A.t1, fontFamily:"inherit", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:14, fontWeight:600, color:A.t1 }}>OCR Extraction Review</p>
          <p style={{ fontSize:12, color:A.t4, marginTop:3 }}>
            {rows.length} tracks detected
            {lowCount > 0 && <span style={{ marginLeft:8, color:"#f59e0b", fontWeight:500 }}>· {lowCount} need review</span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={() => rows.forEach(r => r.confidence < 0.8 && rerunOcr(r.id))}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:8, border:`1px solid ${A.border}`, backgroundColor:"#fff", fontSize:12, color:A.t4, cursor:"pointer", fontFamily:"inherit" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = A.bgBase}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
          >
            <RefreshCw size={12} /> Re-run OCR
          </button>
          <button
            onClick={() => onConfirm?.(rows)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:8, border:"none", backgroundColor:A.accent, fontSize:12, fontWeight:500, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}
          >
            <CheckCircle size={12} /> Confirm Playlist
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width:36 }}>#</th>
              <th style={{ ...thStyle, width:30 }}></th>
              <th style={thStyle}>Artist</th>
              <th style={thStyle}>Track</th>
              <th style={thStyle}>Label</th>
              <th style={thStyle}>Year</th>
              <th style={thStyle}>Raw OCR</th>
              <th style={thStyle}>Confidence</th>
              <th style={{ ...thStyle, width:100 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isEditing = editingId === row.id;
              const isLow = row.confidence < 0.6;
              return (
                <tr key={row.id}
                  style={{ backgroundColor: isLow ? "#fff8f8" : "transparent", transition:"background 0.1s" }}
                  onMouseEnter={e => { if (!isLow) e.currentTarget.style.backgroundColor = A.bgBase; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = isLow ? "#fff8f8" : "transparent"; }}
                >
                  <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:11, color:A.t5 }}>{i + 1}</td>
                  <td style={{ ...tdStyle, paddingLeft:8, paddingRight:0 }}>
                    <PlayButton track={{ id:row.id, artist:row.artist, title:row.title, bpm:row.bpm, key:row.key }} />
                  </td>

                  {/* Artist */}
                  <td style={tdStyle}>
                    {isEditing
                      ? <input value={editData.artist ?? ""} onChange={e => setEditData({...editData, artist:e.target.value})} style={inputStyle} />
                      : <span style={{ fontWeight:600, color:A.t1, fontSize:13 }}>{row.artist}</span>
                    }
                  </td>

                  {/* Title */}
                  <td style={tdStyle}>
                    {isEditing
                      ? <input value={editData.title ?? ""} onChange={e => setEditData({...editData, title:e.target.value})} style={inputStyle} />
                      : <span style={{ color:A.t3, fontSize:13 }}>{row.title}</span>
                    }
                  </td>

                  {/* Label */}
                  <td style={{ ...tdStyle, fontSize:12, color:A.t4 }}>
                    {isEditing
                      ? <input value={editData.label ?? ""} onChange={e => setEditData({...editData, label:e.target.value})} style={{ ...inputStyle, width:90 }} />
                      : row.label
                    }
                  </td>

                  {/* Year */}
                  <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:12, color:A.t5 }}>{row.year}</td>

                  {/* Raw OCR text */}
                  <td style={{ ...tdStyle, maxWidth:180 }}>
                    <span style={{ fontSize:11, color:A.t5, fontFamily:"monospace", backgroundColor:A.bgBase, padding:"2px 6px", borderRadius:4, display:"inline-block", maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {row.rawText}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td style={tdStyle}><ConfidenceBadge value={row.confidence} /></td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign:"right" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(row.id)}
                            style={{ padding:"4px 10px", borderRadius:7, border:"none", backgroundColor:A.accent, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding:"4px 10px", borderRadius:7, border:`1px solid ${A.border}`, backgroundColor:"#fff", color:A.t4, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <ActionBtn icon={Edit2} onClick={() => startEdit(row)} title="Edit" hoverColor="#3b82f6" />
                          <ActionBtn icon={RefreshCw} onClick={() => rerunOcr(row.id)} title="Re-run OCR" hoverColor={A.accent} />
                          <ActionBtn icon={Trash2} onClick={() => removeRow(row.id)} title="Remove" hoverColor="#ef4444" danger />
                        </>
                      )}
                    </div>
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

function ActionBtn({ icon: Icon, onClick, title, hoverColor, danger }: { icon: any; onClick: () => void; title: string; hoverColor: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width:26, height:26, borderRadius:6, border:"1px solid #e2e8f0", backgroundColor:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", transition:"all 0.12s" }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#f1f5f9"; e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = danger ? "#fecaca" : "#cbd5e1"; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
    >
      <Icon size={11} />
    </button>
  );
}
