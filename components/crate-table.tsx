"use client";
import { useState } from "react";
import { Trash2, Download, ListMusic, ArrowUpDown, Music2 } from "lucide-react";
import { cn, energyColor, gemScoreColor } from "@/lib/utils";
import { mockTracks } from "@/data/mockTracks";
import { Track } from "@/types/track";
import PlayButton from "@/components/play-button";

const KEY_COLORS: Record<string,string> = {
  "1A":"#FF6B6B","2A":"#FF8E53","3A":"#FFC300","4A":"#C5E336","5A":"#6BCB77","6A":"#4D96FF","7A":"#9B72CF","8A":"#FF6B9D","9A":"#56CFE1","10A":"#FF9A3C","11A":"#80F2A6","12A":"#FFD6A5",
  "1B":"#FF4040","2B":"#FF6B2B","3B":"#FFA500","4B":"#A8E063","5B":"#2ECC40","6B":"#0074D9","7B":"#7B2FBE","8B":"#FF2D6C","9B":"#17B8D1","10B":"#E07B00","11B":"#4ADE80","12B":"#FCC89B",
};
type SortKey = "artist"|"bpm"|"key"|"energy"|"year";

const A = { panel:"#fff", border:"#e2e8f0", t1:"#0f172a", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8" };

export default function CrateTable({ tracks = mockTracks.slice(0,8), onBuildSet, onExport }: { tracks?: Track[]; onBuildSet?: ()=>void; onExport?: ()=>void }) {
  const [items, setItems] = useState<Track[]>(tracks);
  const [sortKey, setSortKey] = useState<SortKey|null>(null);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");

  const toggleSort = (k: SortKey) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); }};
  const sorted = [...items].sort((a,b) => {
    if(!sortKey) return 0;
    const av=a[sortKey as keyof Track], bv=b[sortKey as keyof Track];
    if(typeof av==="number"&&typeof bv==="number") return sortDir==="asc"?av-bv:bv-av;
    return sortDir==="asc"?String(av??"").localeCompare(String(bv??"")):String(bv??"").localeCompare(String(av??""));
  });
  const avgBpm = Math.round(items.reduce((a,t)=>a+t.bpm,0)/items.length);
  const avgEnergy = (items.reduce((a,t)=>a+t.energy,0)/items.length).toFixed(1);

  const thStyle = { padding:"10px 14px", textAlign:"left" as const, fontSize:10, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase" as const, color:A.t5, borderBottom:`1px solid ${A.border}`, backgroundColor:"#f8fafc" };
  const tdStyle = { padding:"9px 14px", fontSize:13, borderBottom:`1px solid #f8fafc`, verticalAlign:"middle" as const };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:12, color:A.t4 }}>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}><Music2 size={13} color={A.accent} /><b style={{ color:A.t1 }}>{items.length}</b> tracks</span>
          <span>Avg BPM: <b style={{ color:A.t1, fontFamily:"monospace" }}>{avgBpm}</b></span>
          <span>Avg Energy: <b style={{ fontFamily:"monospace" }}>{avgEnergy}</b></span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onExport} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, border:`1px solid ${A.border}`, backgroundColor:"#fff", fontSize:12, color:A.t4, cursor:"pointer", fontFamily:"inherit" }}>
            <Download size={12} /> Export
          </button>
          <button onClick={onBuildSet} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, border:"none", backgroundColor:A.accent, fontSize:12, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
            <ListMusic size={12} /> Build Set
          </button>
        </div>
      </div>

      <div style={{ borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width:36 }}></th>
              <th style={{ ...thStyle, width:30 }}></th>
              <th style={{ ...thStyle, cursor:"pointer" }} onClick={()=>toggleSort("artist")}>Artist <ArrowUpDown size={10} style={{ display:"inline", marginLeft:2 }} /></th>
              <th style={thStyle}>Track</th>
              <th style={{ ...thStyle, cursor:"pointer" }} onClick={()=>toggleSort("bpm")}>BPM <ArrowUpDown size={10} style={{ display:"inline", marginLeft:2 }} /></th>
              <th style={thStyle}>Key</th>
              <th style={{ ...thStyle, cursor:"pointer" }} onClick={()=>toggleSort("energy")}>Energy <ArrowUpDown size={10} style={{ display:"inline", marginLeft:2 }} /></th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Gem</th>
              <th style={{ ...thStyle, width:32 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={t.id} style={{ transition:"background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                <td style={{ ...tdStyle, color:A.t5, fontFamily:"monospace", fontSize:11 }}>{i+1}</td>
                <td style={{ ...tdStyle, paddingLeft:8, paddingRight:0 }}>
                  <PlayButton track={{ id:t.id, artist:t.artist, title:t.title, label:t.label, bpm:t.bpm, key:t.key, energy:t.energy }} />
                </td>
                <td style={{ ...tdStyle, fontWeight:600, color:A.t1 }}>{t.artist}</td>
                <td style={tdStyle}><span style={{ color:"#475569" }}>{t.title}</span><span style={{ marginLeft:8, fontSize:11, color:A.t5 }}>{t.duration}</span></td>
                <td style={{ ...tdStyle, fontFamily:"monospace", color:A.t4 }}>{t.bpm}</td>
                <td style={tdStyle}>
                  <span style={{ padding:"2px 6px", borderRadius:5, fontFamily:"monospace", fontSize:10, fontWeight:700, color:KEY_COLORS[t.key]??"#888", backgroundColor:(KEY_COLORS[t.key]??"#888")+"22" }}>{t.key}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ display:"flex", gap:2, alignItems:"flex-end" }}>
                      {Array.from({length:10}).map((_,j)=>(
                        <div key={j} style={{ width:3, height:10, borderRadius:2, backgroundColor:j<t.energy?"#00B4D8":"#e2e8f0" }} />
                      ))}
                    </div>
                    <span style={{ fontFamily:"monospace", fontSize:11, color: t.energy>=8?"#f97316":t.energy>=6?"#00B4D8":"#94a3b8" }}>{t.energy}</span>
                  </div>
                </td>
                <td style={tdStyle}><span style={{ padding:"2px 7px", borderRadius:20, backgroundColor:"#f1f5f9", fontSize:10, color:A.t4 }}>{t.source.replace(/_/g," ")}</span></td>
                <td style={tdStyle}>{t.gemScore!=null&&<span style={{ fontFamily:"monospace", fontWeight:700, fontSize:12, color:t.gemScore>=85?"#00B4D8":t.gemScore>=70?"#f59e0b":"#94a3b8" }}>{t.gemScore}</span>}</td>
                <td style={tdStyle}>
                  <button onClick={()=>setItems(p=>p.filter(x=>x.id!==t.id))}
                    style={{ width:22, height:22, borderRadius:5, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"transparent", color:"#cbd5e1" }}
                    onMouseEnter={e=>{e.currentTarget.style.backgroundColor="#fee2e2";e.currentTarget.style.color="#ef4444";}}
                    onMouseLeave={e=>{e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#cbd5e1";}}>
                    <Trash2 size={12} />
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
