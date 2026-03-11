"use client";
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Upload, Clipboard, Image, X, Loader2, CheckCircle } from "lucide-react";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

export default function ScreenshotUpload({ onUpload, processing=false }: { onUpload:(f:File)=>void; processing?:boolean }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string|null>(null);
  const [fileName, setFileName] = useState<string|null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onUpload(file);
  }, [onUpload]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(f) handleFile(f); };

  const dzStyle: React.CSSProperties = {
    minHeight:192,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12,border:`2px dashed ${dragging?"#D45A00":"rgba(0,0,0,0.12)"}`,backgroundColor:dragging?"rgba(212,90,0,0.05)":preview?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.03)",transition:"all 0.2s",position:"relative",overflow:"hidden",cursor:"pointer"
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      <div style={dzStyle} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop} onClick={()=>!preview&&ref.current?.click()}>
        {processing ? (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
            <Loader2 size={28} style={{ color:P.accent, animation:"spin 1s linear infinite" }}/>
            <p style={{ fontSize:13,fontWeight:600,color:P.t1 }}>Running OCR…</p>
            <p style={{ fontSize:11,color:P.t5 }}>Extracting track data from your screenshot</p>
          </div>
        ) : preview ? (
          <div style={{ width:"100%",padding:16,position:"relative" }}>
            <img src={preview} alt="Preview" style={{ maxHeight:160,margin:"0 auto",display:"block",borderRadius:8,objectFit:"contain",opacity:0.85 }}/>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:8,fontSize:12,color:P.t4 }}>
              <CheckCircle size={13} style={{ color:"#16A34A" }}/>{fileName}
            </div>
            <button onClick={e=>{e.stopPropagation();setPreview(null);setFileName(null);if(ref.current)ref.current.value="";}} style={{ position:"absolute",top:8,right:8,width:24,height:24,borderRadius:999,backgroundColor:"rgba(0,0,0,0.10)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:P.t3 }}><X size={12}/></button>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:24,textAlign:"center" }}>
            <div style={{ width:44,height:44,borderRadius:10,backgroundColor:"rgba(0,0,0,0.07)",border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Image size={20} style={{ color:P.t4 }}/></div>
            <div>
              <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>Drop screenshot here</p>
              <p style={{ fontSize:11,color:P.t5,marginTop:4 }}>PNG, JPG, WEBP — playlist screenshots, DJ set lists</p>
            </div>
            <button style={{ padding:"6px 16px",borderRadius:6,backgroundColor:"rgba(0,0,0,0.08)",border:`1px solid ${P.border}`,fontSize:12,color:P.t3,cursor:"pointer" }}>Browse Files</button>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" onChange={handleChange} style={{ display:"none" }}/>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t3,cursor:"pointer" }}><Clipboard size={13}/> Paste from Clipboard</button>
        <button onClick={()=>ref.current?.click()} style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t3,cursor:"pointer" }}><Upload size={13}/> Upload File</button>
      </div>
    </div>
  );
}
