"use client";
import { useState } from "react";
import { X, Disc3, ExternalLink, Volume2 } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import PlayButton from "@/components/play-button";

const A = { border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8" };

const PLATFORMS = [
  { id:"yt", label:"YouTube",    color:"#FF0000", href:(a:string,t:string) => `https://www.youtube.com/results?search_query=${enc(a+' '+t)}` },
  { id:"sc", label:"SoundCloud", color:"#FF5500", href:(a:string,t:string) => `https://soundcloud.com/search?q=${enc(a+' '+t)}` },
  { id:"bp", label:"Beatport",   color:"#04BE5B", href:(a:string,t:string) => `https://www.beatport.com/search?q=${enc(a+' '+t)}` },
];
const enc = (s: string) => encodeURIComponent(s);

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      padding:"3px 7px", borderRadius:6, fontFamily:"monospace", fontSize:10, whiteSpace:"nowrap",
      backgroundColor: accent ? "rgba(0,180,216,0.1)" : "#f1f5f9",
      color: accent ? "#00B4D8" : "#64748b",
    }}>{label}</span>
  );
}

export default function PlayerBar() {
  const { currentTrack, isPlaying, isLoading, progress, deezerData, stop } = usePlayer();
  const [hovered, setHovered] = useState<string|null>(null);

  if (!currentTrack) return null;

  const pct = Math.round(progress * 100);
  const elapsed = Math.round(progress * 30);

  return (
    <>
      <div className="player-bar">
        {/* Progress line */}
        <div style={{ height:3, backgroundColor:"#f1f5f9" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(to right,${A.accent},#67e8f9)`, transition:"width 0.2s linear" }} />
        </div>

        {/* Main bar */}
        <div style={{ display:"flex", alignItems:"center", gap:0, height:64 }}>

          {/* Track info */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", flex:"0 0 auto", minWidth:0, maxWidth:260 }}>
            {deezerData?.cover
              ? <img src={deezerData.cover} alt="" style={{ width:38, height:38, borderRadius:7, objectFit:"cover", flexShrink:0 }} />
              : (
                <div style={{ width:38, height:38, borderRadius:7, flexShrink:0, backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isPlaying ? (
                    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:16 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ width:2.5, borderRadius:2, backgroundColor:A.accent, animation:`bar ${0.5+i*0.1}s ease-in-out infinite alternate`, animationDelay:`${i*0.1}s`, height:`${30+i*14}%` }} />
                      ))}
                    </div>
                  ) : <Disc3 size={16} color={A.accent} /> }
                </div>
              )
            }
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:A.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentTrack.title}</p>
              <p style={{ fontSize:11, color:A.t4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentTrack.artist}</p>
            </div>
          </div>

          {/* Play/pause button */}
          <div style={{ padding:"0 6px", flexShrink:0 }}>
            <PlayButton track={currentTrack} size={34} />
          </div>

          {/* Center: time + status (hide on small mobile) */}
          <div className="player-center" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"0 8px", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, backgroundColor:isLoading ? "#f1f5f9" : "rgba(0,180,216,0.08)", border:`1px solid ${isLoading ? A.border : "rgba(0,180,216,0.2)"}`, flexShrink:0 }}>
              <Volume2 size={10} color={isLoading ? A.t5 : A.accent} />
              <span style={{ fontSize:10, fontWeight:600, color:isLoading ? A.t5 : A.accent, letterSpacing:"0.04em" }}>
                {isLoading ? "LOADING…" : `${elapsed}s / 30s`}
              </span>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {currentTrack.bpm    && <Chip label={`${currentTrack.bpm} BPM`} />}
              {currentTrack.key    && <Chip label={currentTrack.key} />}
              {currentTrack.energy && <Chip label={`E${currentTrack.energy}`} accent />}
            </div>
          </div>

          {/* Platform links (desktop only) + close */}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"0 10px", flexShrink:0 }}>
            <div className="platform-links" style={{ display:"flex", gap:4 }}>
              {deezerData?.link && (
                <a href={deezerData.link} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:16, border:`1px solid ${A.border}`, backgroundColor:"#fafafa", textDecoration:"none", fontSize:11, color:A.t4, fontWeight:500, whiteSpace:"nowrap" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#a855f7" }} />
                  Deezer
                </a>
              )}
              {PLATFORMS.map(p => (
                <a key={p.id} href={p.href(currentTrack.artist, currentTrack.title)} target="_blank" rel="noopener noreferrer"
                  onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:16, border:`1.5px solid ${hovered===p.id ? p.color+"55" : A.border}`, backgroundColor:hovered===p.id ? p.color+"10" : "#fafafa", textDecoration:"none", fontSize:11, color:hovered===p.id ? p.color : A.t4, fontWeight:500, whiteSpace:"nowrap", transition:"all 0.12s" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:p.color }} />
                  {p.label}
                </a>
              ))}
            </div>
            <button onClick={stop}
              style={{ width:28, height:28, borderRadius:7, border:`1px solid ${A.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:A.t5, backgroundColor:"transparent", marginLeft:4 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor="#fef2f2"; e.currentTarget.style.color="#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color=A.t5; }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bar { from { transform:scaleY(0.3); } to { transform:scaleY(1); } }

        .player-bar {
          position: fixed;
          bottom: 0;
          left: 224px;
          right: 0;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
          z-index: 39;
        }

        /* Mobile: sits above the bottom nav (56px) */
        @media (max-width: 768px) {
          .player-bar {
            left: 0;
            bottom: 56px;
          }
          .player-center { display: none !important; }
          .platform-links { display: none !important; }
        }
      `}</style>
    </>
  );
}
