"use client";
const cssVars = {
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  accentPrimary: "var(--accent-primary)",
  border: "var(--border)",
  bgSecondary: "var(--bg-secondary)",
  bgHover: "var(--bg-hover)",
};
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
        <h1 style={{ fontSize:22, fontWeight:700, color:cssVars.textPrimary, letterSpacing:"-0.02em" }}>Labels</h1>
        <p style={{ fontSize:13, color:cssVars.textSecondary, marginTop:4 }}>Explore label catalogs and find hidden gems.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {labels.map(l => (
          <div key={l.name} style={{ borderRadius:12, border:`1px solid ${cssVars.border}`, backgroundColor:cssVars.bgSecondary, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, backgroundColor:"rgba(0,180,216,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:cssVars.accentPrimary }}>{l.name[0]}</div>
              <span style={{ fontSize:11, color:cssVars.textMuted }}>{l.founded}</span>
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:cssVars.textPrimary }}>{l.name}</p>
            <p style={{ fontSize:11, color:cssVars.textSecondary, marginTop:2 }}>{l.origin}</p>
            <div style={{ display:"flex", gap:16, marginTop:12 }}>
              <div><p style={{ fontSize:18, fontWeight:700, color:cssVars.textPrimary, lineHeight:1 }}>{l.releases}</p><p style={{ fontSize:10, color:cssVars.textMuted, marginTop:2 }}>releases</p></div>
              <div><p style={{ fontSize:18, fontWeight:700, color:cssVars.accentPrimary, lineHeight:1 }}>{l.gems}</p><p style={{ fontSize:10, color:cssVars.textMuted, marginTop:2 }}>gems</p></div>
            </div>
            <div style={{ marginTop:10, display:"flex", gap:4, flexWrap:"wrap" as const }}>
              {l.genres.map(g => <span key={g} style={{ padding:"2px 7px", borderRadius:20, backgroundColor:cssVars.bgHover, fontSize:10, color:cssVars.textSecondary }}>{g}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
