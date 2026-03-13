"use client";

import { History, Search, Upload, Users, Clock } from "lucide-react";

const historyItems = [
  { type: "dig", icon: Search, label: "New Dig — Pasted Spotify playlist", sub: "12 tracks extracted · DNA analyzed", time: "2 hours ago", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { type: "artist", icon: Users, label: "Mined Rampa catalog", sub: "10 tracks · 3 added to crate", time: "5 hours ago", color: "#ea580c", bg: "rgba(234,88,12,0.1)" },
  { type: "upload", icon: Upload, label: "Screenshot upload — RA set list", sub: "OCR extracted 8 tracks", time: "Yesterday", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  { type: "artist", icon: Users, label: "Mined Ivory (IT) catalog", sub: "8 tracks · 5 added to crate", time: "Yesterday", color: "#ea580c", bg: "rgba(234,88,12,0.1)" },
  { type: "dig", icon: Search, label: "New Dig — SoundCloud mix", sub: "18 tracks extracted", time: "2 days ago", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { type: "artist", icon: Users, label: "Mined Trikk catalog", sub: "6 tracks · 2 added to crate", time: "3 days ago", color: "#ea580c", bg: "rgba(234,88,12,0.1)" },
  { type: "upload", icon: Upload, label: "Screenshot upload — Boiler Room tracklist", sub: "OCR extracted 14 tracks · 4 low confidence", time: "4 days ago", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
];

export default function HistoryPage() {
  return (
    <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "42rem", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--text-primary)" }}>History</h1>
        <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-secondary)" }}>Your recent digs, uploads, and catalog mines</p>
      </div>

      <div style={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {historyItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", transition: "background-color 0.15s", borderBottom: i < historyItems.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
              <div style={{ display: "flex", height: "36px", width: "36px", flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: "8px", backgroundColor: item.bg }}>
                <item.icon style={{ height: "16px", width: "16px", color: item.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.sub}</p>
              </div>
              <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <Clock style={{ height: "12px", width: "12px" }} />
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
