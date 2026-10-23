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
} from "lucide-react";
import { BrandLogo } from "@/components/logo";
import { isAdmin } from "@/lib/rbac";
import { GlobalSearch } from "@/components/global-search";
import { prisma } from "@/lib/prisma";

const openNav = [
  { href: "/vender", label: "Generar factura", icon: Zap, accent: true },
  { href: "/facturas", label: "Facturas", icon: FileText },
  { href: "/cotizaciones", label: "Cotizaciones", icon: ClipboardList },
  { href: "/pedidos-web", label: "Pedidos web", icon: Globe },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Catálogo", icon: Package },
  { href: "/validador", label: "Validador tarjetas", icon: CreditCard },
];

const adminNav = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/finanzas", label: "Finanzas", icon: Calculator },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
  { href: "/materiales", label: "Materiales", icon: Boxes },
  { href: "/pagos", label: "Cobros", icon: CreditCard },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/notas-credito", label: "Notas crédito", icon: FileMinus },
  { href: "/fabricacion", label: "Fabricación", icon: Factory },
  { href: "/usuarios", label: "Usuarios", icon: UserCog },
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
        <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.14em] text-white/40 uppercase">
          Operación
        </p>
        <div className="flex flex-col gap-1">
          {openNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                item.accent
                  ? "bg-[#b0894f] font-semibold text-[#3d2a1f] hover:bg-[#c49a5c]"
                  : "text-[#faf6f1]/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/pedidos-web" && webPending > 0 ? (
                <span className="rounded-full bg-[#b0894f] px-1.5 py-0.5 text-[0.65rem] font-bold text-[#3d2a1f]">
                  {webPending > 99 ? "99+" : webPending}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>

      {admin ? (
        <div>
          <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.14em] text-white/40 uppercase">
            Administración
          </p>
          <div className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#faf6f1]/75 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
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
  const session = await auth();
  const admin = isAdmin(session?.user?.role);
  const webPending = await prisma.webOrder.count({
    where: {
      status: {
        in: ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"],
      },
    },
  });

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
  const session = await auth();
  const admin = isAdmin(session?.user?.role);
  const webPending = await prisma.webOrder.count({
    where: {
      status: {
        in: ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"],
      },
    },
  });

  return (
    <div className="flex h-full flex-col text-[#faf6f1]">
      <div className="border-b border-white/10 px-4 py-5 pt-12">
        <p className="text-sm font-bold tracking-wide uppercase">
          Mudeco Palets
        </p>
      </div>
      <NavLinks admin={admin} webPending={webPending} />
      <div className="border-t border-white/10 p-4 text-sm">
        <p>{session?.user?.name}</p>
        <p className="text-xs text-white/50">{session?.user?.email}</p>
      </div>
    </div>
  );
}
