import ArtistMiner from "@/components/artist-miner";
import { mockArtists } from "@/data/mockArtists";
import { Users, MapPin, Disc3 } from "lucide-react";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

export default function ArtistsPage() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Artists</h1>
        <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>Browse and mine artist catalogs oldest → newest</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {mockArtists.map(a=>(
          <div key={a.id} style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,rgba(212,90,0,0.15),rgba(212,90,0,0.05))",border:"1px solid rgba(212,90,0,0.20)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
              <span style={{ fontSize:12,fontWeight:700,color:P.accent }}>{a.name.slice(0,2).toUpperCase()}</span>
            </div>
            <h3 style={{ fontSize:14,fontWeight:700,color:P.t1,margin:0 }}>{a.name}</h3>
            <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:P.t5,marginTop:4 }}><MapPin size={11}/>{a.origin}</div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:12 }}>
              <span style={{ display:"flex",alignItems:"center",gap:4,fontSize:12,color:P.t4 }}><Disc3 size={12}/>{a.trackCount} tracks</span>
              <span style={{ fontSize:12,fontWeight:700,color:P.accent }}>{a.gemTracks} gems</span>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:10 }}>
              {a.genres.slice(0,2).map(g=><span key={g} style={{ fontSize:9,padding:"2px 7px",borderRadius:999,backgroundColor:"rgba(0,0,0,0.07)",color:P.t4 }}>{g}</span>)}
              {a.labels.slice(0,1).map(l=><span key={l} style={{ fontSize:9,padding:"2px 7px",borderRadius:999,backgroundColor:"rgba(212,90,0,0.08)",color:P.accent }}>{l}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:20 }}>
        <h2 style={{ display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:700,color:P.t1,marginBottom:16 }}>
          <Users size={15} style={{ color:P.accent }}/>Artist Catalog Miner
        </h2>
        <ArtistMiner/>
      </div>
    </div>
  );
}
