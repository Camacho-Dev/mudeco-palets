import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
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
import { DashboardLogoutButton } from "@/components/dashboard-logout-button";
import { SidebarNavLink } from "@/components/sidebar-nav-link";
import {
  getCachedAuthSession,
  getCachedPendingWebOrders,
} from "@/lib/dashboard-cache";

const openNav = [
  { href: "/vender", label: "Generar factura", icon: Zap },
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
  { href: "/contenido-web", label: "Fotos y precios web", icon: Image },
  { href: "/configuracion", label: "Empresa", icon: Settings },
  { href: "/auditoria", label: "Historial", icon: ScrollText },
];

function NavLinks({
  admin,
  webPending = 0,
  group,
}: {
  admin: boolean;
  webPending?: number;
  group: string;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 p-3">
      <div className="px-1">
        <GlobalSearch />
      </div>
      <div>
        <p className="mb-1.5 px-3 text-[0.62rem] font-bold tracking-[0.16em] text-slate-500 uppercase">
          Operación
        </p>
        <div className="flex flex-col gap-0.5">
          {openNav.map((item) => (
            <SidebarNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon strokeWidth={2} />}
              group={group}
              badge={item.href === "/pedidos-web" ? webPending : undefined}
            />
          ))}
        </div>
      </div>

      {admin ? (
        <div>
          <p className="mb-1.5 px-3 text-[0.62rem] font-bold tracking-[0.16em] text-slate-500 uppercase">
            Administración
          </p>
          <div className="flex flex-col gap-0.5">
            {adminNav.map((item) => (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon strokeWidth={2} />}
                group={group}
              />
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function StoreLink() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noreferrer"
      className="mx-3 mb-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-100"
      title="Abrir tienda pública en nueva pestaña"
    >
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Ver tienda online
      </span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export async function Sidebar() {
  const [session, { count: webPending }] = await Promise.all([
    getCachedAuthSession(),
    getCachedPendingWebOrders(),
  ]);
  const admin = isAdmin(session?.user?.role);

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-[#0a0f1d] border-r border-slate-800/80 text-slate-100 md:flex transition-colors">
      <div className="border-b border-white/[0.08] px-5 py-5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <BrandLogo
          width={200}
          height={168}
          className="mx-auto h-auto w-full max-w-[150px]"
        />
      </div>

      <NavLinks admin={admin} webPending={webPending} group="desktop" />

      <StoreLink />

      <div className="border-t border-white/[0.08] p-4">
        <p className="truncate text-sm font-semibold text-white">{session?.user?.name}</p>
        <p className="truncate text-xs text-slate-400">{session?.user?.email}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[0.65rem] font-semibold tracking-wider text-amber-300/80 uppercase">
            {admin ? "Administrador" : "Empleado"}
          </span>
        </div>
        <DashboardLogoutButton />
        <DeveloperCredit />
      </div>
    </aside>
  );
}

function DeveloperCredit() {
  return (
    <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-3">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e4c284] via-[#c9a15a] to-[#8a6a34] font-serif text-[0.58rem] font-bold text-[#2c1d14]"
      >
        BC
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-white/35">
          Desarrollado por
        </span>
        <span className="truncate text-[0.72rem] font-semibold text-white/75">
          Brayan Camacho
        </span>
      </span>
    </div>
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
      <NavLinks admin={admin} webPending={webPending} group="mobile" />
      <StoreLink />
      <div className="border-t border-white/10 p-4 text-sm">
        <p className="truncate font-medium">{session?.user?.name}</p>
        <p className="truncate text-xs text-white/50">{session?.user?.email}</p>
        <p className="mt-1 text-[0.65rem] tracking-wide text-white/35 uppercase">
          {admin ? "Administrador" : "Empleado"}
        </p>
        <DashboardLogoutButton />
        <DeveloperCredit />
      </div>
    </div>
  );
}
