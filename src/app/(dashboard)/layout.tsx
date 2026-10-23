import { Sidebar, SidebarMobilePanel } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileNav>
        <SidebarMobilePanel />
      </MobileNav>
      <main className="flex-1 overflow-y-auto flex flex-col">
        <DashboardTopbar />
        <div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
