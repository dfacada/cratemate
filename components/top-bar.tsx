"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, User } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/new-dig": "New Dig",
  "/crate": "Crates",
  "/artists": "Artists",
  "/radar": "Radar",
  "/settings": "Settings",
  "/set-builder": "Set Builder",
  "/labels": "Labels",
  "/history": "History",
};

export default function TopBar() {
  const pathname = usePathname();

  // Extract the main route from pathname
  const mainRoute = pathname.split("/").slice(0, 3).join("/") || "/";
  const pageTitle = routeTitles[mainRoute] || "CrateMate";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "var(--bg-primary)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border-color)",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "24px",
        paddingRight: "24px",
        gap: "20px",
      }}
    >
      {/* Left side: Page title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
        }}
        className="hidden md:flex"
      >
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right side: Search + Icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginLeft: "auto",
        }}
      >
        {/* Search bar */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "280px",
          }}
          className="hidden sm:flex"
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              color: "var(--text-secondary)",
              pointerEvents: "none",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search tracks, artists..."
            style={{
              width: "100%",
              paddingLeft: "36px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-teal)";
              e.currentTarget.style.backgroundColor = "var(--bg-primary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
          />
        </div>

        {/* Notification bell */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--accent-teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border-color)";
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* Profile avatar */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid var(--accent-teal)",
            background: "linear-gradient(135deg, var(--accent-teal), var(--accent-teal-dark, #00a9a3))",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 191, 179, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
          aria-label="Profile"
        >
          D
        </button>
      </div>
    </div>
  );
}
