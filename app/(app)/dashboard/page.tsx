"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Archive, Radio, TrendingUp, Gem, ArrowRight, Music2, Clock } from "lucide-react";
import { getCrates, type Crate } from "@/lib/crates";

export default function DashboardPage() {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [djName, setDjName] = useState("DJ");

  useEffect(() => {
    setCrates(getCrates());
    setLoaded(true);
    try {
      const p = JSON.parse(localStorage.getItem("cratemate_profile") || "{}");
      if (p.djName) setDjName(p.djName);
    } catch {}
  }, []);

  const totalTracks = crates.reduce((sum, c) => sum + c.tracks.length, 0);
  const topCrate = crates[0];

  // Recent tracks: flatten all crate tracks, take latest 5
  const recentTracks = crates
    .flatMap(c => c.tracks.map(t => ({ ...t, crateName: c.name, crateCreatedAt: c.createdAt })))
    .sort((a, b) => (b.crateCreatedAt || 0) - (a.crateCreatedAt || 0))
    .slice(0, 5);

  const statCards = [
    { label: "Total Tracks", value: loaded ? String(totalTracks) : "—", icon: Music2 },
    { label: "Active Crates", value: loaded ? String(crates.length) : "—", icon: Archive },
    { label: "Digs Completed", value: loaded ? String(crates.length) : "—", icon: Search },
    { label: "Top Genre", value: "House", icon: TrendingUp },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}>
          {greeting}, {djName}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {loaded ? `${totalTracks} tracks in your crate` : "Load your collection"}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "rgba(0,212,170,0.1)",
                border: "1px solid rgba(0,212,170,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon size={20} style={{ color: "var(--accent-primary)" }} />
              </div>
              <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/new-dig" style={{
          backgroundColor: "var(--accent-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          <Search size={16} />
          Start New Dig
        </Link>
        <div style={{
          backgroundColor: "rgba(76,175,80,0.15)",
          border: "1px solid rgba(76,175,80,0.3)",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "#4CAF50",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.2)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.15)"}
        >
          Connect Spotify
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Recent Tracks */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Recent Finds</p>
            <Link href="/crate" style={{
              fontSize: 12,
              color: "var(--accent-primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentTracks.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "32px 0", textAlign: "center" }}>
              No tracks yet. Start a New Dig to get rolling!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentTracks.map((t, i) => (
                <div
                  key={`${t.artist}-${t.title}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: i < recentTracks.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {t.artist}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {t.title}
                    </p>
                  </div>
                  {t.key && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--accent-primary)",
                      backgroundColor: "rgba(0,212,170,0.1)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      flexShrink: 0,
                    }}>
                      {t.key}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Active Crate */}
          {topCrate ? (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Latest Crate</p>
                <Link href="/crate" style={{ fontSize: 11, color: "var(--accent-primary)", textDecoration: "none" }}>
                  Open →
                </Link>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px",
                borderRadius: 8,
                backgroundColor: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.15)",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "rgba(0,212,170,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Archive size={16} style={{ color: "var(--accent-primary)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{topCrate.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{topCrate.tracks.length} tracks</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                Latest Crate
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No crates saved yet.</p>
            </div>
          )}

          {/* Getting Started */}
          <div style={{
            backgroundColor: "rgba(0,212,170,0.08)",
            border: "1px solid rgba(0,212,170,0.15)",
            borderRadius: 12,
            padding: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
              Quick Tip
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Import a SoundCloud or Spotify playlist to get started analyzing tracks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
