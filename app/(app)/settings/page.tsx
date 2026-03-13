"use client";
import { useState, useEffect, useRef } from "react";
import {
  User, Bell, Palette, Database, Globe, Music2,
  Check, Upload, Download, Trash2, AlertCircle, ExternalLink,
  LogOut, Disc3,
} from "lucide-react";
import BeatportSetup from "@/components/beatport-setup";
import { getCrates, saveCrate, type Crate } from "@/lib/crates";
import {
  getSpotifyAuthUrl,
  getSpotifyUserToken,
  clearSpotifyUserToken,
  isSpotifyAuthenticated,
  type SpotifyTokenData,
} from "@/lib/spotify";

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
  if (typeof window === "undefined") return { density: "comfortable", accentColor: "#00d4aa" };
  try {
    return JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "null") ?? { density: "comfortable", accentColor: "#00d4aa" };
  } catch { return { density: "comfortable", accentColor: "#00d4aa" }; }
}

/* ─── Section header ─── */
function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Icon size={14} style={{ color: "var(--text-muted)" }} />
      <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
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
  const shared: React.CSSProperties = {
    width: "100%", padding: "8px 11px", borderRadius: 8, fontSize: 13,
    border: "1.5px solid var(--border)", backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)", outline: "none", fontFamily: mono ? "monospace" : "inherit",
    transition: "border-color 0.15s", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...shared, resize: "vertical" }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      ) : (
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={shared}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      )}
    </div>
  );
}

/* ─── Card wrapper ─── */
function SettingsCard({ icon: Icon, iconColor, iconBg, title, subtitle, children }: {
  icon: any; iconColor: string; iconBg: string; title: string; subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", backgroundColor: "var(--bg-secondary)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: 20 }}>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SPOTIFY CONNECTION SECTION
   ════════════════════════════════════════════════════════════ */
function SpotifySection() {
  const [connected, setConnected] = useState(false);
  const [tokenData, setTokenData] = useState<SpotifyTokenData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const token = getSpotifyUserToken();
    setTokenData(token);
    setConnected(isSpotifyAuthenticated());
    setMounted(true);

    // Listen for token updates from OAuth callback popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "spotify-auth-success") {
        const token = getSpotifyUserToken();
        setTokenData(token);
        setConnected(isSpotifyAuthenticated());
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = () => {
    const authUrl = getSpotifyAuthUrl();
    // Open in popup window
    const width = 450;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    window.open(
      authUrl,
      "spotify-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  };

  const handleDisconnect = () => {
    clearSpotifyUserToken();
    setTokenData(null);
    setConnected(false);
    setDisconnecting(false);
  };

  const getExpiryText = () => {
    if (!tokenData?.expiresAt) return "";
    const remaining = tokenData.expiresAt - Date.now();
    if (remaining <= 0) return "Token expired — reconnect to refresh";
    const minutes = Math.floor(remaining / 60000);
    if (minutes < 60) return `Token refreshes in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Token valid for ${hours}h ${minutes % 60}m`;
  };

  if (!mounted) return null;

  return (
    <SettingsCard
      icon={Disc3}
      iconColor="#1DB954"
      iconBg="rgba(29,185,84,0.12)"
      title="Spotify"
      subtitle="Full track playback with Spotify Premium"
    >
      {connected ? (
        <>
          {/* Connected state */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
            borderRadius: 10, backgroundColor: "rgba(29,185,84,0.08)",
            border: "1px solid rgba(29,185,84,0.2)", marginBottom: 16,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1DB954",
              boxShadow: "0 0 6px rgba(29,185,84,0.5)",
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1DB954" }}>Connected</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{getExpiryText()}</p>
            </div>
            <Check size={16} color="#1DB954" />
          </div>

          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            Your Spotify Premium account is connected. CrateMate can play full tracks, search the Spotify catalog, and validate recommendations against real releases.
          </p>

          {/* Scopes info */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Permissions granted
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Streaming", "Playback Control", "Read Playback State", "Currently Playing"].map(scope => (
                <span key={scope} style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}>
                  {scope}
                </span>
              ))}
            </div>
          </div>

          {/* Disconnect */}
          {!disconnecting ? (
            <button onClick={() => setDisconnecting(true)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
              borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.08)",
              fontSize: 12, fontWeight: 600, color: "#ef4444",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <LogOut size={13} /> Disconnect Spotify
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>Disconnect?</span>
              <button onClick={handleDisconnect} style={{
                padding: "6px 14px", borderRadius: 6, border: "none",
                backgroundColor: "#ef4444", color: "#fff", fontSize: 11,
                fontWeight: 700, cursor: "pointer",
              }}>
                Confirm
              </button>
              <button onClick={() => setDisconnecting(false)} style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)",
                backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Disconnected state */}
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            Connect your Spotify Premium account to unlock full track playback in CrateMate. You'll be able to play complete tracks, not just previews — and every recommendation gets validated against Spotify's catalog.
          </p>

          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 16,
            backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)",
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>What you get:</p>
            <ul style={{ margin: 0, paddingLeft: 18, listStyleType: "disc" }}>
              <li style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Full track playback (requires Spotify Premium)</li>
              <li style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Instant play — no waiting for track lookup</li>
              <li style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Track validation — recommended tracks are verified against Spotify</li>
              <li style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 0 }}>Queue controls — play all, next, previous, seek</li>
            </ul>
          </div>

          <button onClick={handleConnect} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            borderRadius: 20, border: "none", backgroundColor: "#1DB954",
            fontSize: 13, fontWeight: 700, color: "#fff",
            cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1ed760"; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Spotify
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
            You'll be redirected to Spotify to authorize CrateMate. We only request playback permissions.
          </p>
        </>
      )}
    </SettingsCard>
  );
}

/* ════════════════════════════════════════════════════════════
   SOUNDCLOUD SECTION
   ════════════════════════════════════════════════════════════ */
function SoundCloudSection() {
  const [clientId, setClientId] = useState("");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cratemate_sc_client_id") || "";
    setClientId(stored);
    setMounted(true);
  }, []);

  const handleSave = () => {
    if (clientId.trim()) {
      localStorage.setItem("cratemate_sc_client_id", clientId.trim());
    } else {
      localStorage.removeItem("cratemate_sc_client_id");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return null;

  return (
    <SettingsCard
      icon={Music2}
      iconColor="#ff5500"
      iconBg="rgba(255,85,0,0.12)"
      title="SoundCloud"
      subtitle="Import playlists and export crates"
    >
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
        SoundCloud playlist import works without configuration. To export crates as SoundCloud playlists, add your Client ID below.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>
          Client ID <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional — for export only)</span>
        </label>
        <input
          type="text"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          placeholder="Paste your SoundCloud Client ID..."
          style={{
            width: "100%", padding: "8px 11px", borderRadius: 8, fontSize: 13,
            border: "1.5px solid var(--border)", backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)", outline: "none", fontFamily: "monospace",
            transition: "border-color 0.15s", boxSizing: "border-box",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#ff5500"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={handleSave} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
          backgroundColor: saved ? "#16a34a" : "#ff5500", color: "#fff",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          transition: "background-color 0.15s",
        }}>
          {saved ? <><Check size={12} /> Saved</> : "Save"}
        </button>

        <a
          href="https://soundcloud.com/you/apps/new"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 11,
            color: "var(--text-muted)", textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <ExternalLink size={11} /> Create app on SoundCloud
        </a>
      </div>
    </SettingsCard>
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
    <SettingsCard
      icon={User}
      iconColor="var(--accent-primary)"
      iconBg="rgba(0,212,170,0.1)"
      title="Profile"
      subtitle="Your DJ identity across CrateMate"
    >
      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, backgroundColor: "rgba(0,212,170,0.1)",
          border: "2px solid rgba(0,212,170,0.25)", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-primary)" }}>{initials}</span>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{profile.djName || "Set your name"}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {profile.handle ? `@${profile.handle}` : "No handle set"}
          </p>
        </div>
      </div>

      <Field label="DJ Name" value={profile.djName} onChange={v => setProfile(p => ({ ...p, djName: v }))} placeholder="e.g. DJ Shadow" />
      <Field label="Handle" value={profile.handle} onChange={v => setProfile(p => ({ ...p, handle: v.replace(/[^a-zA-Z0-9_.-]/g, "") }))} placeholder="e.g. djshadow" mono />
      <Field label="Bio" value={profile.bio} onChange={v => setProfile(p => ({ ...p, bio: v }))} placeholder="A few words about your sound..." multiline />

      <button onClick={handleSave} style={{
        padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
        backgroundColor: saved ? "#16a34a" : "var(--accent-primary)", color: "#fff",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        transition: "background-color 0.15s",
      }}>
        {saved ? <><Check size={13} /> Saved</> : "Save Profile"}
      </button>
    </SettingsCard>
  );
}

/* ════════════════════════════════════════════════════════════
   APPEARANCE SECTION
   ════════════════════════════════════════════════════════════ */
const ACCENT_COLORS = [
  { label: "Teal",   value: "#00d4aa" },
  { label: "Cyan",   value: "#00B4D8" },
  { label: "Blue",   value: "#3B82F6" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink",   value: "#EC4899" },
  { label: "Orange", value: "#F59E0B" },
];

function AppearanceSection() {
  const [settings, setSettings] = useState<AppearanceSettings>({ density: "comfortable", accentColor: "#00d4aa" });
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
    <SettingsCard
      icon={Palette}
      iconColor="#8B5CF6"
      iconBg="rgba(139,92,246,0.1)"
      title="Appearance"
      subtitle="Customize your visual preferences"
    >
      {/* Theme */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Theme</label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            flex: 1, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
            border: "2px solid var(--accent-primary)", backgroundColor: "rgba(0,212,170,0.06)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "#1a1a2e", border: "1px solid #2a2a3e" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Dark</span>
            <Check size={12} color="var(--accent-primary)" style={{ marginLeft: "auto" }} />
          </div>
          <div style={{
            flex: 1, padding: "10px 14px", borderRadius: 8,
            border: "2px solid var(--border)", backgroundColor: "var(--bg-tertiary)",
            display: "flex", alignItems: "center", gap: 8, opacity: 0.5,
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "#f0f4f8", border: "1px solid #d1d9e0" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Light</span>
            <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-muted)", padding: "1px 5px", borderRadius: 3, backgroundColor: "var(--bg-primary)" }}>Soon</span>
          </div>
        </div>
      </div>

      {/* Accent color */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Accent Color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ACCENT_COLORS.map(c => (
            <button key={c.value} onClick={() => setSettings(s => ({ ...s, accentColor: c.value }))}
              title={c.label}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: settings.accentColor === c.value
                  ? `2.5px solid ${c.value}` : "2px solid var(--border)",
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
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Layout Density</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["compact", "comfortable"] as const).map(d => (
            <button key={d} onClick={() => setSettings(s => ({ ...s, density: d }))}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                border: settings.density === d ? "2px solid var(--accent-primary)" : "2px solid var(--border)",
                backgroundColor: settings.density === d ? "rgba(0,212,170,0.06)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.12s",
              }}>
              <div style={{ display: "flex", flexDirection: "column", gap: d === "compact" ? 2 : 4, width: 24 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    height: d === "compact" ? 2 : 3, borderRadius: 1,
                    backgroundColor: settings.density === d ? "var(--accent-primary)" : "var(--text-muted)",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: settings.density === d ? "var(--text-primary)" : "var(--text-muted)", textTransform: "capitalize" }}>{d}</span>
              {settings.density === d && <Check size={12} color="var(--accent-primary)" style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} style={{
        padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
        backgroundColor: saved ? "#16a34a" : "var(--accent-primary)", color: "#fff",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        transition: "background-color 0.15s",
      }}>
        {saved ? <><Check size={13} /> Saved</> : "Save Appearance"}
      </button>
    </SettingsCard>
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
    <SettingsCard
      icon={Database}
      iconColor="#3B82F6"
      iconBg="rgba(59,130,246,0.1)"
      title="Library"
      subtitle="Manage your crate data"
    >
      {/* Stats */}
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
          {crates.length} crate{crates.length !== 1 ? "s" : ""} · {totalTracks} tracks
        </span>
      </div>

      {/* Status message */}
      {status && (
        <div style={{
          display: "flex", gap: 6, padding: "8px 12px", borderRadius: 8, marginBottom: 14,
          backgroundColor: status.type === "success" ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${status.type === "success" ? "rgba(22,163,74,0.25)" : "rgba(239,68,68,0.25)"}`,
        }}>
          {status.type === "success"
            ? <Check size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />}
          <p style={{ fontSize: 12, color: status.type === "success" ? "#4ade80" : "#f87171" }}>{status.msg}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={handleExport} disabled={crates.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
            borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg-tertiary)",
            fontSize: 12, fontWeight: 600, color: crates.length > 0 ? "var(--text-primary)" : "var(--text-muted)",
            cursor: crates.length > 0 ? "pointer" : "not-allowed", transition: "all 0.12s",
          }}>
          <Download size={13} /> Export Backup
        </button>

        <button onClick={() => fileRef.current?.click()}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
            borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg-tertiary)",
            fontSize: 12, fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", transition: "all 0.12s",
          }}>
          <Upload size={13} /> Import Backup
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />

        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} disabled={crates.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
              borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)",
              fontSize: 12, fontWeight: 600, color: crates.length > 0 ? "#ef4444" : "rgba(239,68,68,0.4)",
              cursor: crates.length > 0 ? "pointer" : "not-allowed", transition: "all 0.12s",
            }}>
            <Trash2 size={13} /> Clear All
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 500 }}>Delete all {crates.length} crates?</span>
            <button onClick={handleClearAll} style={{
              padding: "6px 12px", borderRadius: 6, border: "none",
              backgroundColor: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>Confirm</button>
            <button onClick={() => setConfirmClear(false)} style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)",
              backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Crate list */}
      {crates.length > 0 && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
            Your Crates
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {crates.slice(0, 8).map(c => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 10px", borderRadius: 6, backgroundColor: "var(--bg-tertiary)",
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{c.tracks.length} tracks</span>
              </div>
            ))}
            {crates.length > 8 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", paddingLeft: 10 }}>+{crates.length - 8} more</p>
            )}
          </div>
        </div>
      )}
    </SettingsCard>
  );
}

/* ════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Configure your CrateMate integrations and preferences.</p>
      </div>

      {/* Spotify — Primary integration */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader icon={Disc3} label="Streaming" />
        <SpotifySection />
      </section>

      {/* Music Sources (Beatport + SoundCloud) */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader icon={Music2} label="Music Sources" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <BeatportSetup />
          <SoundCloudSection />
        </div>
      </section>

      {/* Profile */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader icon={User} label="Profile" />
        <ProfileSection />
      </section>

      {/* Appearance */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader icon={Palette} label="Appearance" />
        <AppearanceSection />
      </section>

      {/* Library */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader icon={Database} label="Library" />
        <LibrarySection />
      </section>

      {/* Still Coming Soon */}
      {[
        { icon: Bell,  label: "Notifications", desc: "Radar alerts, new releases" },
        { icon: Globe, label: "Region",        desc: "Language, currency, date format" },
      ].map(({ icon: Icon, label, desc }) => (
        <div key={label} style={{
          border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px",
          marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
          backgroundColor: "var(--bg-secondary)", opacity: 0.55,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} style={{ color: "var(--text-muted)" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", padding: "2px 7px", borderRadius: 4, backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}>Coming soon</span>
        </div>
      ))}
    </div>
  );
}
