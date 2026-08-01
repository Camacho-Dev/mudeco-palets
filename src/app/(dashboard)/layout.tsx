import { Sidebar, SidebarMobilePanel } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

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
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 pt-16 md:px-10 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
