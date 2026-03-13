"use client";
import { useState, useEffect } from "react";
import { Check, AlertCircle, Trash2, ShieldCheck, Copy, ExternalLink } from "lucide-react";
import { getBPToken, setBPToken, clearBPToken, parsePastedToken, BeatportToken } from "@/lib/beatport";


const CLIENT_ID    = "0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd";
const REDIRECT_URI = "https://api.beatport.com/v4/auth/o/post-message/";

const AUTH_URL = `https://api.beatport.com/v4/auth/o/authorize/?${new URLSearchParams({
  response_type: "code",
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
})}`;

// This bookmarklet runs on the Beatport docs page after login and fetches + copies the token JSON
const BOOKMARKLET_CODE = `javascript:(async()=>{const r=await fetch('https://api.beatport.com/v4/auth/o/token/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:'${CLIENT_ID}'})});const t=await r.json();if(t.access_token){navigator.clipboard.writeText(JSON.stringify(t));alert('Token copied to clipboard!');}else{alert('Could not get token. Try logging in first.');}})();`;

const cssVars = {
  bgPrimary: "var(--bg-primary)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgHover: "var(--bg-hover)",
  border: "var(--border)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  accentPrimary: "var(--accent-primary)",
  accentSecondary: "var(--accent-secondary)",
};

export default function BeatportSetup({ onConnected }: { onConnected?: () => void }) {
  const [token,      setToken]      = useState<BeatportToken | null>(null);
  const [pasted,     setPasted]     = useState("");
  const [error,      setError]      = useState<string | null>(null);
  const [saved,      setSaved]      = useState(false);
  const [step,       setStep]       = useState<1|2|3>(1);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => { setToken(getBPToken()); }, []);

  const handleSave = () => {
    setError(null);
    const parsed = parsePastedToken(pasted);
    if (!parsed) { setError("Invalid JSON — make sure you copied the entire response body (the curly braces and everything inside)."); return; }
    setBPToken(parsed);
    setToken(parsed);
    setPasted("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onConnected?.();
  };

  const handleClear = () => { clearBPToken(); setToken(null); setStep(1); };

  const copyNetworkStep = () => {
    // Instructions for what to look for
    navigator.clipboard.writeText("https://api.beatport.com/v4/auth/o/token/").catch(() => {});
  };

  const isExpired  = token && token.expires_at < Date.now();
  const expiresMin = token ? Math.max(0, Math.round((token.expires_at - Date.now()) / 60000)) : 0;
  const connected  = token && !isExpired;

  return (
    <div style={{ border: `1px solid ${cssVars.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: cssVars.bgSecondary }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${cssVars.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#04BE5B15", border: "1px solid #04BE5B30", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: cssVars.textPrimary }}>Beatport</p>
          <p style={{ fontSize: 12, color: cssVars.textSecondary }}>BPM · key · label · Buy links</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {connected && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}>
              <ShieldCheck size={12} color="#16a34a" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Connected</span>
            </div>
          )}
          {isExpired && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, backgroundColor: "#fef9c3", border: "1px solid #fde047" }}>
              <AlertCircle size={12} color="#ca8a04" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#ca8a04" }}>Expired</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 20 }}>

        {/* ── Connected ── */}
        {connected && (
          <div style={{ padding: "12px 14px", borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* ── Setup flow ── */}
        {!connected && (
          <>
            <p style={{ fontSize: 13, color: cssVars.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
              {isExpired ? "Your token expired. Follow the steps below to re-authenticate." : "Connect your Beatport account in 3 steps."}
            </p>

            {/* Step 1 */}
            <Step n={1} active={step >= 1} label="Open Beatport and log in">
              <a href="https://api.beatport.com/v4/docs/" target="_blank" rel="noopener noreferrer"
                onClick={() => setStep(2)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, backgroundColor: "#04BE5B", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                Open Beatport API Docs <ExternalLink size={11} />
              </a>
              <p style={{ fontSize: 11, color: cssVars.textMuted, lineHeight: 1.5 }}>
                Click the link above. On the page that opens, click <strong style={{ color: cssVars.textSecondary }}>Authorize</strong> and log in with your Beatport credentials.
              </p>
            </Step>

            {/* Step 2 */}
            <Step n={2} active={step >= 2} label="Open DevTools → Network tab, then click Authorize">
              <p style={{ fontSize: 11, color: cssVars.textSecondary, marginBottom: 8, lineHeight: 1.6 }}>
                Before clicking Authorize on Beatport:
              </p>
              <ol style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "Press F12 (Windows) or Cmd+Option+I (Mac) to open DevTools",
                  'Click the "Network" tab at the top of DevTools',
                  'Now click "Authorize" and log in on the Beatport page',
                ].map((t, i) => (
                  <li key={i} style={{ fontSize: 11, color: cssVars.textSecondary, lineHeight: 1.6 }}>{t}</li>
                ))}
              </ol>
              <button onClick={() => setStep(3)} style={{ marginTop: 10, padding: "6px 12px", borderRadius: 7, border: `1px solid ${cssVars.border}`, backgroundColor: cssVars.bgTertiary, fontSize: 11, fontWeight: 600, color: cssVars.textSecondary, cursor: "pointer" }}>
                Done, I logged in →
              </button>
            </Step>

            {/* Step 3 */}
            <Step n={3} active={step >= 3} label="Copy the token response and paste below">
              <div style={{ backgroundColor: cssVars.bgPrimary, borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontFamily: "monospace", fontSize: 11 }}>
                <p style={{ color: cssVars.textSecondary, marginBottom: 4 }}>In the Network tab, filter by:</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#7dd3fc", flex: 1 }}>token</span>
                  <button onClick={copyNetworkStep} style={{ background: "none", border: `1px solid ${cssVars.border}`, borderRadius: 4, padding: "2px 7px", color: cssVars.textMuted, fontSize: 10, cursor: "pointer" }}>copy url</button>
                </div>
                <p style={{ color: cssVars.textSecondary, marginTop: 8, marginBottom: 4 }}>Click the POST request → Response tab → copy all the JSON</p>
              </div>

              <textarea
                value={pasted}
                onChange={e => { setPasted(e.target.value); setError(null); }}
                placeholder={'{"access_token":"eyJ...","refresh_token":"...","expires_in":3600,"token_type":"Bearer"}'}
                style={{
                  width: "100%", height: 88, padding: "9px 11px",
                  border: `1.5px solid ${error ? "#fca5a5" : pasted ? cssVars.accentPrimary : cssVars.border}`,
                  borderRadius: 8, fontSize: 11, fontFamily: "monospace",
                  resize: "vertical", color: cssVars.textPrimary, backgroundColor: cssVars.bgTertiary,
                  outline: "none", boxSizing: "border-box", lineHeight: 1.5,
                  transition: "border-color 0.15s",
                }}
              />

              {error && (
                <div style={{ display: "flex", gap: 6, padding: "7px 10px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fecaca", marginTop: 6 }}>
                  <AlertCircle size={12} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 11, color: "#dc2626" }}>{error}</p>
                </div>
              )}

              <button onClick={handleSave} disabled={!pasted.trim()}
                style={{
                  marginTop: 10, padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: pasted.trim() ? "pointer" : "not-allowed",
                  backgroundColor: saved ? "#16a34a" : pasted.trim() ? "#04BE5B" : cssVars.bgHover,
                  color: pasted.trim() ? "#fff" : cssVars.textMuted,
                  border: "none", display: "flex", alignItems: "center", gap: 7,
                  transition: "background-color 0.15s",
                }}>
                {saved ? <><Check size={13} /> Connected!</> : "Save & Connect"}
              </button>
            </Step>
          </>
        )}
      </div>
    </div>
  );
}

function Step({ n, active, label, children }: { n: number; active: boolean; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, opacity: active ? 1 : 0.35 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: active ? cssVars.accentPrimary : cssVars.bgHover, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : cssVars.textMuted }}>{n}</span>
        </div>
        {n < 3 && <div style={{ width: 1, flex: 1, minHeight: 20, backgroundColor: cssVars.border }} />}
      </div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: cssVars.textPrimary, marginBottom: 10 }}>{label}</p>
        {children}
      </div>
    </div>
  );
}
