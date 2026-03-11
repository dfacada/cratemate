"use client";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Tag, Activity, Zap } from "lucide-react";
import { PlaylistDNA as T } from "@/types/playlist";

const P = { panel:"#C8C8CC", border:"rgba(0,0,0,0.09)", t1:"#111112", t2:"#3A3A42", t4:"#7A7A84", t5:"#9A9AA4", accent:"#D45A00" };

const mockDNA: T = {
  topArtists: [{name:"Rampa",count:4},{name:"Ivory (IT)",count:3},{name:"Hot Natured",count:3},{name:"Trikk",count:2},{name:"&ME",count:2}],
  topLabels: [{name:"Keinemusik",count:5},{name:"Visionquest",count:3},{name:"Tsuba",count:2},{name:"Pets Recordings",count:2},{name:"Innervisions",count:2}],
  bpmCluster: {min:117,max:126,avg:121,dominant:120},
  energyProfile: [4,5,5,6,6,7,7,8,8,9,8,7,6],
  genres: [{name:"Deep House",weight:0.45},{name:"Tech House",weight:0.28},{name:"Melodic House",weight:0.17},{name:"Minimal",weight:0.1}],
  keyDistribution: [],
  undergroundRatio: 0.78,
  estimatedEra: "2014–2022",
  mood: ["hypnotic","warm","late-night","melodic"],
};

const energyData = mockDNA.energyProfile.map((e,i)=>({i,energy:e}));

export default function PlaylistDNA({ dna=mockDNA }: { dna?: T }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {[
          {icon:Users,label:"Artists Detected",items:dna.topArtists.slice(0,3).map(a=>({name:a.name,val:a.count}))},
          {icon:Tag,label:"Labels Detected",items:dna.topLabels.slice(0,3).map(l=>({name:l.name,val:l.count}))},
        ].map(({icon:Icon,label,items})=>(
          <div key={label} style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon size={14} style={{ color:P.accent }}/></div>
              <span style={{ fontSize:11,fontWeight:600,color:P.t4 }}>{label}</span>
            </div>
            {items.map(({name,val})=>(
              <div key={name} style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:12,color:P.t2 }}>{name}</span>
                <span style={{ fontFamily:"monospace",fontSize:11,color:P.t5 }}>{val}</span>
              </div>
            ))}
          </div>
        ))}

        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <div style={{ width:28,height:28,borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",display:"flex",alignItems:"center",justifyContent:"center" }}><Activity size={14} style={{ color:P.accent }}/></div>
            <span style={{ fontSize:11,fontWeight:600,color:P.t4 }}>BPM Cluster</span>
          </div>
          <p style={{ fontSize:28,fontWeight:700,color:P.t1,margin:0 }}>{dna.bpmCluster.dominant}</p>
          <p style={{ fontSize:11,color:P.t5,marginTop:4 }}>Range: {dna.bpmCluster.min}–{dna.bpmCluster.max}</p>
          <div style={{ height:4,borderRadius:999,backgroundColor:"rgba(0,0,0,0.10)",marginTop:10,overflow:"hidden" }}>
            <div style={{ height:"100%",borderRadius:999,backgroundColor:P.accent,width:`${((dna.bpmCluster.avg-dna.bpmCluster.min)/(dna.bpmCluster.max-dna.bpmCluster.min))*100}%` }}/>
          </div>
        </div>

        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <div style={{ width:28,height:28,borderRadius:6,backgroundColor:"rgba(212,90,0,0.10)",display:"flex",alignItems:"center",justifyContent:"center" }}><Zap size={14} style={{ color:P.accent }}/></div>
            <span style={{ fontSize:11,fontWeight:600,color:P.t4 }}>Energy Profile</span>
          </div>
          <div style={{ height:56 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D45A00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D45A00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="energy" stroke="#D45A00" strokeWidth={2} fill="url(#eg)" dot={false}/>
                <Tooltip contentStyle={{ background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,fontSize:11 }} itemStyle={{ color:P.accent }} labelFormatter={()=>""}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize:10,color:P.t5,marginTop:4 }}>Peak: {Math.max(...dna.energyProfile)}/10</p>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
          <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,marginBottom:12 }}>Genre Tags</p>
          {dna.genres.map(g=>(
            <div key={g.name} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12 }}>
                <span style={{ color:P.t2 }}>{g.name}</span>
                <span style={{ fontFamily:"monospace",color:P.t5 }}>{Math.round(g.weight*100)}%</span>
              </div>
              <div style={{ height:4,borderRadius:999,backgroundColor:"rgba(0,0,0,0.10)",overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:999,backgroundColor:P.accent,width:`${g.weight*100}%` }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderRadius:12,border:`1px solid ${P.border}`,backgroundColor:P.panel,padding:16 }}>
          <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:P.t5,marginBottom:12 }}>Set Mood</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:16 }}>
            {dna.mood.map(m=><span key={m} style={{ fontSize:11,padding:"4px 10px",borderRadius:999,border:"1px solid rgba(212,90,0,0.20)",backgroundColor:"rgba(212,90,0,0.08)",color:P.accent }}>{m}</span>)}
          </div>
          <div style={{ borderTop:`1px solid ${P.border}`,paddingTop:12,display:"flex",flexDirection:"column",gap:8 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
              <span style={{ color:P.t5 }}>Estimated Era</span>
              <span style={{ color:P.t2,fontWeight:600 }}>{dna.estimatedEra}</span>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
              <span style={{ color:P.t5 }}>Underground Ratio</span>
              <span style={{ color:P.accent,fontWeight:700 }}>{Math.round(dna.undergroundRatio*100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
