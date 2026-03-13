"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveSpotifyUserToken } from "@/lib/spotify";

function SpotifyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to Spotify...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");

      // Handle authorization error
      if (error) {
        console.error("Spotify auth error:", error);
        setStatus("error");
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            router.push("/settings");
          }
        }, 2000);
        return;
      }

      // No auth code
      if (!code) {
        console.error("No authorization code received");
        setStatus("error");
        setMessage("No authorization code received");
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            router.push("/settings");
          }
        }, 2000);
        return;
      }

      // Exchange code for tokens
      try {
        const redirectUri =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/spotify/callback`
            : "";

        const res = await fetch("/api/spotify-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Token exchange failed");
        }

        const data = await res.json();

        // Save tokens to localStorage
        saveSpotifyUserToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: Date.now() + data.expiresIn * 1000,
        });

        setStatus("success");
        setMessage("Successfully connected to Spotify!");

        // Close popup or redirect after 2 seconds
        setTimeout(() => {
          if (window.opener) {
            // Opened from popup
            window.opener.postMessage(
              { type: "spotify_auth_success", accessToken: data.accessToken },
              window.location.origin
            );
            window.close();
          } else {
            // Direct navigation
            router.push("/settings");
          }
        }, 2000);
      } catch (err: any) {
        console.error("Token exchange error:", err);
        setStatus("error");
        setMessage(`Connection failed: ${err.message}`);

        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            router.push("/settings");
          }
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.spinner} />
            <h1 style={styles.title}>{message}</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.title}>{message}</h1>
            <p style={styles.subtitle}>Returning to CrateMate...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h1 style={styles.title}>{message}</h1>
            <p style={styles.subtitle}>Check that your redirect URI is configured correctly</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>Connecting to Spotify...</div>}>
      <SpotifyCallbackContent />
    </Suspense>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    textAlign: "center" as const,
    padding: "40px",
    borderRadius: "12px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    maxWidth: "400px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    margin: "0 auto 24px",
    border: "3px solid #333",
    borderTopColor: "#1DB954",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 24px",
    fontSize: "40px",
    lineHeight: "60px",
    backgroundColor: "#1DB954",
    borderRadius: "50%",
    color: "#fff",
  },
  errorIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 24px",
    fontSize: "40px",
    lineHeight: "60px",
    backgroundColor: "#e74c3c",
    borderRadius: "50%",
    color: "#fff",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: 0,
  },
};

// Add CSS animation for spinner
if (typeof document !== "undefined" && !document.getElementById("spotify-callback-styles")) {
  const style = document.createElement("style");
  style.id = "spotify-callback-styles";
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
