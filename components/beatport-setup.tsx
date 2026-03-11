"use client";
import { useState, useEffect } from "react";
import { Check, Copy, AlertCircle, ExternalLink, RefreshCw, Trash2, ShieldCheck } from "lucide-react";
import { getBPToken, setBPToken, clearBPToken, parsePastedToken, BeatportToken } from "@/lib/beatport";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

const STEPS = [
  { n: 1, text: 'Open', link: { label: "api.beatport.com/v4/docs", href: "https://api.beatport.com/v4/docs/" } },
  { n: 2, text: "Open DevTools → Network tab (Cmd+Option+I on Mac, F12 on PC)" },
  { n: 3, text: 'Click "Authorize" and log in with your Beatport credentials' },
  { n: 4, text: 'In the Network tab, search for "token" and click the POST to /v4/auth/o/token/' },
  { n: 5, text: 'Click the "Response" tab and copy the entire JSON object' },
  { n: 6, text: "Paste it in the box below" },
];

export default function BeatportSetup({ onConnected }: { onConnected?: () => void }) {
  const [token,    setToken]    = useState<BeatportToken | null>(null);
  const [pasted,   setPasted]   = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => { setToken(getBPToken()); }, []);

  const handleSave = () => {
    setError(null);
    const parsed = parsePastedToken(pasted);
    if (!parsed) {
      setError("Invalid token JSON. Make sure you copied the entire response including the curly braces.");
      return;
    }
    setBPToken(parsed);
    setToken(parsed);
    setPasted("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onConnected?.();
  };

  const handleClear = () => {
    clearBPToken();
    setToken(null);
  };

  const isExpired = token && token.expires_at < Date.now();
  const expiresIn = token ? Math.max(0, Math.round((token.expires_at - Date.now()) / 60000)) : 0;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#04BE5B15", border: "1px solid #04BE5B30", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Beatport Integration</p>
          <p style={{ fontSize: 12, color: A.t4 }}>Search & metadata from Beatport's catalog</p>
        </div>
        {token && !isExpired && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}>
            <ShieldCheck size={12} color="#16a34a" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Connected</span>
          </div>
        )}
        {(isExpired || !token) && token && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#fef9c3", border: "1px solid #fde047" }}>
            <AlertCircle size={12} color="#ca8a04" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#ca8a04" }}>Token expired</span>
          </div>
        )}
      </div>

      <div style={{ padding: 20 }}>

        {/* Current token status */}
        {token && !isExpired && (
          <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>
                Token active — expires in {expiresIn < 60 ? `${expiresIn}m` : `${Math.round(expiresIn / 60)}h`}
              </p>
              <p style={{ fontSize: 10, color: "#86efac", marginTop: 2 }}>
                CrateMate will auto-refresh using the refresh token when it expires.
              </p>
            </div>
            <button onClick={handleClear}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: "pointer", fontSize: 11, color: "#dc2626" }}>
              <Trash2 size={10} /> Disconnect
            </button>
          </div>
        )}

        {/* Setup steps */}
        {(!token || isExpired) && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: A.t1, marginBottom: 12 }}>
              {isExpired ? "Re-authenticate with Beatport:" : "Connect your Beatport account:"}
            </p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {STEPS.map(s => (
                <li key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: A.accentBg, border: `1px solid ${A.accentBorder}`, color: A.accent, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{s.n}</span>
                  <span style={{ fontSize: 12, color: A.t3, lineHeight: 1.5 }}>
                    {s.text}{" "}
                    {s.link && (
                      <a href={s.link.href} target="_blank" rel="noopener noreferrer"
                        style={{ color: A.accent, textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}>
                        {s.link.label} <ExternalLink size={10} />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Paste area */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: A.t4, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            {token && !isExpired ? "REPLACE TOKEN (paste new JSON)" : "PASTE TOKEN JSON"}
          </label>
          <textarea
            value={pasted}
            onChange={e => setPasted(e.target.value)}
            placeholder={'{"access_token":"...","refresh_token":"...","token_type":"Bearer","expires_in":3600}'}
            style={{
              width: "100%", height: 80, padding: "8px 10px",
              border: `1px solid ${error ? "#fca5a5" : A.border}`,
              borderRadius: 8, fontSize: 11, fontFamily: "monospace",
              resize: "vertical", color: A.t1, backgroundColor: "#fafafa",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fecaca", marginBottom: 12 }}>
            <AlertCircle size={12} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={!pasted.trim()}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pasted.trim() ? "pointer" : "not-allowed",
              backgroundColor: saved ? "#16a34a" : pasted.trim() ? "#04BE5B" : "#e2e8f0",
              color: pasted.trim() ? "#fff" : A.t5,
              border: "none", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
            }}
          >
            {saved ? <><Check size={12} /> Saved!</> : "Save Token"}
          </button>
          <a href="https://api.beatport.com/v4/docs/" target="_blank" rel="noopener noreferrer"
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${A.border}`, color: A.t4, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            Open Beatport Docs <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
