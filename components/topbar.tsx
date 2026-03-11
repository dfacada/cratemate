"use client";
import { Search, Bell, ChevronDown, Archive } from "lucide-react";
import { useState } from "react";
import { mockCrates } from "@/data/mockCrate";

export default function Topbar() {
  const [activeCrate, setActiveCrate] = useState(mockCrates[0]);
  const [open, setOpen] = useState(false);
  return (
    <header style={{ position:"fixed",top:0,right:0,left:224,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",backgroundColor:"rgba(200,200,204,0.92)",borderBottom:"1px solid rgba(0,0,0,0.10)",backdropFilter:"blur(8px)",zIndex:30 }}>
      <div style={{ position:"relative",flex:1,maxWidth:360 }}>
        <Search size={14} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9A9AA4" }} />
        <input placeholder="Search tracks, artists, labels…" style={{ width:"100%",height:32,paddingLeft:32,paddingRight:40,borderRadius:6,border:"1px solid rgba(0,0,0,0.12)",backgroundColor:"rgba(0,0,0,0.05)",fontSize:13,color:"#111112",outline:"none" }} />
        <kbd style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#9A9AA4",border:"1px solid rgba(0,0,0,0.10)",borderRadius:3,padding:"1px 4px",fontFamily:"monospace" }}>⌘K</kbd>
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ position:"relative" }}>
          <button onClick={() => setOpen(!open)} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,border:"1px solid rgba(0,0,0,0.12)",backgroundColor:"rgba(0,0,0,0.05)",fontSize:13,color:"#111112",cursor:"pointer" }}>
            <Archive size={14} style={{ color:"#D45A00" }} />
            <span style={{ maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{activeCrate.name}</span>
            <ChevronDown size={12} style={{ color:"#7A7A84" }} />
          </button>
          {open && (
            <div style={{ position:"absolute",right:0,top:"calc(100% + 4px)",width:224,borderRadius:8,border:"1px solid rgba(0,0,0,0.12)",backgroundColor:"#BCBCC0",padding:"4px 0",boxShadow:"0 8px 24px rgba(0,0,0,0.10)",zIndex:50 }}>
              <p style={{ padding:"6px 12px",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:"#7A7A84" }}>Your Crates</p>
              {mockCrates.map(c => (
                <button key={c.id} onClick={() => { setActiveCrate(c); setOpen(false); }} style={{ display:"flex",width:"100%",alignItems:"center",gap:10,padding:"8px 12px",fontSize:13,color:"#3A3A42",backgroundColor:"transparent",border:"none",cursor:"pointer",textAlign:"left" }}>
                  <span style={{ width:8,height:8,borderRadius:"50%",backgroundColor:c.color,flexShrink:0 }} />
                  <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.name}</span>
                  <span style={{ fontSize:11,color:"#9A9AA4" }}>{c.trackIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,border:"1px solid rgba(0,0,0,0.12)",backgroundColor:"rgba(0,0,0,0.05)",cursor:"pointer",position:"relative" }}>
          <Bell size={14} style={{ color:"#7A7A84" }} />
          <span style={{ position:"absolute",top:0,right:0,width:8,height:8,borderRadius:"50%",backgroundColor:"#D45A00" }} />
        </button>
        <button style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg, #D45A00, #A84500)",fontSize:11,fontWeight:700,color:"white",border:"2px solid rgba(212,90,0,0.25)",cursor:"pointer" }}>DJ</button>
      </div>
    </header>
  );
}
