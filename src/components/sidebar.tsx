import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
  LogOut,
  Zap,
  Settings,
  Warehouse,
  Calculator,
  ScrollText,
  UserCog,
  UserCheck,
  Truck,
  ShoppingCart,
  FileMinus,
  Factory,
  Boxes,
  Download,
  DatabaseBackup,
  ClipboardList,
  Globe,
  Image,
  ExternalLink,
  Activity,
} from "lucide-react";
import { BrandLogo } from "@/components/logo";
import { isAdmin } from "@/lib/rbac";
import { GlobalSearch } from "@/components/global-search";
import { prisma } from "@/lib/prisma";
import {
  getCachedAuthSession,
  getCachedPendingWebOrders,
} from "@/lib/dashboard-cache";

const openNav = [
  { href: "/vender", label: "Generar factura", icon: Zap, accent: true },
  { href: "/facturas", label: "Facturas", icon: FileText },
  { href: "/cotizaciones", label: "Cotizaciones", icon: ClipboardList },
  { href: "/pedidos-web", label: "Pedidos web", icon: Globe },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Catálogo", icon: Package },
];

const adminNav = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/conexion-web", label: "Conexión web", icon: Activity },
  { href: "/finanzas", label: "Finanzas", icon: Calculator },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
  { href: "/materiales", label: "Materiales", icon: Boxes },
  { href: "/pagos", label: "Cobros", icon: CreditCard },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/notas-credito", label: "Notas crédito", icon: FileMinus },
  { href: "/fabricacion", label: "Fabricación", icon: Factory },
  { href: "/empleados", label: "Empleados", icon: UserCheck },
  { href: "/usuarios", label: "Usuarios y roles", icon: UserCog },
  { href: "/exportar", label: "Exportar", icon: Download },
  { href: "/backup", label: "Respaldo", icon: DatabaseBackup },
  { href: "/contenido-web", label: "Fotos de la web", icon: Image },
  { href: "/configuracion", label: "Empresa", icon: Settings },
  { href: "/auditoria", label: "Historial", icon: ScrollText },
];

function NavLinks({
  admin,
  webPending = 0,
}: {
  admin: boolean;
  webPending?: number;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-4 p-3">
      <div className="px-1">
        <GlobalSearch />
      </div>
      <div>
        <p className="mb-2 px-3 text-[0.65rem] font-bold tracking-[0.16em] text-white/40 uppercase">
          Operación
        </p>
        <div className="flex flex-col gap-1">
          {openNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                item.accent
                  ? "bg-gradient-to-r from-[#b0894f] via-[#c49a5c] to-[#b0894f] font-semibold text-[#2c1d14] shadow-[0_2px_12px_rgba(176,137,79,0.35)] hover:shadow-[0_4px_18px_rgba(176,137,79,0.5)] hover:scale-[1.02]"
                  : "text-[#faf6f1]/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/pedidos-web" && webPending > 0 ? (
                <span className="relative flex items-center">
                  <span className="absolute -inset-0.5 rounded-full bg-[#b0894f] opacity-60 animate-ping" />
                  <span className="relative rounded-full bg-[#b0894f] px-2 py-0.5 text-[0.62rem] font-bold text-[#3d2a1f] shadow-sm">
                    {webPending > 99 ? "99+" : webPending}
                  </span>
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>

      {admin ? (
        <div>
          <p className="mb-2 px-3 text-[0.65rem] font-bold tracking-[0.16em] text-white/40 uppercase">
            Administración
          </p>
          <div className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#faf6f1]/80 transition-all duration-200 hover:bg-white/10 hover:text-white hover:translate-x-1"
              >
                <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 text-[#c4a574]" strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}


export async function Sidebar() {
  const [session, { count: webPending }] = await Promise.all([
    getCachedAuthSession(),
    getCachedPendingWebOrders(),
  ]);
  const admin = isAdmin(session?.user?.role);

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-[#3d2a1f] text-[#faf6f1] md:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <BrandLogo
          width={200}
          height={168}
          className="mx-auto h-auto w-full max-w-[180px]"
        />
      </div>

      <NavLinks admin={admin} webPending={webPending} />

      <div className="mx-3 mb-2 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.68rem] font-bold tracking-wider text-white/80 uppercase">
              Tienda online
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded bg-[#b0894f] px-2 py-0.5 text-[0.65rem] font-bold text-[#2c1d14] hover:bg-[#c49a5c] transition shadow-sm"
            title="Abrir tienda pública en nueva pestaña"
          >
            <span>Ver web</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
        <p className="mt-1 text-[0.65rem] text-white/45">
          Canal público sincronizado
        </p>
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium">{session?.user?.name}</p>
        <p className="truncate text-xs text-white/45">{session?.user?.email}</p>
        <p className="mt-1 text-[0.65rem] tracking-wide text-white/35 uppercase">
          {admin ? "Administrador" : "Empleado"}
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-3"
        >
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

export async function SidebarMobilePanel() {
  const [session, { count: webPending }] = await Promise.all([
    getCachedAuthSession(),
    getCachedPendingWebOrders(),
  ]);
  const admin = isAdmin(session?.user?.role);

  return (
    <div className="flex h-full flex-col text-[#faf6f1]">
      <div className="border-b border-white/10 px-4 py-5 pt-12">
        <p className="text-sm font-bold tracking-wide uppercase">
          Mudeco Palets
        </p>
      </div>
      <NavLinks admin={admin} webPending={webPending} />
      <div className="mx-3 mb-2 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.68rem] font-bold tracking-wider text-white/80 uppercase">
              Tienda online
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded bg-[#b0894f] px-2 py-0.5 text-[0.65rem] font-bold text-[#2c1d14]"
          >
            <span>Ver web</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 p-4 text-sm">
        <p>{session?.user?.name}</p>
        <p className="text-xs text-white/50">{session?.user?.email}</p>
      </div>
    </div>
  );
}
