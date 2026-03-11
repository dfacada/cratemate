"use client";
const A = { t1:"#0f172a", t4:"#64748b", panel:"#fff", border:"#e2e8f0", t3:"#334155", t5:"#94a3b8", accent:"#00B4D8" };
const labels = [
  { name:"Keinemusik", origin:"Berlin", founded:2008, releases:120, gems:18, genres:["Deep House","Melodic Techno"] },
  { name:"Innervisions", origin:"Berlin", founded:2006, releases:85, gems:24, genres:["Deep House","Minimal"] },
  { name:"Visionquest", origin:"Detroit", founded:2010, releases:60, gems:12, genres:["Tech House","Deep House"] },
  { name:"Tsuba", origin:"London", founded:2004, releases:95, gems:15, genres:["Deep House","Nu-Disco"] },
  { name:"Pets Recordings", origin:"Barcelona", founded:2005, releases:75, gems:10, genres:["Tech House","Minimal"] },
  { name:"Hot Natured Records", origin:"London", founded:2012, releases:40, gems:8, genres:["Melodic House","Deep House"] },
];
export default function LabelsPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>Labels</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>Explore label catalogs and find hidden gems.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {labels.map(l => (
          <div key={l.name} style={{ borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, backgroundColor:"rgba(0,180,216,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:A.accent }}>{l.name[0]}</div>
              <span style={{ fontSize:11, color:A.t5 }}>{l.founded}</span>
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:A.t1 }}>{l.name}</p>
            <p style={{ fontSize:11, color:A.t4, marginTop:2 }}>{l.origin}</p>
            <div style={{ display:"flex", gap:16, marginTop:12 }}>
              <div><p style={{ fontSize:18, fontWeight:700, color:A.t1, lineHeight:1 }}>{l.releases}</p><p style={{ fontSize:10, color:A.t5, marginTop:2 }}>releases</p></div>
              <div><p style={{ fontSize:18, fontWeight:700, color:A.accent, lineHeight:1 }}>{l.gems}</p><p style={{ fontSize:10, color:A.t5, marginTop:2 }}>gems</p></div>
            </div>
            <div style={{ marginTop:10, display:"flex", gap:4, flexWrap:"wrap" as const }}>
              {l.genres.map(g => <span key={g} style={{ padding:"2px 7px", borderRadius:20, backgroundColor:"#f1f5f9", fontSize:10, color:A.t4 }}>{g}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
