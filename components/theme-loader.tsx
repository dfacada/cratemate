"use client";
import { useEffect } from "react";

const APPEARANCE_KEY = "cratemate_appearance";

/**
 * Client component that applies saved theme settings (accent color)
 * on every page load. Renders nothing visible.
 */
export default function ThemeLoader() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPEARANCE_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      if (settings?.accentColor && settings.accentColor !== "#00d4aa") {
        document.documentElement.style.setProperty("--accent-primary", settings.accentColor);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  return null;
}
