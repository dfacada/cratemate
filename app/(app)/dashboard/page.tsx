import Link from "next/link";
import { Search, Archive, Disc3, Radio, TrendingUp, Clock, Gem, ArrowRight, Zap } from "lucide-react";
import { mockTracks } from "@/data/mockTracks";
import { mockCrates } from "@/data/mockCrate";
import { mockRadarTracks } from "@/data/mockCrate";

const P = { base:"#DCDCDF", panel:"#C8C8CC", panel2:"#BCBCC0", accent:"#D45A00", accentLight:"rgba(212,90,0,0.10)", accentBorder:"rgba(212,90,0,0.20)", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t3:"#5A5A64", t4:"#7A7A84", t5:"#9A9AA4" };

const statCards = [
  { label:"Tracks Catalogued", value:"1,284", icon:Disc3, color:"#D45A00", bg:"rgba(212,90,0,0.10)" },
  { label:"Active Crates", value:"7", icon:Archive, color:"#3B82F6", bg:"rgba(59,130,246,0.10)" },
  { label:"Radar Signals", value:"48", icon:Radio, color:"#F59E0B", bg:"rgba(245,158,11,0.10)" },
  { label:"Gems Found", value:"93", icon:Gem, color:"#8B5CF6", bg:"rgba(139,92,246,0.10)" },
];

export default function DashboardPage() {
  const recentTracks = mockTracks.slice(0,5);
  const topCrate = mockCrates[0];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Good evening, DJ</h1>
        <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>You have {mockRadarTracks.filter(t=>t.undergroundScore>=85).length} high-signal radar hits waiting.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {statCards.map(({ label,value,icon:Icon,color,bg }) => (
          <div key={label} style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ width:32,height:32,borderRadius:8,backgroundColor:bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <TrendingUp size={14} style={{ color:P.t5 }} />
            </div>
            <p style={{ fontSize:26,fontWeight:700,color:P.t1,margin:0,lineHeight:1 }}>{value}</p>
            <p style={{ fontSize:12,color:P.t4,marginTop:4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {[
          { label:"New Dig", href:"/new-dig", icon:Search, desc:"Start a new crate session" },
          { label:"Open Radar", href:"/radar", icon:Radio, desc:"Scan underground signals" },
          { label:"Build Set", href:"/set-builder", icon:Disc3, desc:"Arrange your crate into a set" },
        ].map(({ label,href,icon:Icon,desc }) => (
          <Link key={href} href={href} style={{ display:"flex",alignItems:"center",gap:12,padding:16,borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,textDecoration:"none",transition:"all 0.15s" }}>
            <div style={{ width:36,height:36,borderRadius:8,backgroundColor:"rgba(0,0,0,0.07)",border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Icon size={16} style={{ color:P.t3 }} />
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>{label}</p>
              <p style={{ fontSize:11,color:P.t4,marginTop:2 }}>{desc}</p>
            </div>
            <ArrowRight size={14} style={{ color:P.t5,flexShrink:0 }} />
          </Link>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"3fr 2fr",gap:16 }}>
        {/* Recent tracks */}
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,overflow:"hidden" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${P.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Clock size={14} style={{ color:P.t4 }} />
              <span style={{ fontSize:13,fontWeight:600,color:P.t1 }}>Recent Finds</span>
            </div>
            <Link href="/crate" style={{ fontSize:12,color:P.accent,textDecoration:"none" }}>View crate →</Link>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <tbody>
              {recentTracks.map(track => (
                <tr key={track.id} style={{ borderBottom:`1px solid ${P.border}` }}>
                  <td style={{ padding:"12px 16px" }}>
                    <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>{track.artist}</p>
                    <p style={{ fontSize:12,color:P.t4,marginTop:2 }}>{track.title}</p>
                  </td>
                  <td style={{ padding:"12px 16px",fontSize:12,color:P.t4 }}>{track.label}</td>
                  <td style={{ padding:"12px 16px",fontFamily:"monospace",fontSize:12,color:P.t3 }}>{track.bpm}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ display:"flex",alignItems:"center",gap:4,fontSize:12,color:P.accent,fontFamily:"monospace" }}>
                      <Zap size={12} />{track.energy}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px",textAlign:"right",fontFamily:"monospace",fontSize:12,fontWeight:700,color:P.accent }}>{track.gemScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active crate */}
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <span style={{ fontSize:13,fontWeight:600,color:P.t1 }}>Active Crate</span>
            <Link href="/crate" style={{ fontSize:12,color:P.accent,textDecoration:"none" }}>Open →</Link>
          </div>
          <div style={{ borderRadius:8,padding:12,marginBottom:12,backgroundColor:`${topCrate.color}14`,border:`1px solid ${topCrate.color}30` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Archive size={14} style={{ color:topCrate.color,flexShrink:0 }} />
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:P.t1,margin:0 }}>{topCrate.name}</p>
                <p style={{ fontSize:11,color:P.t4,marginTop:2 }}>{topCrate.trackIds.length} tracks · Avg {topCrate.avgBpm} BPM</p>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
            {(topCrate.tags??[]).map(tag => (
              <span key={tag} style={{ fontSize:10,padding:"2px 8px",borderRadius:999,border:`1px solid ${P.border}`,color:P.t4 }}>{tag}</span>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${P.border}`,paddingTop:12 }}>
            <p style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,marginBottom:8 }}>Top Radar Hit</p>
            {mockRadarTracks.slice(0,1).map(t => (
              <div key={t.id} style={{ borderRadius:8,padding:12,backgroundColor:"rgba(212,90,0,0.08)",border:"1px solid rgba(212,90,0,0.18)" }}>
                <p style={{ fontSize:13,fontWeight:600,color:P.accent,margin:0 }}>{t.artist}</p>
                <p style={{ fontSize:12,color:"#C45000",marginTop:2 }}>{t.title}</p>
                <p style={{ fontSize:11,color:P.t4,marginTop:6 }}>{t.reason.slice(0,60)}…</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
