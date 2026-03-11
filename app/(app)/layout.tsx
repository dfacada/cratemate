import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0E0E10]">
      <Sidebar />
      <Topbar />
      <main className="ml-56 pt-14">
        <div className="min-h-[calc(100vh-3.5rem)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
