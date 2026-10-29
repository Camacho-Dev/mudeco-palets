import { Sidebar, SidebarMobilePanel } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileNav>
        <SidebarMobilePanel />
      </MobileNav>
      <main className="flex-1 overflow-y-auto flex flex-col">
        <DashboardTopbar />
        <div className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-8 lg:px-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
