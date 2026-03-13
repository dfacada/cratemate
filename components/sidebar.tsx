"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, Database, Users, Radio, Settings, Menu, X, Disc3 } from "lucide-react";

const NAV_PRIMARY = [
  { href: "/new-dig", icon: Sparkles, label: "New Dig" },
];

const NAV_MAIN = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/crate", icon: Database, label: "Crates" },
  { href: "/artists", icon: Users, label: "Artists" },
  { href: "/radar", icon: Radio, label: "Radar" },
];

const NAV_BOTTOM = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

const MOBILE_NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/new-dig", icon: Sparkles, label: "Dig" },
  { href: "/crate", icon: Database, label: "Crates" },
  { href: "/radar", icon: Radio, label: "Radar" },
  { href: "/settings", icon: Settings, label: "Settings" },
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          primary ? "mb-1" : "my-0.5"
        }`}
        style={{
          backgroundColor: active
            ? primary
              ? "var(--accent-primary)"
              : "rgba(0,212,170,0.1)"
            : primary
            ? "rgba(0,212,170,0.05)"
            : "transparent",
          border: active
            ? `1px solid ${primary ? "var(--accent-primary)" : "rgba(0,212,170,0.2)"}`
            : `1px solid ${primary ? "rgba(0,212,170,0.15)" : "transparent"}`,
          color: active
            ? primary
              ? "#fff"
              : "var(--accent-primary)"
            : primary
            ? "var(--accent-primary)"
            : "var(--text-secondary)",
        }}
      >
        <div style={{ flexShrink: 0 }}>
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
        {active && !primary && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          backgroundColor: "rgba(12,12,18,0.9)",
          backdropFilter: "blur(8px)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo Header */}
        <div
          className="px-4 py-4 border-b flex items-center gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), rgba(0,212,170,0.3))",
              boxShadow: "0 0 12px rgba(0,212,170,0.2)",
            }}
          >
            <Disc3 size={18} style={{ color: "#fff" }} />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            CrateMate
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
          {/* Primary CTA */}
          <div className="mb-2">
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
          <div className="space-y-1">
            {NAV_MAIN.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Navigation */}
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            {NAV_BOTTOM.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </nav>
      </motion.div>

      {/* ── Mobile Top Bar ── */}
      <motion.div
        className="mobile-topbar fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50 border-b"
        style={{
          backgroundColor: "rgba(12,12,18,0.9)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), rgba(0,212,170,0.3))",
            }}
          >
            <Disc3 size={16} style={{ color: "#fff" }} />
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
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
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
              className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50 border-r"
              style={{
                backgroundColor: "rgba(12,12,18,0.95)",
                backdropFilter: "blur(12px)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-4 border-b flex items-center justify-between"
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
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
                {/* Primary CTA */}
                <div className="mb-2">
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
                <div className="space-y-1">
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

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Navigation */}
                <div className="space-y-1 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
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
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-14 flex items-stretch justify-around z-40 border-t"
        style={{
          backgroundColor: "rgba(12,12,18,0.9)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors group"
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
                  className="absolute bottom-0 left-1/4 right-1/4 h-0.5"
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
