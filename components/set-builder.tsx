"use client";
import { useState } from "react";
import { Wand2, GripVertical, Clock, Zap, TrendingUp } from "lucide-react";
import { energyColor } from "@/lib/utils";
import { mockSetTracks } from "@/data/mockCrate";
import { Track } from "@/types/track";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };
type Phase = "warmup"|"groove"|"build"|"peak"|"close";
interface SetTrack extends Track { position:number; phase:Phase; }

const PHASES: {key:Phase;label:string;color:string;bg:string;border:string}[] = [
  {key:"warmup",label:"Warmup",color:"#2563EB",bg:"rgba(37,99,235,0.07)",border:"rgba(37,99,235,0.15)"},
  {key:"groove",label:"Groove",color:"#D45A00",bg:"rgba(212,90,0,0.07)",border:"rgba(212,90,0,0.15)"},
  {key:"build",label:"Build",color:"#D97706",bg:"rgba(217,119,6,0.07)",border:"rgba(217,119,6,0.15)"},
  {key:"peak",label:"Peak",color:"#DC2626",bg:"rgba(220,38,38,0.07)",border:"rgba(220,38,38,0.15)"},
  {key:"close",label:"Close",color:"#7C3AED",bg:"rgba(124,58,237,0.07)",border:"rgba(124,58,237,0.15)"},
];

export default function SetBuilder() {
  const [tracks, setTracks] = useState<SetTrack[]>(mockSetTracks as SetTrack[]);
  const [building, setBuilding] = useState(false);
  const [draggingId, setDraggingId] = useState<string|null>(null);

  const handleAutoBuild = async () => {
    setBuilding(true);
    await new Promise(r=>setTimeout(r,1800));
    const sorted = [...tracks].sort((a,b)=>a.energy-b.energy);
    const phases: Phase[] = ["warmup","groove","build","peak","close"];
    const chunk = Math.ceil(sorted.length/phases.length);
    setTracks(sorted.map((t,i)=>({...t,phase:phases[Math.min(Math.floor(i/chunk),phases.length-1)],position:i+1})));
    setBuilding(false);
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <h2 style={{ fontSize:16,fontWeight:700,color:P.t1,margin:0 }}>Set Builder</h2>
          <p style={{ fontSize:12,color:P.t5,marginTop:4 }}>{tracks.length} tracks · ~{tracks.length*7} min</p>
        </div>
        <button onClick={handleAutoBuild} disabled={building} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:8,backgroundColor:"rgba(212,90,0,0.12)",border:"1px solid rgba(212,90,0,0.22)",fontSize:13,fontWeight:600,color:P.accent,cursor:"pointer" }}>
          <Wand2 size={15} style={{ animation:building?"spin 1s linear infinite":"none" }}/>{building?"Building…":"Auto Build Set"}
        </button>
      </div>

      {/* Energy arc */}
      <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
        <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,marginBottom:10 }}>Energy Arc</p>
        <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:56 }}>
          {tracks.map(t=>(
            <div key={t.id} style={{ flex:1,borderRadius:"3px 3px 0 0",backgroundColor:P.accent,opacity:0.6+(t.energy/10)*0.4,height:`${(t.energy/10)*100}%` }} title={`${t.artist} — ${t.title}`}/>
          ))}
        </div>
      </div>

      {/* Phase columns */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
        {PHASES.map(ph => {
          const phaseTracks = tracks.filter(t=>t.phase===ph.key);
          return (
            <div key={ph.key} style={{ borderRadius:12,border:`1px solid ${ph.border}`,backgroundColor:ph.bg,padding:12 }}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>{ if(!draggingId)return; setTracks(p=>p.map(t=>t.id===draggingId?{...t,phase:ph.key}:t)); setDraggingId(null); }}>
              <div style={{ borderBottom:`1px solid ${ph.border}`,paddingBottom:8,marginBottom:8 }}>
                <p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:ph.color,margin:0 }}>{ph.label}</p>
                <p style={{ fontSize:10,color:P.t5,marginTop:2 }}>{phaseTracks.length} tracks</p>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {phaseTracks.map(t=>(
                  <div key={t.id} draggable onDragStart={()=>setDraggingId(t.id)} onDragEnd={()=>setDraggingId(null)}
                    style={{ borderRadius:8,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:10,cursor:"grab",opacity:draggingId===t.id?0.4:1 }}>
                    <div style={{ display:"flex",alignItems:"flex-start",gap:6 }}>
                      <GripVertical size={12} style={{ color:P.t5,marginTop:2,flexShrink:0 }}/>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:11,fontWeight:600,color:P.t1,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.artist}</p>
                        <p style={{ fontSize:10,color:P.t4,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.title}</p>
                        <div style={{ display:"flex",gap:6,marginTop:4 }}>
                          <span style={{ fontSize:9,fontFamily:"monospace",color:P.t5,display:"flex",alignItems:"center",gap:2 }}><Clock size={9}/>{t.bpm}</span>
                          <span style={{ fontSize:9,fontFamily:"monospace",display:"flex",alignItems:"center",gap:2,color:energyColor(t.energy) }}><Zap size={9}/>{t.energy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {phaseTracks.length===0&&<div style={{ height:56,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,border:`1px dashed ${P.border}`,fontSize:10,color:P.t5 }}>Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
        {[{icon:Clock,label:"Est. Duration",value:`~${tracks.length*7} min`},{icon:Zap,label:"Peak Energy",value:String(Math.max(...tracks.map(t=>t.energy)))},{icon:TrendingUp,label:"BPM Range",value:`${Math.min(...tracks.map(t=>t.bpm))}–${Math.max(...tracks.map(t=>t.bpm))}`}].map(({icon:Icon,label,value})=>(
          <div key={label} style={{ display:"flex",alignItems:"center",gap:12,borderRadius:10,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:12 }}>
            <Icon size={15} style={{ color:P.accent,flexShrink:0 }}/>
            <div><p style={{ fontSize:10,color:P.t5,margin:0 }}>{label}</p><p style={{ fontSize:14,fontWeight:700,color:P.t1,marginTop:2 }}>{value}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
