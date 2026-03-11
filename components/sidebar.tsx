"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FolderOpen, List, Users, Tag, Radio, History, Settings, Menu, X } from "lucide-react";

const A = { bg:"#fff", border:"#f1f5f9", t1:"#0f172a", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8", accentBg:"rgba(0,180,216,0.08)" };

const NAV = [
  { href:"/dashboard",        icon:Home,    label:"Home" },
  { href:"/new-dig",          icon:Search,  label:"New Dig" },
  { href:"/crate",            icon:FolderOpen, label:"Crates" },
  { href:"/set-builder",      icon:List,    label:"Sets" },
  { href:"/artists",          icon:Users,   label:"Artists" },
  { href:"/labels",           icon:Tag,     label:"Labels" },
  { href:"/radar",            icon:Radio,   label:"Underground Radar" },
  { href:"/history",          icon:History, label:"History" },
  { href:"/settings",         icon:Settings,label:"Settings" },
];

// Bottom nav items for mobile (subset)
const MOBILE_NAV = [
  { href:"/dashboard",   icon:Home,    label:"Home" },
  { href:"/new-dig",     icon:Search,  label:"Dig" },
  { href:"/crate",       icon:FolderOpen, label:"Crates" },
  { href:"/radar",       icon:Radio,   label:"Radar" },
  { href:"/artists",     icon:Users,   label:"Artists" },
];

function NavItem({ href, icon: Icon, label, active }: { href:string; icon:any; label:string; active:boolean }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"8px 12px", borderRadius:8, margin:"1px 0",
        backgroundColor: active ? A.accentBg : "transparent",
        color: active ? A.accent : A.t4,
        transition:"all 0.12s", cursor:"pointer",
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor="#f8fafc"; e.currentTarget.style.color=A.t1; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color=A.t4; } }}
      >
        <Icon size={15} style={{ flexShrink:0 }} />
        <span style={{ fontSize:13, fontWeight: active ? 600 : 400 }}>{label}</span>
        {active && <div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", backgroundColor:A.accent }} />}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div style={{
        position:"fixed", top:0, left:0, bottom:0, width:224,
        backgroundColor:A.bg, borderRight:`1px solid ${A.border}`,
        display:"flex", flexDirection:"column",
        zIndex:40,
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${A.border}`, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"rgba(0,180,216,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:14 }}>⊙</span>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>CrateMate</span>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {NAV.map(n => (
            <NavItem key={n.href} {...n} active={pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))} />
          ))}
        </nav>
      </div>

      {/* ── Mobile top bar ── */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:52,
        backgroundColor:"#fff", borderBottom:`1px solid ${A.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px", zIndex:50,
      }} className="mobile-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, backgroundColor:"rgba(0,180,216,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:13 }}>⊙</span>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:A.t1, letterSpacing:"-0.02em" }}>CrateMate</span>
        </div>
        <button onClick={() => setMobileOpen(true)}
          style={{ border:"none", backgroundColor:"transparent", cursor:"pointer", padding:6, color:A.t4 }}>
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:100 }}>
          {/* Backdrop */}
          <div onClick={() => setMobileOpen(false)} style={{ position:"absolute", inset:0, backgroundColor:"rgba(0,0,0,0.35)" }} />
          {/* Panel */}
          <div style={{ position:"absolute", top:0, left:0, bottom:0, width:260, backgroundColor:"#fff", boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"16px", borderBottom:`1px solid ${A.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:15, fontWeight:700, color:A.t1 }}>CrateMate</span>
              <button onClick={() => setMobileOpen(false)} style={{ border:"none", backgroundColor:"transparent", cursor:"pointer", color:A.t4 }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
              {NAV.map(n => (
                <div key={n.href} onClick={() => setMobileOpen(false)}>
                  <NavItem {...n} active={pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))} />
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        backgroundColor:"#fff", borderTop:`1px solid ${A.border}`,
        display:"flex", alignItems:"stretch",
        zIndex:40, height:56,
      }} className="mobile-bottom-nav">
        {MOBILE_NAV.map(n => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{ flex:1, textDecoration:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, color: active ? A.accent : A.t5 }}>
              <n.icon size={20} />
              <span style={{ fontSize:9, fontWeight: active ? 600 : 400 }}>{n.label}</span>
            </Link>
          );
        })}
      </div>

      {/* CSS to show/hide by breakpoint */}
      <style>{`
        .desktop-sidebar { display: flex !important; }
        .mobile-topbar   { display: none  !important; }
        .mobile-bottom-nav { display: none !important; }

        @media (max-width: 768px) {
          .desktop-sidebar   { display: none  !important; }
          .mobile-topbar     { display: flex  !important; }
          .mobile-bottom-nav { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
