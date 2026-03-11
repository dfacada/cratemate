"use client";
import { useState } from "react";
import ScreenshotUpload from "@/components/screenshot-upload";
import OcrReviewTable from "@/components/ocr-review-table";
import PlaylistDNA from "@/components/playlist-dna";
const A = { t1:"#0f172a", t4:"#64748b", panel:"#fff", border:"#e2e8f0", accent:"#00B4D8" };
type Step = "upload" | "review" | "dna";
export default function NewDigPage() {
  const [step, setStep] = useState<Step>("upload");
  const [processing, setProcessing] = useState(false);
  const handleUpload = (f: File) => { setProcessing(true); setTimeout(() => { setProcessing(false); setStep("review"); }, 2000); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>New Dig</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>Upload a playlist screenshot to extract and analyse tracks.</p>
      </div>
      <div style={{ display:"flex", gap:0, borderRadius:10, border:`1px solid ${A.border}`, backgroundColor:A.panel, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", marginBottom:4 }}>
        {(["upload","review","dna"] as Step[]).map((s, i) => (
          <button key={s} onClick={() => setStep(s)}
            style={{ flex:1, padding:"11px 0", fontSize:12, fontWeight:500, border:"none", borderRight: i<2 ? `1px solid ${A.border}` : "none", cursor:"pointer", fontFamily:"inherit", backgroundColor: step===s ? A.accent : "transparent", color: step===s ? "#fff" : A.t4, transition:"all 0.15s" }}>
            {i+1}. {s==="upload"?"Upload":"review"===s?"Review":"Playlist DNA"}
          </button>
        ))}
      </div>
      {step==="upload" && <ScreenshotUpload onUpload={handleUpload} processing={processing} />}
      {step==="review" && <OcrReviewTable onConfirm={() => setStep("dna")} />}
      {step==="dna" && <PlaylistDNA />}
    </div>
  );
}
