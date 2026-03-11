"use client";
import { useState } from "react";
import { Edit2, Trash2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { confidenceLabel } from "@/lib/utils";
import { mockOcrTracks } from "@/data/mockTracks";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

interface OcrRow { id:string; rawText:string; artist:string; title:string; label:string; year:number; confidence:number; verified:boolean; }

export default function OcrReviewTable({ tracks=mockOcrTracks as OcrRow[], onConfirm }: { tracks?: OcrRow[]; onConfirm?: (t:OcrRow[])=>void }) {
  const [rows, setRows] = useState<OcrRow[]>(tracks);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editData, setEditData] = useState<Partial<OcrRow>>({});

  const low = rows.filter(r=>confidenceLabel(r.confidence)==="low").length;

  const ConfBadge = ({v}:{v:number}) => {
    const l = confidenceLabel(v);
    const pct = Math.round(v*100);
    const color = l==="high"?"#16A34A":l==="medium"?"#D97706":"#DC2626";
    const Icon = l==="high"?CheckCircle:l==="medium"?AlertTriangle:XCircle;
    return <span style={{ display:"flex",alignItems:"center",gap:4,fontFamily:"monospace",fontSize:11,color }}><Icon size={12}/>{pct}%</span>;
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>OCR Extraction Review</p>
          <p style={{ fontSize:12,color:P.t4,marginTop:2 }}>{rows.length} tracks detected{low>0&&<span style={{ color:"#D97706",marginLeft:8 }}>· {low} need review</span>}</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>rows.forEach(r=>r.confidence<0.8&&setRows(p=>p.map(x=>x.id===r.id?{...x,confidence:Math.min(1,x.confidence+0.15)}:x)))} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t4,cursor:"pointer" }}>
            <RefreshCw size={12}/> Re-run OCR
          </button>
          <button onClick={()=>onConfirm?.(rows)} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.20)",fontSize:12,fontWeight:600,color:P.accent,cursor:"pointer" }}>
            <CheckCircle size={12}/> Confirm
          </button>
        </div>
      </div>
      <div style={{ borderRadius:12,border:`1px solid ${P.border}`,overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["#","Artist","Track","Label","Year","Confidence",""].map(h=>(
                <th key={h} style={{ padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,borderBottom:`1px solid ${P.border}`,backgroundColor:P.panel }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row,i)=>{
              const level = confidenceLabel(row.confidence);
              const isEditing = editingId===row.id;
              return (
                <tr key={row.id} style={{ borderBottom:`1px solid ${P.border}`,backgroundColor:level==="low"?"rgba(220,38,38,0.05)":i%2===0?P.panel:"rgba(0,0,0,0.02)" }}>
                  <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:11,color:P.t5 }}>{i+1}</td>
                  <td style={{ padding:"10px 16px" }}>
                    {isEditing ? <input value={editData.artist??""} onChange={e=>setEditData({...editData,artist:e.target.value})} style={{ width:"100%",padding:"4px 8px",borderRadius:4,border:`1px solid ${P.border}`,backgroundColor:"white",fontSize:12,color:P.t1 }}/> : <span style={{ fontSize:13,fontWeight:600,color:P.t1 }}>{row.artist}</span>}
                  </td>
                  <td style={{ padding:"10px 16px" }}>
                    {isEditing ? <input value={editData.title??""} onChange={e=>setEditData({...editData,title:e.target.value})} style={{ width:"100%",padding:"4px 8px",borderRadius:4,border:`1px solid ${P.border}`,backgroundColor:"white",fontSize:12,color:P.t1 }}/> : <span style={{ fontSize:13,color:P.t2 }}>{row.title}</span>}
                  </td>
                  <td style={{ padding:"10px 16px",fontSize:12,color:P.t4 }}>{row.label}</td>
                  <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:11,color:P.t5 }}>{row.year}</td>
                  <td style={{ padding:"10px 16px" }}><ConfBadge v={row.confidence}/></td>
                  <td style={{ padding:"10px 16px" }}>
                    <div style={{ display:"flex",gap:4,justifyContent:"flex-end" }}>
                      {isEditing ? (
                        <button onClick={()=>{setRows(p=>p.map(r=>r.id===row.id?{...r,...editData,verified:true,confidence:Math.max(r.confidence,0.95)}:r));setEditingId(null);}} style={{ padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:600,color:P.accent,border:"none",backgroundColor:"rgba(212,90,0,0.10)",cursor:"pointer" }}>Save</button>
                      ) : (
                        <>
                          <button onClick={()=>{setEditingId(row.id);setEditData({artist:row.artist,title:row.title});}} style={{ width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,border:"none",backgroundColor:"transparent",cursor:"pointer",color:P.t5 }}><Edit2 size={12}/></button>
                          <button onClick={()=>setRows(p=>p.filter(r=>r.id!==row.id))} style={{ width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,border:"none",backgroundColor:"transparent",cursor:"pointer",color:"#DC2626" }}><Trash2 size={12}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
