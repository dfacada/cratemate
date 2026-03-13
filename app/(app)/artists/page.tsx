"use client";
import ArtistMiner from "@/components/artist-miner";
export default function ArtistsPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-primary)", letterSpacing:"-0.02em" }}>Artists</h1>
        <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>Mine artist catalogs for hidden gems and deep cuts.</p>
      </div>
      <ArtistMiner />
    </div>
  );
}
