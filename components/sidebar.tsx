"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, FolderOpen, List, Users, Tag, Radio, History, Settings, Menu, X } from "lucide-react";

const A = {
  bg: "#fff", border: "#f1f5f9",
  t1: "#0f172a", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.08)",
};

const NAV_TOP = [
  { href: "/new-dig", icon: Sparkles, label: "New Dig", primary: true },
];

const NAV_MAIN = [
  { href: "/dashboard",   icon: Home,       label: "Home" },
  { href: "/crate",       icon: FolderOpen, label: "Crates" },
  { href: "/set-builder", icon: List,       label: "Sets" },
  { href: "/artists",     icon: Users,      label: "Artists" },
  { href: "/labels",      icon: Tag,        label: "Labels" },
  { href: "/radar",       icon: Radio,      label: "Underground Radar" },
];

const NAV_BOTTOM = [
  { href: "/history",  icon: History,  label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const ALL_NAV = [...NAV_TOP, ...NAV_MAIN, ...NAV_BOTTOM];

const MOBILE_NAV = [
  { href: "/dashboard", icon: Home,       label: "Home" },
  { href: "/new-dig",   icon: Sparkles,   label: "Dig" },
  { href: "/crate",     icon: FolderOpen, label: "Crates" },
  { href: "/radar",     icon: Radio,      label: "Radar" },
  { href: "/artists",   icon: Users,      label: "Artists" },
];

function NavItem({ href, icon: Icon, label, active, primary }: {
  href: string; icon: any; label: string; active: boolean; primary?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: primary ? "9px 12px" : "7px 12px",
        borderRadius: 9, margin: primary ? "0 0 4px" : "1px 0",
        backgroundColor: primary
          ? active ? A.accent : "rgba(0,180,216,0.1)"
          : active ? A.accentBg : "transparent",
        color: primary ? (active ? "#fff" : A.accent) : active ? A.accent : A.t4,
        border: primary ? `1px solid ${active ? A.accent : "rgba(0,180,216,0.25)"}` : "none",
        transition: "all 0.12s", cursor: "pointer",
        fontWeight: primary ? 700 : active ? 600 : 400,
      }}
        onMouseEnter={e => {
          if (primary && !active) {
            e.currentTarget.style.backgroundColor = A.accent;
            e.currentTarget.style.color = "#fff";
          } else if (!primary && !active) {
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.color = A.t1;
          }
        }}
        onMouseLeave={e => {
          if (primary && !active) {
            e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.1)";
            e.currentTarget.style.color = A.accent;
          } else if (!primary && !active) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = A.t4;
          }
        }}
      >
        <Icon size={primary ? 15 : 14} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13 }}>{label}</span>
        {!primary && active && (
          <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", backgroundColor: A.accent }} />
        )}
      </div>
    </Link>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: A.border, margin: "8px 4px" }} />;
}

export default function Sidebar() {
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const renderNav = () => (
    <>
      {/* New Dig — primary CTA */}
      <div style={{ padding: "8px 8px 0" }}>
        {NAV_TOP.map(n => (
          <NavItem key={n.href} {...n} active={isActive(n.href)} />
        ))}
      </div>

      <Divider />

      {/* Main nav */}
      <nav style={{ padding: "0 8px", flex: 1 }}>
        {NAV_MAIN.map(n => (
          <NavItem key={n.href} {...n} active={isActive(n.href)} />
        ))}
      </nav>

      <Divider />

      {/* Bottom nav */}
      <div style={{ padding: "0 8px 10px" }}>
        {NAV_BOTTOM.map(n => (
          <NavItem key={n.href} {...n} active={isActive(n.href)} />
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 224,
        backgroundColor: A.bg, borderRight: `1px solid ${A.border}`,
        display: "flex", flexDirection: "column", zIndex: 40,
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(0,180,216,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>⊙</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>CrateMate</span>
        </div>

        {renderNav()}
      </div>

      {/* ── Mobile top bar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52,
        backgroundColor: "#fff", borderBottom: `1px solid ${A.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", zIndex: 50,
      }} className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "rgba(0,180,216,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13 }}>⊙</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: A.t1, letterSpacing: "-0.02em" }}>CrateMate</span>
        </div>
        <button onClick={() => setOpen(true)} style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", padding: 6, color: A.t4 }}>
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 260, backgroundColor: "#fff", boxShadow: "4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: A.t1 }}>CrateMate</span>
              <button onClick={() => setOpen(false)} style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: A.t4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={() => setOpen(false)}>
              {renderNav()}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTop: `1px solid ${A.border}`,
        display: "flex", alignItems: "stretch", zIndex: 40, height: 56,
      }} className="mobile-bottom-nav">
        {MOBILE_NAV.map(n => {
          const active = isActive(n.href);
          return (
            <Link key={n.href} href={n.href} style={{ flex: 1, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: active ? A.accent : A.t5 }}>
              <n.icon size={20} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400 }}>{n.label}</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .desktop-sidebar   { display: flex !important; }
        .mobile-topbar     { display: none  !important; }
        .mobile-bottom-nav { display: none  !important; }
        @media (max-width: 768px) {
          .desktop-sidebar   { display: none  !important; }
          .mobile-topbar     { display: flex  !important; }
          .mobile-bottom-nav { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
