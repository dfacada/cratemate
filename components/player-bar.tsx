"use client";
import { useState } from "react";
import { X, Disc3, ExternalLink, Volume2 } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import PlayButton from "@/components/play-button";

const A = { border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", bgBase:"#f8fafc" };

const PLATFORMS = [
  { id:"youtube",    label:"YouTube",    color:"#FF0000", href:(a:string,t:string) => `https://www.youtube.com/results?search_query=${enc(a+' '+t)}` },
  { id:"soundcloud", label:"SoundCloud", color:"#FF5500", href:(a:string,t:string) => `https://soundcloud.com/search?q=${enc(a+' '+t)}` },
  { id:"beatport",   label:"Beatport",   color:"#04BE5B", href:(a:string,t:string) => `https://www.beatport.com/search?q=${enc(a+' '+t)}` },
];
const enc = (s: string) => encodeURIComponent(s);

export default function PlayerBar() {
  const { currentTrack, isPlaying, isLoading, progress, deezerData, stop } = usePlayer();
  const [hovered, setHovered] = useState<string|null>(null);

  if (!currentTrack) return null;

  const pct = Math.round(progress * 100);

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:50,
      backgroundColor:"#fff", borderTop:`1px solid ${A.border}`,
      boxShadow:"0 -4px 24px rgba(0,0,0,0.07)",
      display:"flex", flexDirection:"column",
    }}>
      {/* Progress bar */}
      <div style={{ height:3, backgroundColor:"#f1f5f9", position:"relative" }}>
        <div style={{
          position:"absolute", left:0, top:0, height:"100%",
          width:`${pct}%`,
          background:`linear-gradient(to right, ${A.accent}, #67e8f9)`,
          transition:"width 0.25s linear",
        }} />
      </div>

      <div style={{ height:64, display:"flex", alignItems:"stretch" }}>

        {/* Track info + play/pause */}
        <div style={{ width:300, flexShrink:0, borderRight:`1px solid #f1f5f9`, display:"flex", alignItems:"center", gap:12, padding:"0 16px" }}>
          {/* Album art or animated bars */}
          {deezerData?.cover ? (
            <img src={deezerData.cover} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover", flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }} />
          ) : (
            <div style={{ width:40, height:40, borderRadius:8, flexShrink:0, backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isPlaying ? (
                <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:18 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ width:3, borderRadius:2, backgroundColor:A.accent, animation:`playerBar ${0.5+i*0.1}s ease-in-out infinite alternate`, animationDelay:`${i*0.1}s`, height:`${30+i*14}%` }} />
                  ))}
                </div>
              ) : (
                <Disc3 size={17} color={A.accent} />
              )}
            </div>
          )}

          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:13, fontWeight:600, color:A.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentTrack.title}</p>
            <p style={{ fontSize:11, color:A.t4, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {currentTrack.artist}{currentTrack.label ? ` · ${currentTrack.label}` : ""}
            </p>
          </div>

          <PlayButton track={currentTrack} size={32} />
        </div>

        {/* Center: preview label + progress + chips */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:16, padding:"0 20px" }}>
          {/* Preview badge */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, backgroundColor:isLoading ? "#f1f5f9" : "rgba(0,180,216,0.08)", border:`1px solid ${isLoading ? A.border : "rgba(0,180,216,0.2)"}` }}>
            <Volume2 size={11} color={isLoading ? A.t5 : A.accent} />
            <span style={{ fontSize:10, fontWeight:600, color:isLoading ? A.t5 : A.accent, letterSpacing:"0.04em" }}>
              {isLoading ? "LOADING…" : "30s PREVIEW"}
            </span>
          </div>

          {/* Progress time */}
          <span style={{ fontFamily:"monospace", fontSize:11, color:A.t5 }}>
            {Math.round(progress * 30)}s / 30s
          </span>

          {/* BPM / Key / Energy chips */}
          <div style={{ display:"flex", gap:5 }}>
            {currentTrack.bpm && <Chip label={`${currentTrack.bpm} BPM`} />}
            {currentTrack.key && <Chip label={currentTrack.key} />}
            {currentTrack.energy && <Chip label={`E${currentTrack.energy}`} accent />}
          </div>
        </div>

        {/* Right: platform links + close */}
        <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:6, padding:"0 14px", borderLeft:"1px solid #f1f5f9" }}>
          {/* Deezer link if we have one */}
          {deezerData?.link && (
            <a href={deezerData.link} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:16, border:`1px solid ${A.border}`, backgroundColor:"#fafafa", textDecoration:"none", fontSize:11, color:A.t4, fontWeight:500, transition:"all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.color = "#a855f7"; e.currentTarget.style.backgroundColor = "#faf5ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.color = A.t4; e.currentTarget.style.backgroundColor = "#fafafa"; }}
            >
              <div style={{ width:12, height:12, borderRadius:"50%", backgroundColor:"#a855f7", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <ExternalLink size={7} color="#fff" />
              </div>
              Deezer
            </a>
          )}

          {PLATFORMS.map(p => (
            <a key={p.id} href={p.href(currentTrack.artist, currentTrack.title)} target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:16, border:`1.5px solid ${hovered===p.id ? p.color+"55" : A.border}`, backgroundColor:hovered===p.id ? p.color+"10" : "#fafafa", textDecoration:"none", fontSize:11, color:hovered===p.id ? p.color : A.t4, fontWeight:500, transition:"all 0.12s" }}
            >
              <div style={{ width:12, height:12, borderRadius:"50%", backgroundColor:p.color, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <ExternalLink size={7} color="#fff" />
              </div>
              {p.label}
            </a>
          ))}

          <button onClick={stop}
            style={{ width:28, height:28, borderRadius:7, border:`1px solid ${A.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:A.t5, backgroundColor:"transparent", marginLeft:4, transition:"all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor="#fef2f2"; e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="#fecaca"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color=A.t5; e.currentTarget.style.borderColor=A.border; }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes playerBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      padding:"3px 8px", borderRadius:6, fontFamily:"monospace", fontSize:10,
      backgroundColor: accent ? "rgba(0,180,216,0.1)" : "#f1f5f9",
      color: accent ? "#00B4D8" : "#64748b",
    }}>{label}</span>
  );
}
