"use client";
import { useState } from "react";
import { Trash2, Download, ListMusic, ArrowUpDown } from "lucide-react";
import { gemScoreColor, energyColor } from "@/lib/utils";
import { mockTracks } from "@/data/mockTracks";
import { Track } from "@/types/track";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

const KEY_COLORS: Record<string,string> = {
  "1A":"#E85555","2A":"#E87A3A","3A":"#D4A017","4A":"#8DB33A","5A":"#3DAD5E","6A":"#2D7DD2","7A":"#7B52C7","8A":"#D44D8A","9A":"#2AADCC","10A":"#D47A1A","11A":"#3DC47A","12A":"#C4A060",
  "1B":"#D43030","2B":"#CC5520","3B":"#D48A00","4B":"#72A030","5B":"#208840","6B":"#0060C0","7B":"#5E28AA","8B":"#CC1855","9B":"#1090B8","10B":"#B86800","11B":"#28B85C","12B":"#B08040",
};

type SortKey = "artist"|"bpm"|"energy"|"year";

export default function CrateTable({ tracks = mockTracks.slice(0,8), onBuildSet, onExport }: { tracks?: Track[]; onBuildSet?: ()=>void; onExport?: ()=>void }) {
  const [items, setItems] = useState<Track[]>(tracks);
  const [sortKey, setSortKey] = useState<SortKey|null>(null);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");

  const toggleSort = (k: SortKey) => {
    if (sortKey===k) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const sorted = [...items].sort((a,b) => {
    if (!sortKey) return 0;
    const av = a[sortKey as keyof Track] as number|string;
    const bv = b[sortKey as keyof Track] as number|string;
    if (typeof av==="number"&&typeof bv==="number") return sortDir==="asc"?av-bv:bv-av;
    return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
  });

  const avgBpm = Math.round(items.reduce((a,t)=>a+t.bpm,0)/items.length);

  const Th = ({ label, sk }: { label:string; sk?: SortKey }) => (
    <th onClick={()=>sk&&toggleSort(sk)} style={{ padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,cursor:sk?"pointer":"default",whiteSpace:"nowrap",borderBottom:`1px solid ${P.border}`,backgroundColor:P.panel }}>
      <span style={{ display:"flex",alignItems:"center",gap:4 }}>{label}{sk&&<ArrowUpDown size={10}/>}</span>
    </th>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <p style={{ fontSize:13,color:P.t4 }}><strong style={{ color:P.t1 }}>{items.length}</strong> tracks &nbsp;·&nbsp; Avg BPM: <strong style={{ color:P.t1,fontFamily:"monospace" }}>{avgBpm}</strong></p>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onExport} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t3,cursor:"pointer" }}>
            <Download size={13}/> Export
          </button>
          <button onClick={onBuildSet} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,backgroundColor:"rgba(212,90,0,0.12)",border:"1px solid rgba(212,90,0,0.22)",fontSize:12,fontWeight:600,color:P.accent,cursor:"pointer" }}>
            <ListMusic size={13}/> Build Set
          </button>
        </div>
      </div>

      <div style={{ borderRadius:12,border:`1px solid ${P.border}`,overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={{ width:32,padding:"10px 16px",borderBottom:`1px solid ${P.border}`,backgroundColor:P.panel }}/>
              <Th label="Artist" sk="artist"/>
              <Th label="Track"/>
              <Th label="BPM" sk="bpm"/>
              <Th label="Key"/>
              <Th label="Energy" sk="energy"/>
              <Th label="Source"/>
              <Th label="Gem"/>
              <th style={{ padding:"10px 16px",borderBottom:`1px solid ${P.border}`,backgroundColor:P.panel }}/>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t,i) => (
              <tr key={t.id} style={{ backgroundColor:i%2===0?P.panel:"rgba(0,0,0,0.025)",borderBottom:`1px solid ${P.border}` }}>
                <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:11,color:P.t5 }}>{i+1}</td>
                <td style={{ padding:"10px 16px",fontSize:13,fontWeight:600,color:P.t1 }}>{t.artist}</td>
                <td style={{ padding:"10px 16px" }}>
                  <span style={{ fontSize:13,color:P.t2 }}>{t.title}</span>
                  <span style={{ fontSize:11,color:P.t5,marginLeft:6 }}>{t.duration}</span>
                </td>
                <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:12,color:P.t3 }}>{t.bpm}</td>
                <td style={{ padding:"10px 16px" }}>
                  <span style={{ padding:"2px 6px",borderRadius:4,fontFamily:"monospace",fontSize:10,fontWeight:700,color:KEY_COLORS[t.key]??"#888",backgroundColor:`${KEY_COLORS[t.key]??'#888'}18` }}>{t.key}</span>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <div style={{ display:"flex",gap:1 }}>
                      {Array.from({length:10}).map((_,j) => (
                        <div key={j} style={{ width:3,height:10,borderRadius:1,backgroundColor:j<t.energy?energyColor(t.energy):"rgba(0,0,0,0.10)" }}/>
                      ))}
                    </div>
                    <span style={{ fontSize:11,fontFamily:"monospace",color:energyColor(t.energy) }}>{t.energy}</span>
                  </div>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <span style={{ fontSize:10,padding:"2px 8px",borderRadius:999,backgroundColor:"rgba(0,0,0,0.07)",color:P.t4,textTransform:"uppercase",letterSpacing:"0.04em" }}>{t.source.replace(/_/g," ")}</span>
                </td>
                <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:12,fontWeight:700,color:gemScoreColor(t.gemScore??0) }}>{t.gemScore}</td>
                <td style={{ padding:"10px 16px" }}>
                  <button onClick={()=>setItems(p=>p.filter(x=>x.id!==t.id))} style={{ width:24,height:24,borderRadius:4,border:"none",backgroundColor:"transparent",cursor:"pointer",color:P.t5,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Trash2 size={12}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
