import SetBuilder from "@/components/set-builder";

const P = { t1:"#111112", t4:"#7A7A84" };
export default function SetBuilderPage() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,color:P.t1,margin:0 }}>Set Builder</h1>
        <p style={{ fontSize:13,color:P.t4,marginTop:4 }}>Arrange your crate into a structured DJ set with AI-assisted arc building</p>
      </div>
      <SetBuilder/>
    </div>
  );
}
