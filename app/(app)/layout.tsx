import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import PlayerBar from "@/components/player-bar";
import { PlayerProvider } from "@/context/player-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      {/* Fixed sidebar: 224px wide */}
      <Sidebar />
      {/* Fixed topbar: starts at left:224px */}
      <Topbar />
      {/* Main content: offset by sidebar + topbar + player */}
      <main style={{ marginLeft:224, paddingTop:56, paddingBottom:72, minHeight:"100vh", backgroundColor:"#F0F4F8" }}>
        <div style={{ padding:24 }}>
          {children}
        </div>
      </main>
      {/* Persistent bottom player */}
      <PlayerBar />
    </PlayerProvider>
  );
}
