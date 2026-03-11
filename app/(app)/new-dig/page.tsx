"use client";
import { useState } from "react";
import ScreenshotUpload from "@/components/screenshot-upload";
import OcrReviewTable from "@/components/ocr-review-table";
import PlaylistDNA from "@/components/playlist-dna";
import PlaylistUrlImport from "@/components/playlist-url-import";

const A = { t1:"#0f172a", t4:"#64748b", t5:"#94a3b8", panel:"#fff", border:"#e2e8f0", accent:"#00B4D8" };

type Step = "upload" | "review" | "dna";
type InputMode = "screenshot" | "url";

const STEPS: { key: Step; label: string; num: number }[] = [
  { key:"upload",  label:"Upload",       num:1 },
  { key:"review",  label:"Review",       num:2 },
  { key:"dna",     label:"Playlist DNA", num:3 },
];

export default function NewDigPage() {
  const [step, setStep] = useState<Step>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("screenshot");
  const [processing, setProcessing] = useState(false);

  const handleUpload = (_f: File) => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setStep("review"); }, 2200);
  };

  const handleUrlImported = () => {
    setStep("review");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>New Dig</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>
          Upload a playlist screenshot or paste a Spotify / SoundCloud URL.
        </p>
      </div>

      {/* Step tabs */}
      <div style={{ display:"flex", gap:0, borderRadius:10, border:`1px solid ${A.border}`, backgroundColor:A.panel, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        {STEPS.map((s, i) => {
          const active = step === s.key;
          return (
            <button key={s.key} onClick={() => setStep(s.key)} style={{
              flex:1, padding:"11px 0", fontSize:12, fontWeight:500, border:"none",
              borderRight: i < STEPS.length - 1 ? `1px solid ${A.border}` : "none",
              cursor:"pointer", fontFamily:"inherit",
              backgroundColor: active ? A.accent : "transparent",
              color: active ? "#fff" : A.t5,
              transition:"all 0.15s",
            }}>
              {s.num}. {s.label}
            </button>
          );
        })}
      </div>

      {step === "upload" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Input mode toggle */}
          <div style={{ display:"flex", gap:0, borderRadius:9, border:`1px solid ${A.border}`, backgroundColor:"#f8fafc", overflow:"hidden", alignSelf:"flex-start" }}>
            {(["screenshot", "url"] as InputMode[]).map((mode) => (
              <button key={mode} onClick={() => setInputMode(mode)} style={{
                padding:"7px 20px", fontSize:12, fontWeight:500, border:"none",
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                backgroundColor: inputMode === mode ? "#fff" : "transparent",
                color: inputMode === mode ? A.t1 : A.t5,
                boxShadow: inputMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                borderRadius: 8,
                margin: 2,
              }}>
                {mode === "screenshot" ? "📸  Screenshot" : "🔗  Playlist URL"}
              </button>
            ))}
          </div>

          {inputMode === "screenshot" && (
            <ScreenshotUpload onUpload={handleUpload} processing={processing} />
          )}
          {inputMode === "url" && (
            <PlaylistUrlImport onImported={handleUrlImported} />
          )}
        </div>
      )}

      {step === "review" && (
        <OcrReviewTable onConfirm={() => setStep("dna")} />
      )}
      {step === "dna" && (
        <PlaylistDNA />
      )}
    </div>
  );
}
