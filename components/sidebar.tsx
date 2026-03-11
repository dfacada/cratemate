"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Archive, ListMusic, Users, Tag, Radio, History, Settings, Disc3 } from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Dig", href: "/new-dig", icon: Search },
  { label: "Crates", href: "/crate", icon: Archive },
  { label: "Sets", href: "/set-builder", icon: ListMusic },
  { label: "Artists", href: "/artists", icon: Users },
  { label: "Labels", href: "/labels", icon: Tag },
  { label: "Underground Radar", href: "/radar", icon: Radio },
];
const bottomItems = [
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={{ position:"fixed",inset:"0 auto 0 0",width:224,display:"flex",flexDirection:"column",backgroundColor:"#BCBCC0",borderRight:"1px solid rgba(0,0,0,0.10)",zIndex:40 }}>
      <div style={{ height:56,display:"flex",alignItems:"center",gap:10,padding:"0 16px",borderBottom:"1px solid rgba(0,0,0,0.10)" }}>
        <div style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,backgroundColor:"rgba(212,90,0,0.15)",border:"1px solid rgba(212,90,0,0.25)" }}>
          <Disc3 size={16} style={{ color:"#D45A00" }} />
        </div>
        <span style={{ fontSize:15,fontWeight:600,letterSpacing:"-0.01em",color:"#111112" }}>CrateMate</span>
      </div>

      <nav style={{ flex:1,overflowY:"auto",padding:"16px 0" }}>
        <div style={{ padding:"0 8px",display:"flex",flexDirection:"column",gap:2 }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:6,fontSize:14,color: active ? "#D45A00" : "#3A3A42",backgroundColor: active ? "rgba(212,90,0,0.10)" : "transparent",border: active ? "1px solid rgba(212,90,0,0.18)" : "1px solid transparent",textDecoration:"none",transition:"all 0.15s" }}>
                <Icon size={16} style={{ color: active ? "#D45A00" : "#7A7A84", flexShrink:0 }} />
                {label}
              </Link>
            );
          })}
        </div>
        <div style={{ margin:"12px 16px",borderTop:"1px solid rgba(0,0,0,0.08)" }} />
        <div style={{ padding:"0 8px",display:"flex",flexDirection:"column",gap:2 }}>
          {bottomItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:6,fontSize:14,color:"#7A7A84",textDecoration:"none",transition:"all 0.15s" }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(0,0,0,0.08)" }}>
        <p style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:"#9A9AA4",fontFamily:"monospace" }}>v0.1 beta</p>
      </div>
    </aside>
  );
}
