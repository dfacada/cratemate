"use client";
import { useState, useEffect, useRef } from "react";
import { Check, AlertCircle, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { getBPToken, setBPToken, clearBPToken, parsePastedToken, BeatportToken } from "@/lib/beatport";

const A = {
  border: "#e2e8f0", t1: "#0f172a", t3: "#334155", t4: "#64748b", t5: "#94a3b8",
  accent: "#00B4D8", accentBg: "rgba(0,180,216,0.09)", accentBorder: "rgba(0,180,216,0.2)",
};

const CLIENT_ID    = "0GIvkCltVIuPkkwSJHp6NDb3s0potTjLBQr388Dd";
const REDIRECT_URI = "https://api.beatport.com/v4/auth/o/post-message/";

function buildAuthUrl() {
  return `https://api.beatport.com/v4/auth/o/authorize/?${new URLSearchParams({
    response_type: "code",
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
  })}`;
}

export default function BeatportSetup({ onConnected }: { onConnected?: () => void }) {
  const [token,      setToken]      = useState<BeatportToken | null>(null);
  const [authStatus, setAuthStatus] = useState<"idle" | "waiting" | "exchanging" | "error">("idle");
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [debugLog,   setDebugLog]   = useState<string[]>([]);
  const [pasted,     setPasted]     = useState("");
  const [pasteSaved, setPasteSaved] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setToken(getBPToken());
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, []);

  const log = (msg: string) => setDebugLog(prev => [...prev.slice(-8), msg]);

  const handleConnect = () => {
    setErrorMsg(null);
    setDebugLog([]);
    setAuthStatus("waiting");

    const popup = window.open(buildAuthUrl(), "beatport-auth", "width=520,height=680,scrollbars=yes");
    popupRef.current = popup;

    if (!popup) {
      setAuthStatus("error");
      setErrorMsg("Popup blocked — allow popups for this site.");
      return;
    }

    log("Popup opened, waiting for postMessage…");

    // Catch ALL messages so we can see exactly what Beatport sends
    const onMessage = async (event: MessageEvent) => {
      log(`msg from ${event.origin}: ${JSON.stringify(event.data).slice(0, 200)}`);

      // Only process messages from Beatport
      if (!event.origin.includes("beatport.com")) return;

      const data = event.data;

      // Try every possible field Beatport might send the code under
      const code =
        data?.code ||
        data?.authorization_code ||
        data?.authorizationCode ||
        (typeof data === "string" && data.match(/code=([^&]+)/)?.[1]) ||
        null;

      if (!code) {
        log(`No code found in message, fields: ${Object.keys(data || {}).join(", ")}`);
        return;
      }

      log(`Got code: ${code.slice(0, 12)}…`);
      window.removeEventListener("message", onMessage);
      timerRef.current && clearInterval(timerRef.current);
      popup.close();
      await exchangeCode(code);
    };

    window.addEventListener("message", onMessage);

    // Poll for popup close
    timerRef.current = setInterval(() => {
      if (popup.closed) {
        clearInterval(timerRef.current!);
        window.removeEventListener("message", onMessage);
        log("Popup closed by user");
        setAuthStatus(prev => prev === "waiting" ? "idle" : prev);
      }
    }, 800);
  };

  const exchangeCode = async (code: string) => {
    setAuthStatus("exchanging");
    try {
      const res  = await fetch("/api/beatport-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) throw new Error(data.error || "Exchange failed");
      const parsed = parsePastedToken(JSON.stringify(data));
      if (!parsed) throw new Error("Bad token shape");
      setBPToken(parsed);
      setToken(parsed);
      setAuthStatus("idle");
      onConnected?.();
      log("✓ Connected!");
    } catch (e: any) {
      setAuthStatus("error");
      setErrorMsg(e.message);
      log(`Exchange error: ${e.message}`);
    }
  };

  const handlePasteSave = () => {
    setErrorMsg(null);
    const parsed = parsePastedToken(pasted);
    if (!parsed) { setErrorMsg("Invalid JSON."); return; }
    setBPToken(parsed);
    setToken(parsed);
    setPasted("");
    setPasteSaved(true);
    setTimeout(() => setPasteSaved(false), 2500);
    onConnected?.();
  };

  const handleClear = () => { clearBPToken(); setToken(null); setAuthStatus("idle"); setDebugLog([]); };

  const isExpired  = token && token.expires_at < Date.now();
  const expiresMin = token ? Math.max(0, Math.round((token.expires_at - Date.now()) / 60000)) : 0;
  const connected  = token && !isExpired;

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#04BE5B15", border: "1px solid #04BE5B30", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#04BE5B" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: A.t1 }}>Beatport</p>
          <p style={{ fontSize: 12, color: A.t4 }}>BPM · key · label · Buy links</p>
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

        {connected && (
          <div style={{ padding: "12px 14px", borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>
                Token active — expires in {expiresMin < 60 ? `${expiresMin}m` : `${Math.round(expiresMin / 60)}h`}
              </p>
            </div>
            <button onClick={handleClear}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: "pointer", fontSize: 11, color: "#dc2626" }}>
              <Trash2 size={10} /> Disconnect
            </button>
          </div>
        )}

        {!connected && (
          <>
            <p style={{ fontSize: 13, color: A.t3, marginBottom: 12, lineHeight: 1.5 }}>
              {isExpired ? "Your token expired. Re-connect to continue." : "Authorize CrateMate with your Beatport account."}
            </p>

            <button onClick={handleConnect}
              disabled={authStatus === "waiting" || authStatus === "exchanging"}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9,
                backgroundColor: "#04BE5B", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                cursor: (authStatus === "waiting" || authStatus === "exchanging") ? "default" : "pointer",
                opacity: (authStatus === "waiting" || authStatus === "exchanging") ? 0.8 : 1,
                marginBottom: 8,
              }}>
              {(authStatus === "waiting" || authStatus === "exchanging")
                ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
                    {authStatus === "waiting" ? "Waiting for Beatport login…" : "Authorizing…"}</>
                : <><div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#04BE5B" }} /></div>
                  {isExpired ? "Re-connect Beatport" : "Connect Beatport Account"}</>}
            </button>

            {authStatus === "waiting" && (
              <p style={{ fontSize: 11, color: A.t5, marginBottom: 12 }}>
                Complete the login in the Beatport popup, then come back here.
              </p>
            )}

            {/* Debug log — visible during auth so we can see what Beatport sends */}
            {debugLog.length > 0 && (
              <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 8, backgroundColor: "#0f172a", border: "1px solid #1e293b" }}>
                <p style={{ fontSize: 10, color: "#64748b", marginBottom: 6, fontWeight: 700, letterSpacing: "0.05em" }}>DEBUG LOG</p>
                {debugLog.map((line, i) => (
                  <p key={i} style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", lineHeight: 1.6 }}>{line}</p>
                ))}
              </div>
            )}

            {errorMsg && (
              <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fecaca", marginBottom: 16 }}>
                <AlertCircle size={12} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "#dc2626" }}>{errorMsg}</p>
              </div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, backgroundColor: A.border }} />
              <span style={{ fontSize: 11, color: A.t5 }}>or paste token JSON manually</span>
              <div style={{ flex: 1, height: 1, backgroundColor: A.border }} />
            </div>

            {/* Manual paste */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: A.t4, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                TOKEN JSON (Network tab → POST /v4/auth/o/token/ → Response tab)
              </label>
              <textarea value={pasted} onChange={e => setPasted(e.target.value)}
                placeholder={'{"access_token":"...","refresh_token":"...","expires_in":3600}'}
                style={{ width: "100%", height: 72, padding: "8px 10px", border: `1px solid ${A.border}`, borderRadius: 8, fontSize: 11, fontFamily: "monospace", resize: "vertical", color: A.t1, backgroundColor: "#fafafa", outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={handlePasteSave} disabled={!pasted.trim()}
                style={{ marginTop: 8, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pasted.trim() ? "pointer" : "not-allowed", backgroundColor: pasteSaved ? "#16a34a" : pasted.trim() ? A.accent : "#e2e8f0", color: pasted.trim() ? "#fff" : A.t5, border: "none", display: "flex", alignItems: "center", gap: 6 }}>
                {pasteSaved ? <><Check size={12} /> Saved!</> : "Save Token"}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
