"use client";
import { useState } from "react";
import { Music, CheckCircle, AlertCircle, Loader2, ArrowRight, X } from "lucide-react";

const A = { panel:"#fff", border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", bgBase:"#f8fafc" };

type Platform = "spotify" | "soundcloud" | null;
type ImportState = "idle" | "validating" | "fetching" | "done" | "error";

// Simulated parse results keyed by platform
const SIMULATED_RESULTS: Record<string, { name: string; trackCount: number; owner: string; duration: string }> = {
  spotify: { name: "Late Night Selects", trackCount: 24, owner: "spotify:user", duration: "2h 48m" },
  soundcloud: { name: "Deep Digging Vol. 3", trackCount: 18, owner: "sc:user", duration: "2h 06m" },
};

function detectPlatform(url: string): Platform {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("soundcloud.com")) return "soundcloud";
  return null;
}

function isValidPlaylistUrl(url: string): boolean {
  return (
    /spotify\.com\/(playlist|album)\/[a-zA-Z0-9]+/.test(url) ||
    /soundcloud\.com\/[^/]+\/(sets|likes)/.test(url) ||
    /soundcloud\.com\/[^/]+$/.test(url)
  );
}

const PLATFORM_META: Record<string, { color: string; bg: string; border: string; name: string }> = {
  spotify:    { color:"#1DB954", bg:"#f0fdf4", border:"#bbf7d0", name:"Spotify" },
  soundcloud: { color:"#FF5500", bg:"#fff4f0", border:"#fed7aa", name:"SoundCloud" },
};

const STATUS_STEPS = [
  { key:"validating", label:"Validating URL…" },
  { key:"fetching",   label:"Fetching playlist…" },
  { key:"done",       label:"Tracks imported" },
];

export default function PlaylistUrlImport({ onImported }: { onImported: () => void }) {
  const [url, setUrl]               = useState("");
  const [platform, setPlatform]     = useState<Platform>(null);
  const [state, setState]           = useState<ImportState>("idle");
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<typeof SIMULATED_RESULTS.spotify | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setError(null);
    setState("idle");
    setResult(null);
    setPlatform(detectPlatform(val));
  };

  const handleImport = async () => {
    setError(null);
    const detected = detectPlatform(url);
    if (!detected) { setError("Paste a Spotify or SoundCloud playlist URL to continue."); return; }
    if (!isValidPlaylistUrl(url)) { setError("That doesn't look like a playlist URL. Make sure it's a playlist or set link."); return; }

    // Step 1: validating
    setState("validating"); setCurrentStep(0);
    await delay(900);

    // Step 2: fetching
    setState("fetching"); setCurrentStep(1);
    await delay(1400);

    // Step 3: done
    setState("done"); setCurrentStep(2);
    setResult(SIMULATED_RESULTS[detected]);
  };

  const meta = platform ? PLATFORM_META[platform] : null;
  const inputBorder = error ? "#fca5a5" : platform ? (meta?.color + "55") : A.border;
  const inputBg     = error ? "#fff8f8"  : platform ? meta?.bg             : "#fafafa";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* URL input card */}
      <div style={{ borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize:14, fontWeight:600, color:A.t1, marginBottom:6 }}>Paste a playlist URL</p>
        <p style={{ fontSize:12, color:A.t5, marginBottom:16, lineHeight:1.5 }}>
          Works with Spotify playlists &amp; albums and SoundCloud sets.<br />
          We'll pull the track list, match metadata, and build your crate.
        </p>

        {/* Input row */}
        <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
          <div style={{ flex:1, position:"relative" }}>
            {/* Platform pill inside input */}
            {platform && meta && (
              <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:20, backgroundColor:meta.bg, border:`1px solid ${meta.border}`, zIndex:1 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:meta.color }} />
                <span style={{ fontSize:10, fontWeight:600, color:meta.color, whiteSpace:"nowrap" }}>{meta.name}</span>
              </div>
            )}
            <input
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && state === "idle" && handleImport()}
              placeholder="https://open.spotify.com/playlist/… or https://soundcloud.com/…"
              style={{
                width:"100%", height:44, paddingLeft: platform ? 90 : 14, paddingRight:36,
                borderRadius:9, border:`1.5px solid ${inputBorder}`,
                backgroundColor:inputBg, fontSize:13, color:A.t1,
                fontFamily:"inherit", outline:"none", transition:"all 0.15s",
                boxSizing:"border-box",
              }}
            />
            {url && (
              <button onClick={() => handleUrlChange("")}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", border:"none", backgroundColor:"transparent", cursor:"pointer", color:A.t5, padding:0, display:"flex" }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleImport}
            disabled={!url || state !== "idle"}
            style={{
              display:"flex", alignItems:"center", gap:8, padding:"0 20px",
              borderRadius:9, border:"none", cursor: (!url || state !== "idle") ? "not-allowed" : "pointer",
              backgroundColor: (!url || state !== "idle") ? "#e2e8f0" : A.accent,
              color: (!url || state !== "idle") ? A.t5 : "#fff",
              fontSize:13, fontWeight:500, fontFamily:"inherit",
              transition:"all 0.15s", flexShrink:0, whiteSpace:"nowrap",
            }}
          >
            {state === "idle" ? <><ArrowRight size={15} /> Import</> : <><Loader2 size={15} style={{ animation:"spin 0.7s linear infinite" }} /> Working…</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, padding:"8px 12px", borderRadius:8, backgroundColor:"#fef2f2", border:"1px solid #fecaca" }}>
            <AlertCircle size={13} color="#ef4444" style={{ flexShrink:0 }} />
            <span style={{ fontSize:12, color:"#dc2626" }}>{error}</span>
          </div>
        )}

        {/* Progress steps */}
        {state !== "idle" && state !== "error" && (
          <div style={{ marginTop:16, display:"flex", gap:0 }}>
            {STATUS_STEPS.map((s, i) => {
              const isDone = currentStep > i || state === "done";
              const isActive = currentStep === i && state !== "done";
              return (
                <div key={s.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                    {i > 0 && <div style={{ flex:1, height:2, backgroundColor: isDone ? A.accent : "#e2e8f0", transition:"background 0.4s" }} />}
                    <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${isDone ? A.accent : isActive ? A.accent : "#e2e8f0"}`, backgroundColor: isDone ? A.accent : "#fff", transition:"all 0.3s" }}>
                      {isDone
                        ? <CheckCircle size={12} color="#fff" style={{ fill:"none" }} />
                        : isActive
                        ? <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:A.accent, animation:"pulse 1s ease-in-out infinite" }} />
                        : <div style={{ width:6, height:6, borderRadius:"50%", backgroundColor:"#e2e8f0" }} />
                      }
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div style={{ flex:1, height:2, backgroundColor: isDone ? A.accent : "#e2e8f0", transition:"background 0.4s" }} />}
                  </div>
                  <span style={{ fontSize:10, color: isDone || isActive ? A.t3 : A.t5, fontWeight: isActive ? 500 : 400, textAlign:"center" }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result card */}
      {state === "done" && result && (
        <div style={{ borderRadius:12, border:`1.5px solid ${A.accent}30`, backgroundColor:"#f0fdff", padding:20, boxShadow:"0 2px 12px rgba(0,180,216,0.08)", animation:"fadeIn 0.3s ease" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:48, height:48, borderRadius:12, backgroundColor: meta?.bg, border:`1px solid ${meta?.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Music size={22} color={meta?.color} />
              </div>
              <div>
                <p style={{ fontSize:16, fontWeight:700, color:A.t1 }}>{result.name}</p>
                <div style={{ display:"flex", gap:12, marginTop:5, fontSize:12, color:A.t4 }}>
                  <span>📀 {result.trackCount} tracks</span>
                  <span>⏱ {result.duration}</span>
                  <span style={{ padding:"2px 8px", borderRadius:20, backgroundColor:meta?.bg, color:meta?.color, fontWeight:500, fontSize:11 }}>{meta?.name}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onImported}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 20px", borderRadius:9, border:"none", backgroundColor:A.accent, color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", flexShrink:0, boxShadow:"0 2px 8px rgba(0,180,216,0.25)" }}>
              Review Tracks <ArrowRight size={14} />
            </button>
          </div>

          {/* Track preview list */}
          <div style={{ marginTop:16, borderTop:`1px solid ${A.accent}25`, paddingTop:14 }}>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:A.t5, marginBottom:10 }}>Track Preview</p>
            {PREVIEW_TRACKS[platform!]?.map((t, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"7px 0", borderBottom: i < 4 ? `1px solid ${A.accent}15` : "none" }}>
                <span style={{ fontFamily:"monospace", fontSize:11, color:A.t5, width:18, textAlign:"right", flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:A.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.artist}</p>
                  <p style={{ fontSize:11, color:A.t4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</p>
                </div>
                <span style={{ fontSize:11, color:A.t5, fontFamily:"monospace", flexShrink:0 }}>{t.label}</span>
              </div>
            ))}
            {(result.trackCount - 5) > 0 && (
              <p style={{ fontSize:12, color:A.t5, paddingTop:8 }}>+{result.trackCount - 5} more tracks</p>
            )}
          </div>
        </div>
      )}

      {/* Example URLs helper */}
      {state === "idle" && (
        <div style={{ display:"flex", gap:10 }}>
          {EXAMPLE_URLS.map(ex => (
            <button key={ex.label} onClick={() => handleUrlChange(ex.url)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:9, border:`1px solid ${A.border}`, backgroundColor:A.panel, fontSize:12, color:A.t4, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s", boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.backgroundColor = A.bgBase; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.backgroundColor = A.panel; }}>
              <span>{ex.icon}</span>
              <span style={{ color: A.t5, fontSize:10 }}>Try example:</span>
              <span style={{ fontFamily:"monospace", fontSize:11 }}>{ex.label}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(0.85); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const EXAMPLE_URLS = [
  { icon:"🎵", label:"Spotify playlist", url:"https://open.spotify.com/playlist/37i9dQZF1DXa8NOjJyZOf8" },
  { icon:"☁️", label:"SoundCloud set",  url:"https://soundcloud.com/djkoze/sets/amygdala" },
];

const PREVIEW_TRACKS: Record<string, { artist: string; title: string; label: string }[]> = {
  spotify: [
    { artist: "Bicep", title: "Glue", label: "Feel My Bicep" },
    { artist: "DJ Koze", title: "XTC", label: "Pampa Records" },
    { artist: "Tale Of Us", title: "Goa", label: "Afterlife" },
    { artist: "Dixon", title: "Polymorphic Swing", label: "Innervisions" },
    { artist: "Âme", title: "Rej", label: "Innervisions" },
  ],
  soundcloud: [
    { artist: "DJ Koze", title: "Pick Up (feat. José González)", label: "Pampa Records" },
    { artist: "Âme", title: "Fiori", label: "Innervisions" },
    { artist: "Bicep", title: "Aura", label: "Feel My Bicep" },
    { artist: "Solomun", title: "Kackvogel", label: "Diynamic" },
    { artist: "Henrik Schwarz", title: "Do You Know", label: "Innervisions" },
  ],
};
