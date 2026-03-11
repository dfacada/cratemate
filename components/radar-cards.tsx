"use client";
import { useState } from "react";
import { Radio, Plus, ExternalLink, Zap, RefreshCw, Loader2 } from "lucide-react";
import { energyColor } from "@/lib/utils";
import { mockRadarTracks } from "@/data/mockCrate";

const P = { panel:"#C8C8CC", panel2:"#BCBCC0", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

export default function RadarCards() {
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const tracks = mockRadarTracks.filter(t => {
    if (filter==="all") return true;
    if (filter==="soundcloud") return t.source.toLowerCase().includes("soundcloud");
    if (filter==="bandcamp") return t.source.toLowerCase().includes("bandcamp");
    if (filter==="charts") return t.source.toLowerCase().includes("chart");
    return true;
  });

  const handleRefresh = async () => { setRefreshing(true); await new Promise(r=>setTimeout(r,2000)); setRefreshing(false); };

  const filters = [["all","All"],["soundcloud","SoundCloud"],["bandcamp","Bandcamp"],["charts","DJ Charts"]];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.20)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Radio size={15} style={{ color:P.accent }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>Underground Radar</p>
            <p style={{ fontSize:11,color:P.t5,marginTop:1 }}>Live signal detection · Updated hourly</p>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",borderRadius:8,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",padding:2 }}>
            {filters.map(([val,label]) => (
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:"4px 12px",borderRadius:6,fontSize:12,border:"none",backgroundColor:filter===val?"rgba(0,0,0,0.10)":"transparent",color:filter===val?P.t1:P.t4,cursor:"pointer",fontWeight:filter===val?600:400 }}>{label}</button>
            ))}
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",cursor:"pointer",color:P.t4 }}>
            {refreshing ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> : <RefreshCw size={14}/>}
          </button>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12 }}>
        {tracks.map(t => (
          <div key={t.id} style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
              <div style={{ position:"relative",width:40,height:40,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ position:"absolute",inset:0,borderRadius:"50%",backgroundColor:"rgba(212,90,0,0.12)",border:"1px solid rgba(212,90,0,0.25)" }}/>
                <span style={{ position:"relative",fontFamily:"monospace",fontSize:10,fontWeight:700,color:P.accent }}>{t.undergroundScore}</span>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8 }}>
                  <div>
                    <p style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>{t.artist}</p>
                    <p style={{ fontSize:13,color:P.t3,marginTop:2 }}>{t.title}</p>
                  </div>
                  <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                    <button onClick={()=>setAdded(p=>new Set([...p,t.id]))} disabled={added.has(t.id)} style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:added.has(t.id)?"rgba(212,90,0,0.10)":"rgba(0,0,0,0.05)",cursor:"pointer",color:added.has(t.id)?P.accent:P.t4 }}>
                      <Plus size={13}/>
                    </button>
                    <button style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",cursor:"pointer",color:P.t4 }}>
                      <ExternalLink size={12}/>
                    </button>
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,marginTop:8,fontSize:11 }}>
                  <span style={{ fontFamily:"monospace",color:P.t4 }}>{t.bpm} BPM</span>
                  <span style={{ color:P.t5 }}>·</span>
                  <span style={{ fontFamily:"monospace",color:P.t4 }}>{t.key}</span>
                  <span style={{ color:P.t5 }}>·</span>
                  <span style={{ display:"flex",alignItems:"center",gap:2,fontFamily:"monospace",color:energyColor(t.energy) }}><Zap size={10}/>{t.energy}</span>
                  <span style={{ padding:"1px 6px",borderRadius:999,backgroundColor:"rgba(212,90,0,0.10)",color:P.accent,fontSize:10 }}>{t.source}</span>
                </div>
                <p style={{ marginTop:8,padding:"8px 10px",borderRadius:6,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t3,lineHeight:1.5 }}>{t.reason}</p>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:P.t5 }}>
                  <span>{t.signalCount} signals</span>
                  <span>{t.detectedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
