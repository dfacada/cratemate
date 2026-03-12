"use client";
import { useState, useEffect, useRef } from "react";
import {
  User, Bell, Palette, Database, Globe, Music2,
  Check, Upload, Download, Trash2, AlertCircle, Camera,
} from "lucide-react";
import BeatportSetup from "@/components/beatport-setup";
import { getCrates, saveCrate, type Crate } from "@/lib/crates";

const A = {
  bg: "#F0F4F8", panel: "#ffffff", border: "#e2e8f0",
  t1: "#0f172a", t2: "#1e293b", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

const PROFILE_KEY = "cratemate_profile";
const APPEARANCE_KEY = "cratemate_appearance";

interface Profile {
  djName: string;
  handle: string;
  bio: string;
}

interface AppearanceSettings {
  density: "compact" | "comfortable";
  accentColor: string;
}

function getProfile(): Profile {
  if (typeof window === "undefined") return { djName: "", handle: "", bio: "" };
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") ?? { djName: "", handle: "", bio: "" };
  } catch { return { djName: "", handle: "", bio: "" }; }
}

function getAppearance(): AppearanceSettings {
  if (typeof window === "undefined") return { density: "comfortable", accentColor: "#00B4D8" };
  try {
    return JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "null") ?? { density: "comfortable", accentColor: "#00B4D8" };
  } catch { return { density: "comfortable", accentColor: "#00B4D8" }; }
}

/* ─── Section header ─── */
function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Icon size={14} color={A.t4} />
      <h2 style={{ fontSize: 12, fontWeight: 700, color: A.t4, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </h2>
    </div>
  );
}

/* ─── Input field ─── */
function Field({ label, value, onChange, placeholder, mono, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; multiline?: boolean;
}) {
  const shared = {
    width: "100%", padding: "8px 11px", borderRadius: 8, fontSize: 13,
    border: `1.5px solid ${A.border}`, backgroundColor: "#fafafa",
    color: A.t1, outline: "none", fontFamily: mono ? "monospace" : "inherit",
    transition: "border-color 0.15s", boxSizing: "border-box" as const,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: A.t3, marginBottom: 5 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...shared, resize: "vertical" }}
          onFocus={e => { e.currentTarget.style.borderColor = A.accent; }}
          onBlur={e => { e.currentTarget.style.borderColor = A.border; }}
        />
      ) : (
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={shared}
          onFocus={e => { e.currentTarget.style.borderColor = A.accent; }}
          onBlur={e => { e.currentTarget.style.borderColor = A.border; }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PROFILE SECTION
   ════════════════════════════════════════════════════════════ */
function ProfileSection() {
  const [profile, setProfile] = useState<Profile>({ djName: "", handle: "", bio: "" });
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setMounted(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = profile.djName
    ? profile.djName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "DJ";

  if (!mounted) return null;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={14} color={A.accent} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Profile</p>
          <p style={{ fontSize: 12, color: A.t4 }}>Your DJ identity across CrateMate</p>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, backgroundColor: A.accentBg,
            border: `2px solid ${A.accentBorder}`, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: A.accent }}>{initials}</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: A.t2 }}>{profile.djName || "Set your name"}</p>
            <p style={{ fontSize: 11, color: A.t5, marginTop: 2 }}>
              {profile.handle ? `@${profile.handle}` : "No handle set"}
            </p>
          </div>
        </div>

        <Field label="DJ Name" value={profile.djName} onChange={v => setProfile(p => ({ ...p, djName: v }))} placeholder="e.g. DJ Shadow" />
        <Field label="Handle" value={profile.handle} onChange={v => setProfile(p => ({ ...p, handle: v.replace(/[^a-zA-Z0-9_.-]/g, "") }))} placeholder="e.g. djshadow" mono />
        <Field label="Bio" value={profile.bio} onChange={v => setProfile(p => ({ ...p, bio: v }))} placeholder="A few words about your sound..." multiline />

        <button onClick={handleSave} style={{
          padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
          backgroundColor: saved ? "#16a34a" : A.accent, color: "#fff",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          transition: "background-color 0.15s",
        }}>
          {saved ? <><Check size={13} /> Saved</> : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   APPEARANCE SECTION
   ════════════════════════════════════════════════════════════ */
const ACCENT_COLORS = [
  { label: "Cyan",   value: "#00B4D8" },
  { label: "Blue",   value: "#3B82F6" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink",   value: "#EC4899" },
  { label: "Orange", value: "#F59E0B" },
  { label: "Green",  value: "#10B981" },
];

function AppearanceSection() {
  const [settings, setSettings] = useState<AppearanceSettings>({ density: "comfortable", accentColor: "#00B4D8" });
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(getAppearance());
    setMounted(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(139,92,246,0.09)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Palette size={14} color="#8B5CF6" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Appearance</p>
          <p style={{ fontSize: 12, color: A.t4 }}>Customize your visual preferences</p>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Theme — informational only for now */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: A.t3, marginBottom: 8 }}>Theme</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${A.accent}`, backgroundColor: A.accentBg,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "#fff", border: `1px solid ${A.border}` }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: A.t1 }}>Light</span>
              <Check size={12} color={A.accent} style={{ marginLeft: "auto" }} />
            </div>
            <div style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              border: `2px solid ${A.border}`, backgroundColor: "#fafafa",
              display: "flex", alignItems: "center", gap: 8, opacity: 0.5,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: A.t4 }}>Dark</span>
              <span style={{ marginLeft: "auto", fontSize: 9, color: A.t5, padding: "1px 5px", borderRadius: 3, backgroundColor: "#f1f5f9" }}>Soon</span>
            </div>
          </div>
        </div>

        {/* Accent color */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: A.t3, marginBottom: 8 }}>Accent Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ACCENT_COLORS.map(c => (
              <button key={c.value} onClick={() => setSettings(s => ({ ...s, accentColor: c.value }))}
                title={c.label}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: settings.accentColor === c.value
                    ? `2.5px solid ${c.value}` : `2px solid ${A.border}`,
                  backgroundColor: c.value + "20", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.12s",
                }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: c.value }} />
              </button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: A.t3, marginBottom: 8 }}>Layout Density</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["compact", "comfortable"] as const).map(d => (
              <button key={d} onClick={() => setSettings(s => ({ ...s, density: d }))}
                style={{
                  flex: 1, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                  border: settings.density === d ? `2px solid ${A.accent}` : `2px solid ${A.border}`,
                  backgroundColor: settings.density === d ? A.accentBg : "#fafafa",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.12s",
                }}>
                <div style={{ display: "flex", flexDirection: "column", gap: d === "compact" ? 2 : 4, width: 24 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      height: d === "compact" ? 2 : 3, borderRadius: 1,
                      backgroundColor: settings.density === d ? A.accent : A.t5,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: settings.density === d ? A.t1 : A.t4, textTransform: "capitalize" }}>{d}</span>
                {settings.density === d && <Check size={12} color={A.accent} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} style={{
          padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
          backgroundColor: saved ? "#16a34a" : A.accent, color: "#fff",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          transition: "background-color 0.15s",
        }}>
          {saved ? <><Check size={13} /> Saved</> : "Save Appearance"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LIBRARY SECTION
   ════════════════════════════════════════════════════════════ */
function LibrarySection() {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCrates(getCrates());
    setMounted(true);
  }, []);

  const totalTracks = crates.reduce((sum, c) => sum + c.tracks.length, 0);

  const handleExport = () => {
    const data = JSON.stringify(crates, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cratemate-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: "success", msg: `Exported ${crates.length} crate${crates.length !== 1 ? "s" : ""} (${totalTracks} tracks)` });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (!Array.isArray(imported)) throw new Error("not an array");
        let count = 0;
        for (const crate of imported) {
          if (crate.id && crate.name && Array.isArray(crate.tracks)) {
            saveCrate(crate);
            count++;
          }
        }
        setCrates(getCrates());
        setStatus({ type: "success", msg: `Imported ${count} crate${count !== 1 ? "s" : ""}` });
      } catch {
        setStatus({ type: "error", msg: "Invalid file — expected a CrateMate JSON backup" });
      }
      setTimeout(() => setStatus(null), 3000);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  };

  const handleClearAll = () => {
    localStorage.removeItem("cratemate_crates");
    setCrates([]);
    setConfirmClear(false);
    setStatus({ type: "success", msg: "All crates cleared" });
    setTimeout(() => setStatus(null), 3000);
  };

  if (!mounted) return null;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(59,130,246,0.09)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Database size={14} color="#3B82F6" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Library</p>
          <p style={{ fontSize: 12, color: A.t4 }}>Manage your crate data</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontSize: 12, color: A.t4, fontFamily: "monospace" }}>
            {crates.length} crate{crates.length !== 1 ? "s" : ""} · {totalTracks} tracks
          </span>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Status message */}
        {status && (
          <div style={{
            display: "flex", gap: 6, padding: "8px 12px", borderRadius: 8, marginBottom: 14,
            backgroundColor: status.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}>
            {status.type === "success"
              ? <Check size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />}
            <p style={{ fontSize: 12, color: status.type === "success" ? "#15803d" : "#dc2626" }}>{status.msg}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Export */}
          <button onClick={handleExport} disabled={crates.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
              borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: "#f8fafc",
              fontSize: 12, fontWeight: 600, color: crates.length > 0 ? A.t2 : A.t5,
              cursor: crates.length > 0 ? "pointer" : "not-allowed", transition: "all 0.12s",
            }}
            onMouseEnter={e => { if (crates.length > 0) e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <Download size={13} /> Export Backup
          </button>

          {/* Import */}
          <button onClick={() => fileRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
              borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: "#f8fafc",
              fontSize: 12, fontWeight: 600, color: A.t2, cursor: "pointer", transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <Upload size={13} /> Import Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />

          {/* Clear all */}
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} disabled={crates.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                borderRadius: 8, border: "1px solid #fecaca", backgroundColor: "#fef2f2",
                fontSize: 12, fontWeight: 600, color: crates.length > 0 ? "#dc2626" : "#fca5a5",
                cursor: crates.length > 0 ? "pointer" : "not-allowed", transition: "all 0.12s",
              }}>
              <Trash2 size={13} /> Clear All
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>Delete all {crates.length} crates?</span>
              <button onClick={handleClearAll}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: "none",
                  backgroundColor: "#dc2626", color: "#fff", fontSize: 11,
                  fontWeight: 700, cursor: "pointer",
                }}>
                Confirm
              </button>
              <button onClick={() => setConfirmClear(false)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: `1px solid ${A.border}`,
                  backgroundColor: "#fff", color: A.t4, fontSize: 11,
                  fontWeight: 600, cursor: "pointer",
                }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Crate list preview */}
        {crates.length > 0 && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${A.border}`, paddingTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: A.t5, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
              Your Crates
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {crates.slice(0, 8).map(c => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 10px", borderRadius: 6, backgroundColor: "#fafafa",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: A.t2 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: A.t5, fontFamily: "monospace" }}>
                    {c.tracks.length} tracks
                  </span>
                </div>
              ))}
              {crates.length > 8 && (
                <p style={{ fontSize: 11, color: A.t5, paddingLeft: 10 }}>
                  +{crates.length - 8} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: A.t1, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: A.t4 }}>Configure your CrateMate integrations and preferences.</p>
      </div>

      {/* Profile */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon={User} label="Profile" />
        <ProfileSection />
      </section>

      {/* Music Sources (Beatport) */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon={Music2} label="Music Sources" />
        <BeatportSetup />
      </section>

      {/* Appearance */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon={Palette} label="Appearance" />
        <AppearanceSection />
      </section>

      {/* Library */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon={Database} label="Library" />
        <LibrarySection />
      </section>

      {/* Still Coming Soon */}
      {[
        { icon: Bell,  label: "Notifications", desc: "Radar alerts, new releases" },
        { icon: Globe, label: "Region",        desc: "Language, currency, date format" },
      ].map(({ icon: Icon, label, desc }) => (
        <div key={label} style={{
          border: `1px solid ${A.border}`, borderRadius: 12, padding: "14px 18px",
          marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
          backgroundColor: "#fff", opacity: 0.55,
        }}>
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
