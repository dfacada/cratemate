"use client";
import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, Disc3, Music } from "lucide-react";
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

  const query = `${currentTrack.artist} ${currentTrack.title} official`;
  const ytQuery = encodeURIComponent(query);
  const scQuery = encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`);

  // YouTube embed search — works with no API key, auto-plays first result
  const ytSrc = `https://www.youtube.com/embed?listType=search&list=${ytQuery}&autoplay=1&controls=1&modestbranding=1&rel=0&fs=0`;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, height:72, zIndex:50,
      backgroundColor:"#fff", borderTop:"1px solid #e2e8f0",
      boxShadow:"0 -4px 24px rgba(0,0,0,0.07)",
      display:"flex", alignItems:"stretch"
    }}>
      {/* Track info */}
      <div style={{
        width:260, flexShrink:0, borderRight:"1px solid #f1f5f9",
        display:"flex", alignItems:"center", gap:12, padding:"0 16px"
      }}>
        <div style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          backgroundColor:"rgba(0,180,216,0.1)", border:"1px solid rgba(0,180,216,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          {isPlaying ? (
            <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  width:3, borderRadius:2, backgroundColor:"#00B4D8",
                  animation:`playerBar ${0.5+i*0.1}s ease-in-out infinite alternate`,
                  animationDelay:`${i*0.1}s`,
                  height:`${35+i*12}%`
                }} />
              ))}
            </div>
          ) : (
            <Disc3 size={18} color="#00B4D8" />
          )}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {currentTrack.title}
          </p>
          <p style={{ fontSize:11, color:"#64748b", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* YouTube embed */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", backgroundColor:"#f8fafc" }}>
        {!loaded && (
          <div style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", gap:10, backgroundColor:"#f8fafc", zIndex:2
          }}>
            <div style={{
              width:16, height:16, borderRadius:"50%",
              border:"2px solid #e2e8f0", borderTopColor:"#00B4D8",
              animation:"spin 0.7s linear infinite"
            }} />
            <span style={{ fontSize:12, color:"#94a3b8" }}>
              Searching for "{currentTrack.artist} — {currentTrack.title}"…
            </span>
          </div>
        )}
        <iframe
          key={currentTrack.id}
          src={ytSrc}
          style={{
            width:"100%", height:"100%", border:"none",
            opacity: loaded ? 1 : 0,
            transition:"opacity 0.3s"
          }}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Meta chips + links */}
      <div style={{
        width:210, flexShrink:0, borderLeft:"1px solid #f1f5f9",
        display:"flex", alignItems:"center", gap:6, padding:"0 14px"
      }}>
        {currentTrack.bpm && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"#f1f5f9", fontFamily:"monospace", fontSize:10, color:"#64748b", flexShrink:0 }}>
            {currentTrack.bpm} BPM
          </span>
        )}
        {currentTrack.key && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"#f1f5f9", fontFamily:"monospace", fontSize:10, color:"#64748b", flexShrink:0 }}>
            {currentTrack.key}
          </span>
        )}
        {currentTrack.energy && (
          <span style={{ padding:"3px 7px", borderRadius:6, backgroundColor:"rgba(0,180,216,0.1)", fontFamily:"monospace", fontSize:10, color:"#00B4D8", flexShrink:0 }}>
            E{currentTrack.energy}
          </span>
        )}

        <div style={{ marginLeft:"auto", display:"flex", gap:4, flexShrink:0 }}>
          {/* SoundCloud fallback */}
          <a
            href={`https://soundcloud.com/search?q=${scQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Search on SoundCloud"
            style={{
              width:28, height:28, borderRadius:7, display:"flex",
              alignItems:"center", justifyContent:"center",
              color:"#94a3b8", textDecoration:"none", backgroundColor:"transparent",
              border:"1px solid #e2e8f0", fontSize:10, fontWeight:600
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="#fff7ed"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
          >
            SC
          </a>
          {/* YouTube direct */}
          <a
            href={`https://www.youtube.com/results?search_query=${ytQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube"
            style={{
              width:28, height:28, borderRadius:7, display:"flex",
              alignItems:"center", justifyContent:"center",
              color:"#94a3b8", textDecoration:"none", backgroundColor:"transparent",
              border:"1px solid #e2e8f0"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
          >
            <ExternalLink size={12} />
          </a>
          {/* Close */}
          <button
            onClick={stop}
            title="Close player"
            style={{
              width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0",
              cursor:"pointer", display:"flex", alignItems:"center",
              justifyContent:"center", color:"#94a3b8", backgroundColor:"transparent"
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor="#fee2e2"; e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="#fecaca"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.borderColor="#e2e8f0"; }}
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
