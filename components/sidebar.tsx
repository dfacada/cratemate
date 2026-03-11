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

const C = {
  sidebar: { position:"fixed" as const, top:0, left:0, bottom:0, width:224, zIndex:40, display:"flex", flexDirection:"column" as const, backgroundColor:"#fff", borderRight:"1px solid #e2e8f0", boxShadow:"1px 0 0 0 #f1f5f9" },
  logo: { display:"flex", alignItems:"center", gap:10, height:56, borderBottom:"1px solid #f1f5f9", padding:"0 16px", flexShrink:0 },
  logoIcon: { width:28, height:28, borderRadius:8, backgroundColor:"rgba(0,180,216,0.12)", border:"1px solid rgba(0,180,216,0.25)", display:"flex", alignItems:"center", justifyContent:"center" },
  nav: { flex:1, overflowY:"auto" as const, padding:"12px 8px" },
  divider: { height:1, backgroundColor:"#f1f5f9", margin:"8px 16px" },
  bottom: { padding:"12px 8px 8px", borderTop:"1px solid #f1f5f9" },
  version: { padding:"8px 12px", fontSize:10, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase" as const, color:"#cbd5e1" },
};

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={C.sidebar}>
      <div style={C.logo}>
        <div style={C.logoIcon}><Disc3 size={15} color="#00B4D8" /></div>
        <span style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.02em", color:"#0A0F1E" }}>CrateMate</span>
      </div>
      <nav style={C.nav}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 12px", borderRadius:8, marginBottom:2, textDecoration:"none", backgroundColor: active ? "rgba(0,180,216,0.09)" : "transparent", color: active ? "#0099B8" : "#64748b", fontSize:13, fontWeight: active ? 500 : 400, transition:"all 0.12s", boxShadow: active ? "inset 0 0 0 1px rgba(0,180,216,0.2)" : "none" }}>
              <Icon size={15} color={active ? "#00B4D8" : "#94a3b8"} style={{ flexShrink:0 }} />
              {label}
            </Link>
          );
        })}
        <div style={C.divider} />
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 12px", borderRadius:8, marginBottom:2, textDecoration:"none", backgroundColor: active ? "rgba(0,180,216,0.09)" : "transparent", color: active ? "#0099B8" : "#94a3b8", fontSize:13, transition:"all 0.12s" }}>
              <Icon size={15} color={active ? "#00B4D8" : "#94a3b8"} style={{ flexShrink:0 }} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div style={C.version}>v0.1 beta</div>
    </aside>
  );
}
