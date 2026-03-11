import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#DCDCDF" }}>
      <Sidebar />
      <Topbar />
      <main style={{ marginLeft: 224, paddingTop: 56 }}>
        <div style={{ minHeight: "calc(100vh - 56px)", padding: 24 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
