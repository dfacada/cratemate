import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import PlayerBar from "@/components/player-bar";
import { PlayerProvider } from "@/context/player-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Sidebar />
      <Topbar />

      {/* Main content area — offsets handled via globals.css */}
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>

      <PlayerBar />
    </PlayerProvider>
  );
}
