"use client";
import { useState } from "react";
import { Link2, Image, AlignLeft, Users, ArrowRight, Loader2 } from "lucide-react";
import ScreenshotUpload from "@/components/screenshot-upload";
import OcrReviewTable from "@/components/ocr-review-table";
import PlaylistDNA from "@/components/playlist-dna";
import ArtistMiner from "@/components/artist-miner";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };
type Mode = "paste_link"|"screenshot"|"paste_tracklist"|"artist";

const MODES = [
  {id:"paste_link" as Mode,icon:Link2,label:"Paste Playlist",desc:"Drop a Spotify, SoundCloud, or Mixcloud URL to extract and analyze the set",color:"#2563EB",bg:"rgba(37,99,235,0.08)",border:"rgba(37,99,235,0.18)"},
  {id:"screenshot" as Mode,icon:Image,label:"Upload Screenshot",desc:"Upload a screenshot of a playlist, Rekordbox export, or any DJ set image",color:"#D45A00",bg:"rgba(212,90,0,0.08)",border:"rgba(212,90,0,0.18)"},
  {id:"paste_tracklist" as Mode,icon:AlignLeft,label:"Paste Track List",desc:"Paste a raw list of Artist — Track entries and let AI parse and enrich them",color:"#D97706",bg:"rgba(217,119,6,0.08)",border:"rgba(217,119,6,0.18)"},
  {id:"artist" as Mode,icon:Users,label:"Start From Artist",desc:"Choose an artist and mine their full discography oldest → newest",color:"#7C3AED",bg:"rgba(124,58,237,0.08)",border:"rgba(124,58,237,0.18)"},
];

export default function NewDigPage() {
  const [mode, setMode] = useState<Mode|null>(null);
  const [url, setUrl] = useState("");
  const [tracklist, setTracklist] = useState("");
  const [ocrDone, setOcrDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const analyze = async () => { setAnalyzing(true); await new Promise(r=>setTimeout(r,1400)); setAnalyzing(false); setAnalyzed(true); };
  const handleUpload = async () => { setProcessing(true); await new Promise(r=>setTimeout(r,2000)); setProcessing(false); setOcrDone(true); };

  return (
    <div style={{ maxWidth:800,margin:"0 auto",display:"flex",flexDirection:"column",gap:20 }}>
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>New Dig</h1>
        <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>Choose how you want to start building your crate</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        {MODES.map(({id,icon:Icon,label,desc,color,bg,border})=>(
          <button key={id} onClick={()=>setMode(id===mode?null:id)} style={{ display:"flex",flexDirection:"column",gap:12,padding:20,borderRadius:12,border:`1px solid ${mode===id?border:P.border}`,backgroundColor:mode===id?bg:P.panel,textAlign:"left",cursor:"pointer",position:"relative",transition:"all 0.15s" }}>
            {mode===id&&<div style={{ position:"absolute",top:12,right:12,width:20,height:20,borderRadius:"50%",backgroundColor:color,display:"flex",alignItems:"center",justifyContent:"center" }}><ArrowRight size={11} style={{ color:"white" }}/></div>}
            <div style={{ width:40,height:40,borderRadius:10,backgroundColor:bg,border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon size={18} style={{ color }}/></div>
            <div>
              <p style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>{label}</p>
              <p style={{ fontSize:12,color:P.t4,marginTop:4,lineHeight:1.5 }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {mode==="paste_link"&&(
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:20,display:"flex",flexDirection:"column",gap:14 }}>
          <h2 style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>Paste Playlist URL</h2>
          <div style={{ display:"flex",gap:8 }}>
            <div style={{ position:"relative",flex:1 }}>
              <Link2 size={14} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:P.t5 }}/>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://open.spotify.com/playlist/…" style={{ width:"100%",height:38,paddingLeft:32,paddingRight:12,borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:13,color:P.t1,outline:"none" }}/>
            </div>
            <button onClick={analyze} disabled={!url||analyzing} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.20)",fontSize:13,fontWeight:600,color:P.accent,cursor:"pointer" }}>
              {analyzing?<Loader2 size={14}/>:<ArrowRight size={14}/>}Analyze
            </button>
          </div>
          {analyzed&&<><p style={{ fontSize:12,color:"#16A34A" }}>✓ Playlist extracted · 12 tracks found</p><PlaylistDNA/></>}
        </div>
      )}

      {mode==="screenshot"&&(
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:20,display:"flex",flexDirection:"column",gap:14 }}>
          <h2 style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>Upload Screenshot</h2>
          <ScreenshotUpload onUpload={handleUpload} processing={processing}/>
          {ocrDone&&<OcrReviewTable/>}
        </div>
      )}

      {mode==="paste_tracklist"&&(
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:20,display:"flex",flexDirection:"column",gap:14 }}>
          <h2 style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>Paste Track List</h2>
          <p style={{ fontSize:12,color:P.t5 }}>One track per line: "Artist — Track", "Artist - Track [Label]"</p>
          <textarea value={tracklist} onChange={e=>setTracklist(e.target.value)} rows={8} placeholder={"Rampa — Keinemusik\nHot Natured — Amber\nTrikk — Body Talk [Tsuba]"} style={{ width:"100%",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.04)",padding:12,fontFamily:"monospace",fontSize:12,color:P.t1,outline:"none",resize:"none" }}/>
          <div style={{ display:"flex",justifyContent:"flex-end" }}>
            <button onClick={analyze} disabled={!tracklist.trim()||analyzing} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.20)",fontSize:13,fontWeight:600,color:P.accent,cursor:"pointer" }}>
              {analyzing&&<Loader2 size={13}/>}Parse & Analyze
            </button>
          </div>
          {analyzed&&<OcrReviewTable/>}
        </div>
      )}

      {mode==="artist"&&(
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:20 }}>
          <ArtistMiner/>
        </div>
      )}
    </div>
  );
}
