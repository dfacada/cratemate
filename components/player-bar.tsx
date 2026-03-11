"use client";
import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, Disc3 } from "lucide-react";
import { usePlayer } from "@/context/player-context";

export default function PlayerBar() {
  const { currentTrack, isPlaying, stop } = usePlayer();
  const [loaded, setLoaded] = useState(false);
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (currentTrack?.id !== prevId.current) {
      setLoaded(false);
      prevId.current = currentTrack?.id ?? null;
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const q = encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`);
  const scSrc = `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/search/sounds%3Fq%3D${q}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&color=%2300B4D8&buying=false&liking=false&download=false&sharing=false`;

  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, height:72, zIndex:50, backgroundColor:"#fff", borderTop:"1px solid #e2e8f0", boxShadow:"0 -4px 24px rgba(0,0,0,0.07)", display:"flex", alignItems:"stretch" }}>

      {/* Track info panel */}
      <div style={{ width:260, flexShrink:0, borderRight:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12, padding:"0 16px" }}>
        <div style={{ width:40, height:40, borderRadius:10, backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {isPlaying ? (
            <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width:3, borderRadius:2, backgroundColor:"#00B4D8", animation:`playerBar ${0.6+i*0.1}s ease-in-out infinite alternate`, height:`${40+i*15}%`, animationDelay:`${i*0.12}s` }} />
              ))}
            </div>
          ) : (
            <Disc3 size={18} color="#00B4D8" />
          )}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentTrack.title}</p>
          <p style={{ fontSize:11, color:"#64748b", margin:0, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentTrack.artist}</p>
        </div>
      </div>

      {/* SoundCloud widget */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        {!loaded && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", gap:10, backgroundColor:"#fff", zIndex:2 }}>
            <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid #e2e8f0", borderTopColor:"#00B4D8", animation:"spin 0.7s linear infinite" }} />
            <span style={{ fontSize:12, color:"#94a3b8" }}>Finding "{currentTrack.artist} — {currentTrack.title}" on SoundCloud…</span>
          </div>
        )}
        <iframe
          key={currentTrack.id}
          src={scSrc}
          style={{ width:"100%", height:"100%", border:"none", opacity: loaded ? 1 : 0, transition:"opacity 0.3s" }}
          allow="autoplay"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Meta + close */}
      <div style={{ width:200, flexShrink:0, borderLeft:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:8, padding:"0 14px" }}>
        {currentTrack.bpm && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"#f1f5f9", fontFamily:"monospace", fontSize:10, color:"#64748b" }}>{currentTrack.bpm} BPM</span>
        )}
        {currentTrack.key && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"#f1f5f9", fontFamily:"monospace", fontSize:10, color:"#64748b" }}>{currentTrack.key}</span>
        )}
        {currentTrack.energy && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"rgba(0,180,216,0.1)", fontFamily:"monospace", fontSize:10, color:"#00B4D8" }}>E{currentTrack.energy}</span>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          <a href={`https://soundcloud.com/search?q=${q}`} target="_blank" rel="noopener noreferrer"
            style={{ width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", textDecoration:"none" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
            <ExternalLink size={13} />
          </a>
          <button onClick={stop}
            style={{ width:28, height:28, borderRadius:7, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", backgroundColor:"transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color="#94a3b8"; }}>
            <X size={13} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes playerBar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
