import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import PlayerBar from "@/components/player-bar";
import { PlayerProvider } from "@/context/player-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Sidebar />
      <Topbar />

      {/* Main content area — offsets handled via CSS classes */}
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>

      <PlayerBar />

      <style>{`
        /* Desktop: sidebar + topbar offsets */
        .app-main {
          margin-left: 224px;
          padding-top: 52px;
          padding-bottom: 80px;
          min-height: 100vh;
          background-color: #f0f4f8;
        }
        .app-content {
          padding: 24px 28px;
          max-width: 1400px;
        }

        /* Mobile: no sidebar margin, top bar + bottom nav offsets */
        @media (max-width: 768px) {
          .app-main {
            margin-left: 0;
            padding-top: 52px;
            /* bottom: player bar (68px) + mobile nav (56px) */
            padding-bottom: 136px;
          }
          .app-content {
            padding: 16px;
          }
        }
      `}</style>
    </PlayerProvider>
  );
}
