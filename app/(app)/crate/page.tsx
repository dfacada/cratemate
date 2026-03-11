"use client";
import CrateTable from "@/components/crate-table";
const A = { t1:"#0f172a", t4:"#64748b" };
export default function CratePage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>Crates</h1>
        <p style={{ fontSize:13, color:A.t4, marginTop:4 }}>Your saved tracks and active crate sessions.</p>
      </div>
      <CrateTable />
    </div>
  );
}
