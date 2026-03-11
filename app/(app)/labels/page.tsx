import { Tag, Disc3, TrendingUp } from "lucide-react";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

const LABELS = [
  { name:"Keinemusik",releases:47,artists:["Rampa","&ME","Adam Port"],genres:["Melodic","Deep House"],country:"DE",founded:2009 },
  { name:"Visionquest",releases:38,artists:["Seth Troxler","Ryan Crosson","Ivory (IT)"],genres:["Deep House","Techno"],country:"US",founded:2010 },
  { name:"Tsuba",releases:62,artists:["Trikk","Lake People","tINI"],genres:["Minimal","Deep House"],country:"UK",founded:2004 },
  { name:"Innervisions",releases:89,artists:["Dixon","Âme","DJ Koze"],genres:["Deep House","Electronica"],country:"DE",founded:2006 },
  { name:"Pampa Records",releases:31,artists:["DJ Koze","Apparat","Caribou"],genres:["Deep House","Electronica"],country:"DE",founded:2011 },
  { name:"Pets Recordings",releases:41,artists:["Trikk","Ivory (IT)","Borrowed Identity"],genres:["Minimal","Deep House"],country:"UK",founded:2012 },
];

export default function LabelsPage() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Labels</h1>
        <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>Explore labels and discover their rosters</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {LABELS.map(l=>(
          <div key={l.name} style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:8,backgroundColor:"rgba(212,90,0,0.10)",border:"1px solid rgba(212,90,0,0.18)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Tag size={15} style={{ color:P.accent }}/>
              </div>
              <span style={{ fontSize:9,fontFamily:"monospace",padding:"2px 7px",borderRadius:999,border:`1px solid ${P.border}`,color:P.t5 }}>{l.country} · {l.founded}</span>
            </div>
            <h3 style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>{l.name}</h3>
            <div style={{ display:"flex",gap:12,marginTop:8,fontSize:12,color:P.t4 }}>
              <span style={{ display:"flex",alignItems:"center",gap:4 }}><Disc3 size={11}/>{l.releases}</span>
              <span style={{ display:"flex",alignItems:"center",gap:4 }}><TrendingUp size={11}/>{l.artists.length} artists</span>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:10 }}>
              {l.genres.map(g=><span key={g} style={{ fontSize:9,padding:"2px 7px",borderRadius:999,backgroundColor:"rgba(0,0,0,0.07)",color:P.t4 }}>{g}</span>)}
            </div>
            <p style={{ fontSize:11,color:P.t5,marginTop:10,borderTop:`1px solid ${P.border}`,paddingTop:8 }}>{l.artists.join(" · ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
