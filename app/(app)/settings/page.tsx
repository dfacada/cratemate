"use client";
import { Settings, User, Bell, Palette, Database, Key, Globe, Music2 } from "lucide-react";
import BeatportSetup from "@/components/beatport-setup";

const A = {
  bg: "#F0F4F8", panel: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t2: "#1e293b", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

export default function SettingsPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: A.t4 }}>Configure your CrateMate integrations and preferences.</p>
      </div>

      {/* Beatport Integration — top of page since it's the active work */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Music2 size={14} color={A.t4} />
          <h2 style={{ fontSize: 12, fontWeight: 700, color: A.t4, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Music Sources
          </h2>
        </div>
        <BeatportSetup />
      </section>

      {/* Other settings sections — placeholder */}
      {[
        { icon: User,     label: "Profile",      desc: "Name, avatar, DJ handle" },
        { icon: Palette,  label: "Appearance",   desc: "Theme, density, color accents" },
        { icon: Database, label: "Library",      desc: "Import, export, backup your crates" },
        { icon: Bell,     label: "Notifications", desc: "Radar alerts, new releases" },
        { icon: Globe,    label: "Region",       desc: "Language, currency, date format" },
      ].map(({ icon: Icon, label, desc }) => (
        <div key={label} style={{ border: `1px solid ${A.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, backgroundColor: "#fff", opacity: 0.55 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} color={A.t4} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: A.t1 }}>{label}</p>
            <p style={{ fontSize: 11, color: A.t5 }}>{desc}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 10, color: A.t5, padding: "2px 7px", borderRadius: 4, backgroundColor: "#f1f5f9", border: `1px solid ${A.border}` }}>Coming soon</span>
        </div>
      ))}
    </div>
  );
}
