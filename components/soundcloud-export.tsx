"use client";
import { useState, useEffect } from "react";
import {
  ExternalLink, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, X
} from "lucide-react";
import {
  getSCToken, setSCToken, clearSCToken, getSCClientId, setSCClientId,
  buildSCAuthUrl, searchSCTrack, createSCPlaylist, SCToken
} from "@/lib/soundcloud";
import type { CrateTrack } from "@/lib/crates";

const cssVars = {
  border: "var(--border)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
};
const SC_ORANGE = "#FF5500";

interface Props {
  crateName: string;
  tracks:    CrateTrack[];
  onClose:   () => void;
}

type Phase = "idle" | "connecting" | "searching" | "creating" | "done" | "error";

export default function SoundCloudExport({ crateName, tracks, onClose }: Props) {
  const [clientId,   setClientId]   = useState("");
  const [token,      setToken]      = useState<SCToken | null>(null);
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [progress,   setProgress]   = useState(0);
  const [log,        setLog]        = useState<string[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [showSetup,  setShowSetup]  = useState(false);

  const REDIRECT_URI =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/soundcloud/callback`
      : "";

  useEffect(() => {
    const t  = getSCToken();
    const id = getSCClientId();
    setToken(t);
    setClientId(id);
    if (!id) setShowSetup(true);
  }, []);

  const addLog = (msg: string) => setLog(p => [...p, msg]);

  const handleConnect = () => {
    const id = clientId.trim();
    if (!id) { setShowSetup(true); return; }
    setSCClientId(id);
    setPhase("connecting");

    const popup = window.open(
      buildSCAuthUrl(id, REDIRECT_URI),
      "sc-auth",
      "width=520,height=680,scrollbars=yes"
    );

    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "SC_TOKEN") return;
      window.removeEventListener("message", onMsg);
      popup?.close();
      const t: SCToken = { access_token: e.data.token, expires_at: Date.now() + 31536000_000 };
      setSCToken(t);
      setToken(t);
      setPhase("idle");
    };
    window.addEventListener("message", onMsg);

    // Poll for popup close
    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll);
        window.removeEventListener("message", onMsg);
        if (phase === "connecting") setPhase("idle");
      }
    }, 800);
  };

  const handleExport = async () => {
    const t  = token || getSCToken();
    const id = getSCClientId();
    if (!t || !id) { setShowSetup(true); return; }

    setPhase("searching");
    setLog([]);
    setProgress(0);

    // Search for each track on SC
    const foundIds: number[] = [];
    const notFound: string[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      addLog(`Searching: ${track.artist} — ${track.title}`);
      setProgress(Math.round((i / tracks.length) * 70));

      const scId = await searchSCTrack(track.artist, track.title, t.access_token, id);
      if (scId) {
        foundIds.push(scId);
        addLog(`  ✓ Found (id: ${scId})`);
      } else {
        notFound.push(`${track.artist} — ${track.title}`);
        addLog(`  ✗ Not found on SoundCloud`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 150));
    }

    if (!foundIds.length) {
      setPhase("error");
      setErrorMsg("None of the tracks were found on SoundCloud.");
      return;
    }

    setPhase("creating");
    setProgress(85);
    addLog(`\nCreating playlist "${crateName}" with ${foundIds.length} tracks…`);

    const playlist = await createSCPlaylist(crateName, foundIds, t.access_token, id);
    if (!playlist) {
      setPhase("error");
      setErrorMsg("Failed to create SoundCloud playlist. Your token may have expired.");
      return;
    }

    setProgress(100);
    setPlaylistUrl(playlist.permalink_url);
    addLog(`✓ Playlist created!`);
    if (notFound.length) addLog(`\n${notFound.length} tracks not found on SoundCloud: ${notFound.join(", ")}`);
    setPhase("done");
  };

  const hasToken   = !!token;
  const hasClient  = !!clientId.trim();
  const canExport  = hasToken && hasClient;
  const isRunning  = phase === "searching" || phase === "creating";

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    }}>
      <div style={{
        backgroundColor: cssVars.bgSecondary, borderRadius: 16, width: "100%", maxWidth: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${cssVars.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#FF550015", border: "1px solid #FF550030", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: SC_ORANGE }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: cssVars.textPrimary }}>Export to SoundCloud</p>
            <p style={{ fontSize: 11, color: cssVars.textSecondary }}>{tracks.length} tracks · {crateName}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: cssVars.textMuted, padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Setup section */}
          <div style={{ borderRadius: 10, border: `1px solid ${cssVars.border}`, overflow: "hidden" }}>
            <button
              onClick={() => setShowSetup(!showSetup)}
              style={{ width: "100%", padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, border: "none", background: cssVars.bgHover, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: hasToken ? "#16a34a" : hasClient ? "#f59e0b" : cssVars.border, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: cssVars.textSecondary, flex: 1 }}>
                {hasToken ? "SoundCloud connected ✓" : hasClient ? "Client ID saved — connect account" : "Step 1: Set up SoundCloud app"}
              </span>
              {showSetup ? <ChevronUp size={13} color={cssVars.textMuted} /> : <ChevronDown size={13} color={cssVars.textMuted} />}
            </button>

            {showSetup && (
              <div style={{ padding: "14px 16px", borderTop: `1px solid ${cssVars.border}` }}>
                <p style={{ fontSize: 12, color: cssVars.textSecondary, marginBottom: 10, lineHeight: 1.6 }}>
                  You need a free SoundCloud developer app. Takes 2 minutes:
                </p>
                <ol style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: cssVars.textSecondary, lineHeight: 2 }}>
                  <li>Go to <a href="https://soundcloud.com/you/apps/new" target="_blank" rel="noopener noreferrer" style={{ color: SC_ORANGE }}>soundcloud.com/you/apps/new</a></li>
                  <li>App name: anything (e.g. "CrateMate")</li>
                  <li>Redirect URI: <code style={{ backgroundColor: cssVars.bgTertiary, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>{REDIRECT_URI}</code></li>
                  <li>Copy the <strong>Client ID</strong> and paste below</li>
                </ol>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    placeholder="SoundCloud Client ID"
                    style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 7, border: `1px solid ${cssVars.border}`, fontSize: 12, outline: "none", fontFamily: "monospace", backgroundColor: cssVars.bgTertiary, color: cssVars.textPrimary }}
                  />
                  <button
                    onClick={() => { setSCClientId(clientId.trim()); setShowSetup(false); }}
                    disabled={!clientId.trim()}
                    style={{ padding: "0 14px", borderRadius: 7, border: "none", backgroundColor: clientId.trim() ? SC_ORANGE : cssVars.bgHover, color: clientId.trim() ? "#fff" : cssVars.textMuted, fontSize: 12, fontWeight: 600, cursor: clientId.trim() ? "pointer" : "not-allowed" }}>
                    Save
                  </button>
                </div>

                {hasClient && !hasToken && (
                  <button onClick={handleConnect} style={{ marginTop: 10, width: "100%", padding: "9px", borderRadius: 8, border: "none", backgroundColor: SC_ORANGE, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {phase === "connecting" ? "Waiting for SoundCloud…" : "Connect SoundCloud Account"}
                  </button>
                )}

                {hasToken && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <Check size={13} color="#16a34a" />
                    <span style={{ fontSize: 12, color: "#15803d" }}>Account connected</span>
                    <button onClick={() => { clearSCToken(); setToken(null); }} style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>Disconnect</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress log */}
          {log.length > 0 && (
            <div style={{ borderRadius: 8, backgroundColor: "var(--bg-primary)", padding: "10px 12px", maxHeight: 160, overflowY: "auto" }}>
              {log.map((l, i) => (
                <p key={i} style={{ fontSize: 10, fontFamily: "monospace", color: l.startsWith("  ✓") ? "#86efac" : l.startsWith("  ✗") ? "#fca5a5" : l.startsWith("✓") ? "#86efac" : cssVars.textMuted, lineHeight: 1.7, margin: 0 }}>{l}</p>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {isRunning && (
            <div>
              <div style={{ height: 4, borderRadius: 20, backgroundColor: cssVars.border, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 20, backgroundColor: SC_ORANGE, width: `${progress}%`, transition: "width 0.3s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: cssVars.textMuted, marginTop: 5 }}>
                {phase === "searching" ? `Finding tracks on SoundCloud… ${progress}%` : "Creating playlist…"}
              </p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && errorMsg && (
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#dc2626" }}>{errorMsg}</p>
            </div>
          )}

          {/* Done */}
          {phase === "done" && playlistUrl && (
            <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>🎉 Playlist created on SoundCloud!</p>
              <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, backgroundColor: SC_ORANGE, color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                Open on SoundCloud <ExternalLink size={11} />
              </a>
            </div>
          )}

          {/* Actions */}
          {phase !== "done" && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${cssVars.border}`, background: cssVars.bgTertiary, fontSize: 13, color: cssVars.textSecondary, cursor: "pointer" }}>
                Cancel
              </button>
              {!hasToken ? (
                <button onClick={handleConnect} disabled={!hasClient || phase === "connecting"}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", backgroundColor: hasClient ? SC_ORANGE : cssVars.bgHover, color: hasClient ? "#fff" : cssVars.textMuted, fontSize: 13, fontWeight: 700, cursor: hasClient ? "pointer" : "not-allowed" }}>
                  {phase === "connecting" ? <><Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> Connecting…</> : "Connect SoundCloud"}
                </button>
              ) : (
                <button onClick={handleExport} disabled={isRunning}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", backgroundColor: isRunning ? cssVars.bgHover : SC_ORANGE, color: isRunning ? cssVars.textMuted : "#fff", fontSize: 13, fontWeight: 700, cursor: isRunning ? "not-allowed" : "pointer" }}>
                  {isRunning
                    ? <><Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> Exporting…</>
                    : `Export ${tracks.length} Tracks →`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
