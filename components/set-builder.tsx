"use client";
import { useState } from "react";
import { Wand2, GripVertical, Clock, Zap, TrendingUp } from "lucide-react";
import { mockSetTracks } from "@/data/mockCrate";
import { Track } from "@/types/track";
import PlayButton from "@/components/play-button";

type SetPhase = "warmup"|"groove"|"build"|"peak"|"close";
interface SetTrack extends Track { position:number; phase:SetPhase; }

const PHASES = [
  { key:"warmup" as const, label:"Warmup", color:"#3b82f6", bg:"var(--bg-tertiary)", border:"var(--border)" },
  { key:"groove" as const, label:"Groove", color:"#00B4D8", bg:"var(--bg-tertiary)", border:"var(--border)" },
  { key:"build" as const, label:"Build", color:"#d97706", bg:"var(--bg-tertiary)", border:"var(--border)" },
  { key:"peak" as const, label:"Peak", color:"#ea580c", bg:"var(--bg-tertiary)", border:"var(--border)" },
  { key:"close" as const, label:"Close", color:"#7c3aed", bg:"var(--bg-tertiary)", border:"var(--border)" },
];
const cssVars = {
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  accentPrimary: "var(--accent-primary)",
  border: "var(--border)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
};

export default function SetBuilder() {
  const [tracks, setTracks] = useState<SetTrack[]>(mockSetTracks as SetTrack[]);
  const [building, setBuilding] = useState(false);
  const [draggingId, setDraggingId] = useState<string|null>(null);

  const handleAutoBuild = async () => {
    setBuilding(true);
    await new Promise(r=>setTimeout(r,1800));
    const sorted = [...tracks].sort((a,b)=>a.energy-b.energy);
    const phases: SetPhase[] = ["warmup","groove","build","peak","close"];
    const chunk = Math.ceil(sorted.length/phases.length);
    setTracks(sorted.map((t,i)=>({...t,phase:phases[Math.min(Math.floor(i/chunk),phases.length-1)],position:i+1})));
    setBuilding(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:cssVars.textPrimary }}>{tracks.length} tracks · ~{tracks.length*7} min</p>
        </div>
        <button onClick={handleAutoBuild} disabled={building}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:9, border:"none", backgroundColor:cssVars.accentPrimary, color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", opacity:building?0.7:1 }}>
          <Wand2 size={14} style={{ animation:building?"spin 1s linear infinite":"none" }} />
          {building?"Building…":"Auto Build Set"}
        </button>
      </div>

      {/* Energy arc */}
      <div style={{ borderRadius:12, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:cssVars.textMuted, marginBottom:10 }}>Energy Arc</p>
        <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:52 }}>
          {tracks.map(t=>(
            <div key={t.id} style={{ flex:1, borderRadius:"3px 3px 0 0", background:"linear-gradient(to top, #00B4D8, #67e8f9)", height:`${(t.energy/10)*100}%`, transition:"height 0.4s ease", minWidth:4 }} />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10, color:cssVars.textMuted }}>
          <span>Start</span><span>Peak</span><span>End</span>
        </div>
      </div>

      {/* Phase columns */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
        {PHASES.map(phase=>{
          const pt = tracks.filter(t=>t.phase===phase.key);
          return (
            <div key={phase.key}
              style={{ borderRadius:12, border:`1px solid ${phase.border}`, backgroundColor:phase.bg, padding:12 }}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>{ if(!draggingId)return; setTracks(p=>p.map(t=>t.id===draggingId?{...t,phase:phase.key}:t)); setDraggingId(null); }}>
              <div style={{ borderBottom:`1px solid ${phase.border}`, paddingBottom:8, marginBottom:10 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase" as const, color:phase.color }}>{phase.label}</p>
                <p style={{ fontSize:10, color:cssVars.textMuted, marginTop:2 }}>{pt.length} tracks</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {pt.map(t=>(
                  <div key={t.id} draggable onDragStart={()=>setDraggingId(t.id)} onDragEnd={()=>setDraggingId(null)}
                    style={{ borderRadius:8, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, padding:10, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", cursor:"grab", opacity:draggingId===t.id?0.4:1, transition:"all 0.1s" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                      <GripVertical size={12} color={"var(--text-muted)"} style={{ flexShrink:0, marginTop:1 }} />
                      <div style={{ minWidth:0, flex:1 }}>
                        <p style={{ fontSize:11, fontWeight:600, color:cssVars.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.artist}</p>
                        <p style={{ fontSize:10, color:cssVars.textSecondary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                          <PlayButton track={{ id:t.id, artist:t.artist, title:t.title, bpm:t.bpm, energy:t.energy }} size="sm" />
                          <span style={{ fontFamily:"monospace", fontSize:9, color:cssVars.textMuted }}>{t.bpm}</span>
                          <span style={{ fontFamily:"monospace", fontSize:9, color: t.energy>=8?"#f97316":cssVars.accentPrimary }}>{t.energy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pt.length===0&&(
                  <div style={{ height:60, borderRadius:8, border:`1.5px dashed ${cssVars.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:cssVars.textMuted }}>Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[
          { icon:Clock, label:"Est. Duration", value:`~${tracks.length*7} min` },
          { icon:Zap, label:"Peak Energy", value:String(Math.max(...tracks.map(t=>t.energy))) },
          { icon:TrendingUp, label:"BPM Range", value:`${Math.min(...tracks.map(t=>t.bpm))}–${Math.max(...tracks.map(t=>t.bpm))}` },
        ].map(({icon:Icon,label,value})=>(
          <div key={label} style={{ display:"flex", alignItems:"center", gap:12, borderRadius:12, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, padding:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <Icon size={16} color={cssVars.accentPrimary} style={{ flexShrink:0 }} />
            <div><p style={{ fontSize:10, color:cssVars.textMuted }}>{label}</p><p style={{ fontSize:16, fontWeight:700, color:cssVars.textPrimary, marginTop:2 }}>{value}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
