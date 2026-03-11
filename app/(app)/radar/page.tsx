import RadarCards from "@/components/radar-cards";
import { Radio, Activity, TrendingUp } from "lucide-react";
import { mockRadarTracks } from "@/data/mockCrate";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };
const avg = Math.round(mockRadarTracks.reduce((a,t)=>a+t.undergroundScore,0)/mockRadarTracks.length);
const total = mockRadarTracks.reduce((a,t)=>a+t.signalCount,0);

export default function RadarPage() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Underground Radar</h1>
          <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>Real-time signal detection across SoundCloud, Bandcamp, and DJ charts</p>
        </div>
        <span style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:999,border:"1px solid rgba(212,90,0,0.25)",backgroundColor:"rgba(212,90,0,0.08)",fontSize:12,fontWeight:600,color:P.accent }}>
          <span style={{ width:6,height:6,borderRadius:"50%",backgroundColor:P.accent }}/>Live
        </span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {[
          {icon:Radio,label:"Tracks on radar",value:mockRadarTracks.length,color:"#D45A00",bg:"rgba(212,90,0,0.10)"},
          {icon:Activity,label:"Total signals",value:total.toLocaleString(),color:"#D97706",bg:"rgba(217,119,6,0.10)"},
          {icon:TrendingUp,label:"Avg underground score",value:avg,color:"#7C3AED",bg:"rgba(124,58,237,0.10)"},
        ].map(({icon:Icon,label,value,color,bg})=>(
          <div key={label} style={{ display:"flex",alignItems:"center",gap:12,borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ width:32,height:32,borderRadius:8,backgroundColor:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon size={15} style={{ color }}/></div>
            <div>
              <p style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>{value}</p>
              <p style={{ fontSize:11,color:P.t5,marginTop:2 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
      <RadarCards/>
    </div>
  );
}
