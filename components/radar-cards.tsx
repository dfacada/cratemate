"use client";
import { useState } from "react";
import { Radio, Plus, ExternalLink, Zap, RefreshCw, Loader2 } from "lucide-react";
import { mockRadarTracks } from "@/data/mockCrate";
import PlayButton from "@/components/play-button";

const cssVars = {
  bgSecondary: "var(--bg-secondary)",
  border: "var(--border)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  accentPrimary: "var(--accent-primary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
};
type RadarSource = "all"|"soundcloud"|"bandcamp"|"dj_charts";
const FILTERS = [{label:"All",value:"all"},{label:"SoundCloud",value:"soundcloud"},{label:"Bandcamp",value:"bandcamp"},{label:"DJ Charts",value:"dj_charts"}] as const;

export default function RadarCards() {
  const [src, setSrc] = useState<RadarSource>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = mockRadarTracks.filter(t =>
    src==="all" || (src==="soundcloud"&&t.source.toLowerCase().includes("soundcloud")) ||
    (src==="bandcamp"&&t.source.toLowerCase().includes("bandcamp")) || (src==="dj_charts"&&t.source.toLowerCase().includes("dj chart"))
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Radio size={15} color={cssVars.accentPrimary} />
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:cssVars.textPrimary }}>Underground Radar</p>
            <p style={{ fontSize:11, color:cssVars.textMuted }}>Live signal detection · Updated hourly</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", borderRadius:8, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgHover, padding:2 }}>
            {FILTERS.map(f=>(
              <button key={f.value} onClick={()=>setSrc(f.value as RadarSource)}
                style={{ padding:"5px 12px", borderRadius:6, fontSize:12, border:"none", cursor:"pointer", fontFamily:"inherit", backgroundColor:src===f.value?cssVars.bgSecondary:  "transparent", color:src===f.value?cssVars.textPrimary:cssVars.textMuted, boxShadow:src===f.value?"0 1px 3px rgba(0,0,0,0.08)":"none", transition:"all 0.12s" }}>
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={async()=>{setRefreshing(true);await new Promise(r=>setTimeout(r,1500));setRefreshing(false);}} disabled={refreshing}
            style={{ width:32, height:32, borderRadius:8, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:cssVars.textMuted }}>
            {refreshing?<Loader2 size={14} style={{ animation:"spin 0.7s linear infinite" }} />:<RefreshCw size={14} />}
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {filtered.map(t=>(
          <div key={t.id} style={{ borderRadius:12, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,180,216,0.3)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,180,216,0.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=cssVars.border;e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)";}}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              {/* Score ring */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:cssVars.accentPrimary }}>{t.undergroundScore}</span>
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:cssVars.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.artist}</p>
                    <p style={{ fontSize:12, color:cssVars.textSecondary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</p>
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <PlayButton track={{ id:t.id, artist:t.artist, title:t.title, bpm:t.bpm, key:t.key, energy:t.energy }} size="md" />
                    <button onClick={()=>setAddedIds(p=>new Set([...p,t.id]))} disabled={addedIds.has(t.id)}
                      style={{ width:28, height:28, borderRadius:7, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:addedIds.has(t.id)?"rgba(0,180,216,0.1)":cssVars.bgHover, color:addedIds.has(t.id)?cssVars.accentPrimary:cssVars.textMuted }}>
                      <Plus size={13} />
                    </button>
                    <a href={`https://soundcloud.com/search?q=${encodeURIComponent(t.artist+" "+t.title)}`} target="_blank" rel="noopener noreferrer"
                      style={{ width:28, height:28, borderRadius:7, backgroundColor:cssVars.bgHover, display:"flex", alignItems:"center", justifyContent:"center", color:cssVars.textMuted, textDecoration:"none" }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, fontSize:11, flexWrap:"wrap" as const }}>
                  <span style={{ fontFamily:"monospace", color:cssVars.textMuted }}>{t.bpm} BPM</span>
                  <span style={{ color:cssVars.border }}>·</span>
                  <span style={{ fontFamily:"monospace", color:cssVars.textMuted }}>{t.key}</span>
                  <span style={{ color:cssVars.border }}>·</span>
                  <span style={{ display:"flex", alignItems:"center", gap:3, fontFamily:"monospace", color: t.energy>=8?"#f97316":cssVars.accentPrimary }}>
                    <Zap size={10} />{t.energy}
                  </span>
                  <span style={{ padding:"2px 7px", borderRadius:20, backgroundColor:"rgba(0,180,216,0.08)", color:cssVars.accentPrimary, fontSize:10 }}>{t.source}</span>
                </div>
                <p style={{ marginTop:10, padding:"8px 10px", borderRadius:8, backgroundColor:cssVars.bgHover, fontSize:11, color:cssVars.textSecondary, lineHeight:1.55 }}>{t.reason}</p>
                <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", fontSize:10, color:cssVars.textMuted }}>
                  <span>{t.signalCount} signals detected</span>
                  <span>Detected {t.detectedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
