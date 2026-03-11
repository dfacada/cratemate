"use client";

import { Search, Bell, ChevronDown, Archive } from "lucide-react";
import { useState } from "react";
import { mockCrates } from "@/data/mockCrate";

export default function Topbar() {
  const [activeCrate, setActiveCrate] = useState(mockCrates[0]);
  const [crateOpen, setCrateOpen] = useState(false);

  return (
    <header style={{ position:"fixed", top:0, left:224, right:0, height:56, zIndex:30, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e2e8f0", backgroundColor:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", padding:"0 24px", boxShadow:"0 1px 0 0 #f1f5f9" }}>
      {/* Search */}
      <div style={{ position:"relative", flex:1, maxWidth:360 }}>
        <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
        <input
          type="text"
          placeholder="Search tracks, artists, labels…"
          style={{ width:"100%", height:32, paddingLeft:30, paddingRight:36, borderRadius:8, border:"1px solid #e2e8f0", backgroundColor:"#f8fafc", fontSize:13, color:"#334155", outline:"none", fontFamily:"inherit" }}
          onFocus={e => { e.target.style.borderColor = "#00B4D8"; e.target.style.boxShadow = "0 0 0 3px rgba(0,180,216,0.12)"; }}
          onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
        />
        <kbd style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:9, padding:"2px 5px", borderRadius:4, border:"1px solid #e2e8f0", backgroundColor:"#f1f5f9", color:"#94a3b8", fontFamily:"monospace" }}>⌘K</kbd>
      </div>

      {/* Right controls */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* Crate selector */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setCrateOpen(!crateOpen)}
            style={{ display:"flex", alignItems:"center", gap:8, height:32, padding:"0 12px", borderRadius:8, border:"1px solid #e2e8f0", backgroundColor:"#f8fafc", fontSize:13, color:"#475569", cursor:"pointer", fontFamily:"inherit" }}>
            <Archive size={13} color="#00B4D8" />
            <span style={{ maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{activeCrate.name}</span>
            <ChevronDown size={12} color="#94a3b8" />
          </button>
          {crateOpen && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 4px)", width:220, borderRadius:10, border:"1px solid #e2e8f0", backgroundColor:"#fff", boxShadow:"0 8px 24px rgba(0,0,0,0.08)", padding:"4px", zIndex:100 }}>
              <p style={{ padding:"6px 10px", fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#94a3b8" }}>Your Crates</p>
              {mockCrates.map((crate) => (
                <button key={crate.id} onClick={() => { setActiveCrate(crate); setCrateOpen(false); }}
                  style={{ display:"flex", width:"100%", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7, fontSize:13, color:"#475569", cursor:"pointer", border:"none", backgroundColor:"transparent", fontFamily:"inherit", textAlign:"left" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <span style={{ width:8, height:8, borderRadius:"50%", backgroundColor:crate.color, flexShrink:0 }} />
                  <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{crate.name}</span>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{crate.trackIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell */}
        <button style={{ position:"relative", width:32, height:32, borderRadius:8, border:"1px solid #e2e8f0", backgroundColor:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <Bell size={14} color="#64748b" />
          <span style={{ position:"absolute", top:6, right:6, width:6, height:6, borderRadius:"50%", backgroundColor:"#00B4D8", border:"1.5px solid #fff" }} />
        </button>

        {/* Avatar */}
        <button style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg, #00B4D8, #0077A8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 0 0 2px rgba(0,180,216,0.25)" }}>
          DJ
        </button>
      </div>
    </header>
  );
}
