"use client";
import SetBuilder from "@/components/set-builder";
const A = { t1:"#0f172a", t4:"#64748b" };
export default function SetBuilderPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>Set Builder</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>Arrange your crate tracks into a curated DJ set.</p>
      </div>
      <SetBuilder />
    </div>
  );
}
