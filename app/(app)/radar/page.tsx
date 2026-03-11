"use client";
import RadarCards from "@/components/radar-cards";
const A = { t1:"#0f172a", t4:"#64748b" };
export default function RadarPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>Underground Radar</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>AI-powered signal detection across SoundCloud, Bandcamp, and DJ charts.</p>
      </div>
      <RadarCards />
    </div>
  );
}
