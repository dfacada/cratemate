"use client";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Tag, Activity, Zap } from "lucide-react";
import { PlaylistDNA as PlaylistDNAType } from "@/types/playlist";

const A = { panel:"#fff", border:"#e2e8f0", t1:"#0f172a", t3:"#334155", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", bgBase:"#f8fafc" };
const card: React.CSSProperties = { borderRadius:12, border:`1px solid ${A.border}`, backgroundColor:A.panel, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" };

const mockDNA: PlaylistDNAType = {
  topArtists: [{ name:"Rampa", count:4 }, { name:"Ivory (IT)", count:3 }, { name:"Hot Natured", count:3 }, { name:"Trikk", count:2 }, { name:"&ME", count:2 }],
  topLabels: [{ name:"Keinemusik", count:5 }, { name:"Visionquest", count:3 }, { name:"Tsuba", count:2 }, { name:"Pets Recordings", count:2 }, { name:"Innervisions", count:2 }],
  bpmCluster: { min:117, max:126, avg:121, dominant:120 },
  energyProfile: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 8, 7, 6],
  genres: [{ name:"Deep House", weight:0.45 }, { name:"Tech House", weight:0.28 }, { name:"Melodic House", weight:0.17 }, { name:"Minimal", weight:0.1 }],
  keyDistribution: [],
  undergroundRatio: 0.78,
  estimatedEra: "2014–2022",
  mood: ["hypnotic", "warm", "late-night", "melodic"],
};

const energyData = mockDNA.energyProfile.map((energy, i) => ({ i, energy }));

function StatCard({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"rgba(0,180,216,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={13} color={A.accent} />
        </div>
        <span style={{ fontSize:11, fontWeight:500, color:A.t4 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ height:5, borderRadius:20, backgroundColor:"#f1f5f9", overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:20, background:`linear-gradient(to right, ${A.accent}, #67e8f9)`, width:`${(value/max)*100}%`, transition:"width 0.4s" }} />
    </div>
  );
}

export default function PlaylistDNA({ dna = mockDNA }: { dna?: PlaylistDNAType }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Top 4 stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard icon={Users} label="Top Artists">
          {dna.topArtists.slice(0,3).map(a => (
            <div key={a.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:A.t3 }}>{a.name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, marginLeft:10 }}>
                <MiniBar value={a.count} max={Math.max(...dna.topArtists.map(x=>x.count))} />
                <span style={{ fontFamily:"monospace", fontSize:10, color:A.t5, flexShrink:0 }}>{a.count}</span>
              </div>
            </div>
          ))}
          <span style={{ fontSize:10, color:A.t5, marginTop:4, display:"block" }}>+{dna.topArtists.length - 3} more</span>
        </StatCard>

        <StatCard icon={Tag} label="Top Labels">
          {dna.topLabels.slice(0,3).map(l => (
            <div key={l.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:A.t3 }}>{l.name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, marginLeft:10 }}>
                <MiniBar value={l.count} max={Math.max(...dna.topLabels.map(x=>x.count))} />
                <span style={{ fontFamily:"monospace", fontSize:10, color:A.t5, flexShrink:0 }}>{l.count}</span>
              </div>
            </div>
          ))}
          <span style={{ fontSize:10, color:A.t5, marginTop:4, display:"block" }}>+{dna.topLabels.length - 3} more</span>
        </StatCard>

        <StatCard icon={Activity} label="BPM Cluster">
          <p style={{ fontSize:34, fontWeight:800, color:A.t1, lineHeight:1, letterSpacing:"-0.03em" }}>{dna.bpmCluster.dominant}</p>
          <p style={{ fontSize:11, color:A.t5, marginTop:4 }}>Range {dna.bpmCluster.min}–{dna.bpmCluster.max} BPM</p>
          <div style={{ marginTop:12, height:5, borderRadius:20, backgroundColor:"#f1f5f9", overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", left:`${((dna.bpmCluster.avg - dna.bpmCluster.min) / (dna.bpmCluster.max - dna.bpmCluster.min))*100}%`, transform:"translateX(-50%)", width:"30%", height:"100%", background:`linear-gradient(to right, ${A.accent}, #67e8f9)`, borderRadius:20 }} />
          </div>
        </StatCard>

        <StatCard icon={Zap} label="Energy Profile">
          <div style={{ height:64 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={A.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={A.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="energy" stroke={A.accent} strokeWidth={2} fill="url(#eg)" dot={false} />
                <Tooltip contentStyle={{ background:"#fff", border:`1px solid ${A.border}`, borderRadius:8, fontSize:11, padding:"4px 8px" }} itemStyle={{ color:A.accent }} labelFormatter={() => ""} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize:10, color:A.t5, marginTop:4 }}>Peak: {Math.max(...dna.energyProfile)}/10</p>
        </StatCard>
      </div>

      {/* Genres + Mood */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div style={card}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:A.t5, marginBottom:14 }}>Genre Breakdown</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {dna.genres.map(g => (
              <div key={g.name}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, color:A.t3 }}>{g.name}</span>
                  <span style={{ fontFamily:"monospace", fontSize:11, color:A.t5 }}>{Math.round(g.weight*100)}%</span>
                </div>
                <div style={{ height:6, borderRadius:20, backgroundColor:"#f1f5f9", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:20, background:`linear-gradient(to right, ${A.accent}, #67e8f9)`, width:`${g.weight*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:A.t5, marginBottom:14 }}>Set Character</p>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6, marginBottom:16 }}>
            {dna.mood.map(m => (
              <span key={m} style={{ padding:"5px 12px", borderRadius:20, backgroundColor:"rgba(0,180,216,0.08)", border:"1px solid rgba(0,180,216,0.18)", fontSize:12, color:A.accent }}>{m}</span>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${A.border}`, paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label:"Estimated Era", value:dna.estimatedEra },
              { label:"Underground Ratio", value:`${Math.round(dna.undergroundRatio*100)}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:A.t5 }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:600, color:A.t1 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
