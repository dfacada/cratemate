"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Database,
  Users,
  Radio,
  Settings,
  Menu,
  X,
  Disc3,
  Plus,
  ListMusic,
} from "lucide-react";
import { getCrates, type Crate } from "@/lib/crates";

const NAV_PRIMARY = [
  { href: "/new-dig", icon: Sparkles, label: "New Dig" },
];

const NAV_MAIN = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/crate", icon: Database, label: "Crates" },
  { href: "/artists", icon: Users, label: "Artists" },
  { href: "/radar", icon: Radio, label: "Radar" },
  { href: "/set-builder", icon: ListMusic, label: "Set Builder" },
];

const NAV_BOTTOM = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

const MOBILE_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/new-dig", icon: Sparkles, label: "Dig" },
  { href: "/crate", icon: Database, label: "Crates" },
  { href: "/radar", icon: Radio, label: "Radar" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const CRATE_COLORS = [
  "rgba(0, 212, 170, 0.8)",   // teal
  "rgba(255, 152, 0, 0.8)",   // orange
  "rgba(156, 39, 176, 0.8)",  // purple
  "rgba(33, 150, 243, 0.8)",  // blue
  "rgba(233, 30, 99, 0.8)",   // pink
];

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  active: boolean;
  primary?: boolean;
}

function NavItem({ href, icon: Icon, label, active, primary }: NavItemProps) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-lg transition-all duration-200"
        style={{
          padding: primary ? "12px 12px" : "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: active
            ? primary
              ? "var(--accent-primary)"
              : "rgba(0,212,170,0.08)"
            : "transparent",
          borderLeft: active && !primary ? "3px solid var(--accent-primary)" : "3px solid transparent",
          paddingLeft: primary ? "12px" : "9px",
          color: active
            ? primary
              ? "#fff"
              : "var(--accent-primary)"
            : primary
            ? "var(--accent-primary)"
            : "var(--text-secondary)",
        }}
      >
        <div style={{ flexShrink: 0, display: "flex" }}>
          <Icon size={18} />
        </div>
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: primary ? 700 : active ? 600 : 500,
          }}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

interface CrateItemProps {
  crate: Crate;
  colorIndex: number;
}

function CrateItem({ crate, colorIndex }: CrateItemProps) {
  return (
    <Link href={`/crate?id=${crate.id}`} className="block group">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-lg transition-all duration-200 px-3 py-2.5 flex items-center gap-3"
        style={{
          backgroundColor: "transparent",
          color: "var(--text-secondary)",
        }}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: CRATE_COLORS[colorIndex % CRATE_COLORS.length],
            boxShadow: `0 0 8px ${CRATE_COLORS[colorIndex % CRATE_COLORS.length]}`,
          }}
        />
        <span
          className="text-sm truncate group-hover:text-white transition-colors"
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {crate.name}
        </span>
      </motion.div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crates, setCrates] = useState<Crate[]>([]);

  useEffect(() => {
    const savedCrates = getCrates();
    setCrates(savedCrates.slice(0, 5));
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar (240px) ── */}
      <motion.div
        className="desktop-sidebar fixed top-0 left-0 bottom-0 w-60 flex flex-col z-40"
        style={{
          backgroundColor: "rgba(12,12,18,0.95)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo Header */}
        <div
          className="px-4 py-5 border-b flex items-center gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), rgba(0,212,170,0.3))",
              boxShadow: "0 0 16px rgba(0,212,170,0.3)",
            }}
          >
            <Disc3 size={20} style={{ color: "#fff" }} />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            CrateMate
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
          {/* Primary CTA */}
          <div style={{ paddingLeft: "8px", paddingRight: "8px", marginBottom: "20px" }}>
            {NAV_PRIMARY.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
                primary={true}
              />
            ))}
          </div>

          {/* Main Navigation */}
          <div style={{ paddingLeft: "8px", paddingRight: "8px", marginBottom: "24px" }}>
            {NAV_MAIN.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
              />
            ))}
          </div>

          {/* YOUR CRATES Section */}
          {crates.length > 0 && (
            <div style={{ marginBottom: "24px", paddingLeft: "12px", paddingRight: "12px" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "10px",
                  paddingLeft: "4px",
                }}
              >
                Your Crates
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {crates.map((crate, idx) => (
                  <CrateItem key={crate.id} crate={crate} colorIndex={idx} />
                ))}
              </div>
              <Link href="/crate" className="block mt-3">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--accent-primary)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="hover:bg-white/5"
                >
                  <Plus size={16} />
                  <span>New Crate</span>
                </div>
              </Link>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom Navigation */}
          <div
            style={{
              paddingLeft: "8px",
              paddingRight: "8px",
              paddingTop: "16px",
              borderTop: "1px solid",
              borderColor: "var(--border-subtle)",
            }}
          >
            {NAV_BOTTOM.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </nav>

        {/* User Profile Footer */}
        <div
          className="px-4 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "rgba(0,212,170,0.15)",
              color: "var(--accent-primary)",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            DJ
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              CrateMate
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile Top Bar ── */}
      <motion.div
        className="mobile-topbar fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50 border-b"
        style={{
          backgroundColor: "rgba(12,12,18,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), rgba(0,212,170,0.3))",
              boxShadow: "0 0 12px rgba(0,212,170,0.2)",
            }}
          >
            <Disc3 size={18} style={{ color: "#fff" }} />
          </div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            CrateMate
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
          }}
        >
          <Menu size={20} />
        </button>
      </motion.div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50 border-r overflow-y-auto"
              style={{
                backgroundColor: "rgba(12,12,18,0.95)",
                backdropFilter: "blur(12px)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-4 border-b flex items-center justify-between flex-shrink-0"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex flex-col" style={{ padding: "16px 8px" }}>
                {/* Primary CTA */}
                <div style={{ marginBottom: "20px" }}>
                  {NAV_PRIMARY.map((item) => (
                    <div
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <NavItem
                        {...item}
                        active={isActive(item.href)}
                        primary={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Main Navigation */}
                <div style={{ marginBottom: "24px" }}>
                  {NAV_MAIN.map((item) => (
                    <div
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <NavItem
                        {...item}
                        active={isActive(item.href)}
                      />
                    </div>
                  ))}
                </div>

                {/* Crates */}
                {crates.length > 0 && (
                  <div style={{ marginBottom: "24px", paddingLeft: "4px", paddingRight: "4px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      Your Crates
                    </div>
                    {crates.map((crate, idx) => (
                      <div key={crate.id} onClick={() => setMobileOpen(false)}>
                        <CrateItem crate={crate} colorIndex={idx} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom Navigation */}
                <div
                  style={{
                    paddingTop: "16px",
                    borderTop: "1px solid",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  {NAV_BOTTOM.map((item) => (
                    <div
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <NavItem
                        {...item}
                        active={isActive(item.href)}
                      />
                    </div>
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Tab Bar ── */}
      <motion.div
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 flex items-stretch justify-around z-40 border-t"
        style={{
          backgroundColor: "rgba(12,12,18,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
              style={{
                color: active ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} />
              </motion.div>
              <span className="text-[0.625rem] font-medium truncate">
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-tab-active"
                  className="absolute bottom-0 w-8 h-0.5"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </motion.div>
    </>
  );
}
