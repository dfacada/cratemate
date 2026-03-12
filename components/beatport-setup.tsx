"use client";
import { useState, useEffect } from "react";
import { Check, AlertCircle, ExternalLink, Trash2, ShieldCheck } from "lucide-react";
import { getBPToken, setBPToken, clearBPToken, parsePastedToken, BeatportToken } from "@/lib/beatport";
import { useSearchParams } from "next/navigation";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

const CLIENT_ID    = "0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd";
const BASE_URL     = typeof window !== "undefined" ? window.location.origin : "https://cratemate-five.vercel.app";
const REDIRECT_URI = `${BASE_URL}/auth/beatport/callback`;

function buildBeatportAuthUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
  });
  return `https://api.beatport.com/v4/auth/o/authorize/?${params}`;
}

export default function BeatportSetup({ onConnected }: { onConnected?: () => void }) {
  const [token,  setToken]  = useState<BeatportToken | null>(null);
  const [pasted, setPasted] = useState("");
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    setToken(getBPToken());
    // Check if we just came back from successful OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get("bp") === "connected") {
      setToken(getBPToken());
      window.history.replaceState({}, "", "/settings");
    }
    if (params.get("bp") === "error") {
      setError("Authorization failed or expired. Please try again.");
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const handleConnect = () => {
    window.location.href = buildBeatportAuthUrl();
  };

  const handleSave = () => {
    setError(null);
    const parsed = parsePastedToken(pasted);
    if (!parsed) {
      setError("Invalid JSON. Make sure you copied the entire response including the curly braces.");
      return;
    }
    setBPToken(parsed);
    setToken(parsed);
    setPasted("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onConnected?.();
  };

  const handleClear = () => { clearBPToken(); setToken(null); };

  const isExpired   = token && token.expires_at < Date.now();
  const expiresMin  = token ? Math.max(0, Math.round((token.expires_at - Date.now()) / 60000)) : 0;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#04BE5B15", border: "1px solid #04BE5B30", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Beatport</p>
          <p style={{ fontSize: 12, color: A.t4 }}>BPM, key, label metadata + Buy links</p>
        </div>
        {token && !isExpired ? (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}>
            <ShieldCheck size={12} color="#16a34a" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Connected</span>
          </div>
        ) : token ? (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#fef9c3", border: "1px solid #fde047" }}>
            <AlertCircle size={12} color="#ca8a04" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#ca8a04" }}>Token expired</span>
          </div>
        ) : null}
      </div>

      <div style={{ padding: 20 }}>

        {/* Connected state */}
        {token && !isExpired && (
          <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>
                Token active — expires in {expiresMin < 60 ? `${expiresMin}m` : `${Math.round(expiresMin / 60)}h`}
              </p>
              <p style={{ fontSize: 10, color: "#86efac", marginTop: 2 }}>Auto-refreshes on expiry.</p>
            </div>
            <button onClick={handleClear}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: "pointer", fontSize: 11, color: "#dc2626" }}>
              <Trash2 size={10} /> Disconnect
            </button>
          </div>
        )}

        {/* Primary connect button */}
        {(!token || isExpired) && (
          <>
            <p style={{ fontSize: 13, color: A.t3, marginBottom: 14, lineHeight: 1.5 }}>
              Click below to authorize CrateMate with your Beatport account. You&apos;ll be redirected to Beatport and back automatically.
            </p>

            <button onClick={handleConnect}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, backgroundColor: "#04BE5B", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 24 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
              </div>
              Connect Beatport Account
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: A.border }} />
              <span style={{ fontSize: 11, color: A.t5 }}>or paste token manually</span>
              <div style={{ flex: 1, height: 1, backgroundColor: A.border }} />
            </div>
          </>
        )}

        {/* Manual paste fallback */}
        {(token && isExpired || !token) && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: A.t4, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              PASTE TOKEN JSON (from Beatport Network tab)
            </label>
            <textarea
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder={'{"access_token":"...","refresh_token":"...","expires_in":3600}'}
              style={{ width: "100%", height: 72, padding: "8px 10px", border: `1px solid ${error ? "#fca5a5" : A.border}`, borderRadius: 8, fontSize: 11, fontFamily: "monospace", resize: "vertical", color: A.t1, backgroundColor: "#fafafa", outline: "none", boxSizing: "border-box" }}
            />
            {error && (
              <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fecaca", marginTop: 8 }}>
                <AlertCircle size={12} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "#dc2626" }}>{error}</p>
              </div>
            )}
            <button onClick={handleSave} disabled={!pasted.trim()}
              style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pasted.trim() ? "pointer" : "not-allowed", backgroundColor: saved ? "#16a34a" : pasted.trim() ? A.accent : "#e2e8f0", color: pasted.trim() ? "#fff" : A.t5, border: "none", display: "flex", alignItems: "center", gap: 6 }}>
              {saved ? <><Check size={12} /> Saved!</> : "Save Token"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
