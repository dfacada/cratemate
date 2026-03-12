"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { setBPToken, parsePastedToken } from "@/lib/beatport";

function CallbackHandler() {
  const sp     = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const tokensParam = sp.get("tokens");
    if (!tokensParam) { setStatus("error"); return; }
    try {
      const parsed = parsePastedToken(decodeURIComponent(tokensParam));
      if (!parsed) throw new Error("bad token");
      setBPToken(parsed);
      setStatus("success");
      setTimeout(() => router.push("/settings?bp=connected"), 1500);
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#F0F4F8" }}>
      <div style={{ textAlign: "center", padding: 40, backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        {status === "loading" && <>
          <Loader2 size={32} color="#00B4D8" style={{ animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Connecting to Beatport…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>}
        {status === "success" && <>
          <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#f0fdf4", border: "1px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Check size={24} color="#16a34a" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Beatport connected!</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Redirecting to settings…</p>
        </>}
        {status === "error" && <>
          <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Connection failed</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>The authorization may have expired.</p>
          <button onClick={() => router.push("/settings")}
            style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, backgroundColor: "#00B4D8", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Back to Settings
          </button>
        </>}
      </div>
    </div>
  );
}

export default function BeatportCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#F0F4F8" }}>
        <Loader2 size={32} color="#00B4D8" style={{ animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
