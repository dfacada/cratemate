import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import PlayerBar from "@/components/player-bar";
import { PlayerProvider } from "@/context/player-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Sidebar />

      {/* Main content area — offsets handled via globals.css */}
      <main className="app-main" style={{ backgroundColor: "var(--bg-primary)" }}>
        <TopBar />
        <div className="app-content">
          {children}
        </div>
      </main>

      <PlayerBar />
    </PlayerProvider>
  );
}
