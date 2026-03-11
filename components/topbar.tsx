"use client";
import { Bell, ChevronDown, RefreshCw } from "lucide-react";
import { usePlayer } from "@/context/player-context";

const A = { bg:"#fff", border:"#f1f5f9", t1:"#0f172a", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8" };

export default function Topbar() {
  const { currentTrack } = usePlayer();

  return (
    <>
      {/* Desktop topbar */}
      <div style={{
        position:"fixed", top:0, left:224, right:0, height:52,
        backgroundColor:A.bg, borderBottom:`1px solid ${A.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", zIndex:30,
      }} className="desktop-topbar">
        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", gap:8, backgroundColor:"#f8fafc", borderRadius:8, padding:"7px 12px", border:`1px solid ${A.border}`, width:260 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize:12, color:A.t5 }}>Search tracks, artists, labels…</span>
          <span style={{ marginLeft:"auto", fontSize:10, color:A.t5, padding:"1px 5px", borderRadius:4, backgroundColor:A.border }}>⌘K</span>
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {currentTrack && (
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 12px", borderRadius:20, backgroundColor:"rgba(0,180,216,0.08)", border:"1px solid rgba(0,180,216,0.18)", fontSize:11, color:A.accent, fontWeight:500, maxWidth:200, overflow:"hidden" }}>
              <RefreshCw size={10} style={{ animation:"spin 2s linear infinite", flexShrink:0 }} />
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {currentTrack.artist} – {currentTrack.title}
              </span>
            </div>
          )}
          <button style={{ position:"relative", border:`1px solid ${A.border}`, backgroundColor:A.bg, borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:A.t4 }}>
            <Bell size={14} />
            <div style={{ position:"absolute", top:6, right:6, width:6, height:6, borderRadius:"50%", backgroundColor:A.accent, border:"1.5px solid #fff" }} />
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", padding:"4px 8px", borderRadius:8, border:`1px solid ${A.border}` }}>
            <div style={{ width:24, height:24, borderRadius:"50%", backgroundColor:"rgba(0,180,216,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:A.accent }}>DJ</div>
            <ChevronDown size={12} color={A.t5} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .desktop-topbar { display: flex !important; }
        @media (max-width: 768px) {
          .desktop-topbar { display: none !important; }
        }
      `}</style>
    </>
  );
}
