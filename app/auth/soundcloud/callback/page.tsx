"use client";
import { useEffect } from "react";

// SoundCloud implicit grant returns token in URL fragment: #access_token=...
export default function SCCallbackPage() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    if (token && window.opener) {
      window.opener.postMessage({ type: "SC_TOKEN", token }, window.location.origin);
      window.close();
    } else {
      // No opener (direct navigation) — store and redirect
      if (token) {
        localStorage.setItem("cratemate_sc_token", JSON.stringify({
          access_token: token,
          expires_at: Date.now() + 31536000_000,
        }));
      }
      window.location.href = "/settings?sc=" + (token ? "connected" : "error");
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#F0F4F8" }}>
      <p style={{ fontSize: 14, color: "#64748b" }}>Connecting to SoundCloud…</p>
    </div>
  );
}
