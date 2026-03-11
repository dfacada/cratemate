"use client";
import { useState, useEffect } from "react";
import { Plus, ExternalLink, ArrowUpDown, Gem, Loader2 } from "lucide-react";
import { gemScoreColor } from "@/lib/utils";
import { mockArtists, mockCatalogEntries } from "@/data/mockArtists";
import { ArtistCatalogEntry } from "@/types/artist";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };
type FilterMode = "all"|"originals"|"remixes"|"collaborations"|"hidden_gems";
const FILTERS: {label:string;value:FilterMode}[] = [{label:"All",value:"all"},{label:"Originals",value:"originals"},{label:"Remixes",value:"remixes"},{label:"Collabs",value:"collaborations"},{label:"Hidden Gems",value:"hidden_gems"}];

export default function ArtistMiner({ defaultArtistId="a001", onAddToCrate }: { defaultArtistId?:string; onAddToCrate?:(e:ArtistCatalogEntry)=>void }) {
  const [artistId, setArtistId] = useState(defaultArtistId);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortDesc, setSortDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ArtistCatalogEntry[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const artist = mockArtists.find(a=>a.id===artistId);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let r = mockCatalogEntries.filter(e=>e.artistId===artistId);
      if (filter==="originals") r=r.filter(e=>!e.isRemix&&!e.isCollaboration);
      if (filter==="remixes") r=r.filter(e=>e.isRemix);
      if (filter==="collaborations") r=r.filter(e=>e.isCollaboration);
      if (filter==="hidden_gems") r=r.filter(e=>e.gemScore>=85);
      setEntries([...r].sort((a,b)=>sortDesc?b.year-a.year:a.year-b.year));
      setLoading(false);
    }, 400);
  }, [artistId, filter, sortDesc]);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
        {mockArtists.slice(0,4).map(a => (
          <button key={a.id} onClick={()=>setArtistId(a.id)} style={{ padding:"6px 14px",borderRadius:999,fontSize:12,fontWeight:600,border:`1px solid ${artistId===a.id?"rgba(212,90,0,0.25)":P.border}`,backgroundColor:artistId===a.id?"rgba(212,90,0,0.10)":"rgba(0,0,0,0.05)",color:artistId===a.id?P.accent:P.t3,cursor:"pointer" }}>{a.name}</button>
        ))}
      </div>

      {artist && (
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <h3 style={{ fontSize:16,fontWeight:700,color:P.t1,margin:0 }}>{artist.name}</h3>
            <p style={{ fontSize:12,color:P.t4,marginTop:4 }}>{artist.origin} · Active since {artist.activeFrom}</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:8 }}>
              {artist.genres.map(g=><span key={g} style={{ fontSize:10,padding:"2px 8px",borderRadius:999,backgroundColor:"rgba(0,0,0,0.07)",color:P.t4 }}>{g}</span>)}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>{artist.trackCount}</p>
            <p style={{ fontSize:10,color:P.t5 }}>tracks</p>
            <p style={{ fontSize:18,fontWeight:700,color:P.accent,marginTop:4 }}>{artist.gemTracks}</p>
            <p style={{ fontSize:10,color:P.t5 }}>gems</p>
          </div>
        </div>
      )}

      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
        <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
          {FILTERS.map(f=>(
            <button key={f.value} onClick={()=>setFilter(f.value)} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:6,fontSize:12,border:"none",backgroundColor:filter===f.value?"rgba(0,0,0,0.10)":"transparent",color:filter===f.value?P.t1:P.t4,cursor:"pointer",fontWeight:filter===f.value?600:400 }}>
              {f.value==="hidden_gems"&&<Gem size={11}/>}{f.label}
            </button>
          ))}
        </div>
        <button onClick={()=>setSortDesc(d=>!d)} style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:6,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",fontSize:12,color:P.t3,cursor:"pointer" }}>
          <ArrowUpDown size={12}/>{sortDesc?"Newest First":"Oldest First"}
        </button>
      </div>

      <div style={{ borderRadius:12,border:`1px solid ${P.border}`,overflow:"hidden" }}>
        {loading ? (
          <div style={{ height:160,display:"flex",alignItems:"center",justifyContent:"center" }}><Loader2 size={20} style={{ color:P.accent }}/></div>
        ) : entries.length===0 ? (
          <div style={{ height:160,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:P.t5 }}>No tracks found</div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Year","Track","Label","Cat#","BPM","Gem Score",""].map(h=>(
                  <th key={h} style={{ padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,borderBottom:`1px solid ${P.border}`,backgroundColor:P.panel }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e,i)=>{
                const isAdded = addedIds.has(e.id);
                return (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${P.border}`,backgroundColor:i%2===0?P.panel:"rgba(0,0,0,0.025)" }}>
                    <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:12,color:P.t4 }}>{e.year}</td>
                    <td style={{ padding:"10px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:P.t1 }}>{e.title}</span>
                        {e.isRemix&&<span style={{ fontSize:9,padding:"1px 5px",borderRadius:3,backgroundColor:"rgba(139,92,246,0.10)",color:"#7C3AED",fontWeight:700 }}>REMIX</span>}
                        {e.isCollaboration&&<span style={{ fontSize:9,padding:"1px 5px",borderRadius:3,backgroundColor:"rgba(59,130,246,0.10)",color:"#2563EB",fontWeight:700 }}>COLLAB</span>}
                      </div>
                    </td>
                    <td style={{ padding:"10px 16px",fontSize:12,color:P.t4 }}>{e.label}</td>
                    <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:11,color:P.t5 }}>{e.catalogNumber??"—"}</td>
                    <td style={{ padding:"10px 16px",fontFamily:"monospace",fontSize:12,color:P.t4 }}>{e.bpm??"—"}</td>
                    <td style={{ padding:"10px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <div style={{ width:40,height:5,borderRadius:999,backgroundColor:"rgba(0,0,0,0.10)",overflow:"hidden" }}>
                          <div style={{ height:"100%",borderRadius:999,backgroundColor:P.accent,width:`${e.gemScore}%` }}/>
                        </div>
                        <span style={{ fontFamily:"monospace",fontSize:12,fontWeight:700,color:gemScoreColor(e.gemScore) }}>{e.gemScore}</span>
                      </div>
                    </td>
                    <td style={{ padding:"10px 16px" }}>
                      <div style={{ display:"flex",gap:4 }}>
                        <button onClick={()=>{setAddedIds(p=>new Set([...p,e.id]));onAddToCrate?.(e);}} disabled={isAdded} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:5,fontSize:11,fontWeight:600,border:`1px solid ${isAdded?"rgba(212,90,0,0.22)":P.border}`,backgroundColor:isAdded?"rgba(212,90,0,0.10)":"rgba(0,0,0,0.05)",color:isAdded?P.accent:P.t3,cursor:"pointer" }}>
                          <Plus size={11}/>{isAdded?"Added":"Add"}
                        </button>
                        <button style={{ width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:5,border:`1px solid ${P.border}`,backgroundColor:"rgba(0,0,0,0.05)",cursor:"pointer",color:P.t5 }}><ExternalLink size={11}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
