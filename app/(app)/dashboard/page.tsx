import Link from "next/link";
import { Search, Archive, Disc3, Radio, TrendingUp, Gem, ArrowRight, Zap } from "lucide-react";
import { mockTracks } from "@/data/mockTracks";
import { mockCrates } from "@/data/mockCrate";
import { mockRadarTracks } from "@/data/mockCrate";

const A = { bg:"#F0F4F8", panel:"#ffffff", border:"#e2e8f0", t1:"#0f172a", t2:"#1e293b", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", accentBg:"rgba(0,180,216,0.09)", accentBorder:"rgba(0,180,216,0.2)" };

const statCards = [
  { label:"Tracks Catalogued", value:"1,284", icon:Disc3, color:"#00B4D8", bg:"rgba(0,180,216,0.1)" },
  { label:"Active Crates", value:"7", icon:Archive, color:"#3B82F6", bg:"rgba(59,130,246,0.1)" },
  { label:"Radar Signals", value:"48", icon:Radio, color:"#F59E0B", bg:"rgba(245,158,11,0.1)" },
  { label:"Gems Found", value:"93", icon:Gem, color:"#8B5CF6", bg:"rgba(139,92,246,0.1)" },
];

const card = { borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" };

export default function DashboardPage() {
  const recentTracks = mockTracks.slice(0, 5);
  const topCrate = mockCrates[0];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>Good evening, DJ</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>You have {mockRadarTracks.filter(t=>t.undergroundScore>=85).length} high-signal radar hits waiting.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {statCards.map(({ label, value, icon:Icon, color, bg }) => (
          <div key={label} style={card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, backgroundColor:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={15} color={color} />
              </div>
              <TrendingUp size={13} color={A.t5} />
            </div>
            <p style={{ fontSize:26, fontWeight:700, color:A.t1, lineHeight:1 }}>{value}</p>
            <p style={{ fontSize:12, color:A.t4, marginTop:4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { label:"New Dig", href:"/new-dig", icon:Search, desc:"Start a new crate session" },
          { label:"Open Radar", href:"/radar", icon:Radio, desc:"Scan underground signals" },
          { label:"Build Set", href:"/set-builder", icon:Disc3, desc:"Arrange your crate into a set" },
        ].map(({ label, href, icon:Icon, desc }) => (
          <Link key={href} href={href} style={{ display:"flex", alignItems:"center", gap:12, ...card, textDecoration:"none" }}>
            <div style={{ width:36, height:36, borderRadius:8, backgroundColor:A.accentBg, border:`1px solid ${A.accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={16} color={A.accent} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:A.t1 }}>{label}</p>
              <p style={{ fontSize:11, color:A.t4, marginTop:2 }}>{desc}</p>
            </div>
            <ArrowRight size={14} color={A.t5} style={{ flexShrink:0 }} />
          </Link>
        ))}
      </div>

      {/* Recent finds + Active Crate */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16 }}>
        <div style={card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:600, color:A.t2 }}>Recent Finds</p>
            <Link href="/crate" style={{ fontSize:12, color:A.accent, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>View crate <ArrowRight size={11} /></Link>
          </div>
          {recentTracks.map((t) => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:`1px solid ${A.border}` }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:500, color:A.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.artist}</p>
                <p style={{ fontSize:11, color:A.t4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</p>
              </div>
              <span style={{ fontSize:12, color:A.t4, fontFamily:"monospace", flexShrink:0 }}>{t.label}</span>
              <span style={{ fontSize:12, color:A.t5, fontFamily:"monospace", flexShrink:0 }}>{t.bpm}</span>
              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                <Zap size={11} color="#00B4D8" />
                <span style={{ fontSize:12, color:A.t4 }}>{t.energy}</span>
              </div>
              {t.gemScore && <span style={{ fontSize:12, fontWeight:600, color:A.accent, fontFamily:"monospace", flexShrink:0 }}>{t.gemScore}</span>}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:600, color:A.t2 }}>Active Crate</p>
              <Link href="/crate" style={{ fontSize:12, color:A.accent, textDecoration:"none" }}>Open →</Link>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, backgroundColor:A.accentBg, border:`1px solid ${A.accentBorder}` }}>
              <div style={{ width:28, height:28, borderRadius:6, backgroundColor:topCrate.color+"20", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Archive size={13} color={topCrate.color} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:A.t1 }}>{topCrate.name}</p>
                <p style={{ fontSize:11, color:A.t4 }}>{topCrate.trackIds.length} tracks · Avg {topCrate.avgBpm} BPM</p>
              </div>
            </div>
            <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" as const }}>
              {(topCrate.tags ?? []).map(tag => (
                <span key={tag} style={{ padding:"3px 8px", borderRadius:20, backgroundColor:"#f1f5f9", fontSize:11, color:A.t4 }}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:A.t5, marginBottom:10 }}>Top Radar Hit</p>
            {mockRadarTracks.slice(0,1).map(t => (
              <div key={t.id}>
                <p style={{ fontSize:14, fontWeight:700, color:A.accent }}>{t.artist}</p>
                <p style={{ fontSize:12, color:A.t3 }}>{t.title}</p>
                <p style={{ fontSize:11, color:A.t4, marginTop:6, lineHeight:1.5 }}>{t.reason.slice(0, 80)}…</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
