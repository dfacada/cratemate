"use client";
import { useState } from "react";
import { Plus, Archive } from "lucide-react";
import CrateTable from "@/components/crate-table";
import { mockCrates } from "@/data/mockCrate";
import { Crate } from "@/types/crate";

const P = { panel:"#C8C8CC", panel2:"#BCBCC0", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

export default function CratePage() {
  const [selectedId, setSelectedId] = useState(mockCrates[0].id);
  const crate = mockCrates.find(c=>c.id===selectedId) as Crate;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Crates</h1>
          <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>{mockCrates.length} crates · {mockCrates.reduce((a,c)=>a+c.trackIds.length,0)} total tracks</p>
        </div>
        <button style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.20)",fontSize:13,fontWeight:600,color:P.accent,cursor:"pointer" }}>
          <Plus size={14}/> New Crate
        </button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"220px 1fr",gap:16 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {mockCrates.map(c=>(
            <button key={c.id} onClick={()=>setSelectedId(c.id)} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:14,borderRadius:10,border:`1px solid ${selectedId===c.id?"rgba(0,0,0,0.15)":P.border}`,backgroundColor:selectedId===c.id?P.panel2:P.panel,cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}>
              <div style={{ width:10,height:10,borderRadius:"50%",backgroundColor:c.color,flexShrink:0,marginTop:2 }}/>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.name}</p>
                <p style={{ fontSize:11,color:P.t5,marginTop:2 }}>{c.trackIds.length} tracks · {c.avgBpm} BPM</p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:6 }}>
                  {(c.tags??[]).slice(0,2).map(t=><span key={t} style={{ fontSize:9,padding:"1px 6px",borderRadius:999,backgroundColor:"rgba(0,0,0,0.07)",color:P.t4 }}>{t}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {crate && (
            <>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:16,borderRadius:12,backgroundColor:`${crate.color}12`,border:`1px solid ${crate.color}30` }}>
                <Archive size={18} style={{ color:crate.color,flexShrink:0 }}/>
                <div>
                  <h2 style={{ fontSize:16,fontWeight:700,color:P.t1,margin:0 }}>{crate.name}</h2>
                  {crate.description&&<p style={{ fontSize:12,color:P.t4,marginTop:2 }}>{crate.description}</p>}
                </div>
              </div>
              <CrateTable tracks={crate.tracks} onBuildSet={()=>window.location.assign("/set-builder")} onExport={()=>{}}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
