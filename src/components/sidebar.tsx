import Link from "next/link";
import { cookies } from "next/headers";
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
  Lock,
  Unlock,
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
} from "lucide-react";
import { BrandLogo } from "@/components/logo";
import { lockSensitiveArea } from "@/app/(dashboard)/desbloquear/actions";
import {
  SENSITIVE_COOKIE,
  verifySensitiveToken,
} from "@/lib/sensitive";
import { isAdmin } from "@/lib/rbac";
import { GlobalSearch } from "@/components/global-search";

const openNav = [
  { href: "/vender", label: "Generar factura", icon: Zap, accent: true },
  { href: "/facturas", label: "Facturas", icon: FileText },
  { href: "/cotizaciones", label: "Cotizaciones", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Catálogo", icon: Package },
];

const privateNav = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/finanzas", label: "Finanzas", icon: Calculator },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
  { href: "/materiales", label: "Materiales", icon: Boxes, adminOnly: true },
  { href: "/pagos", label: "Cobros", icon: CreditCard },
  { href: "/proveedores", label: "Proveedores", icon: Truck, adminOnly: true },
  { href: "/compras", label: "Compras", icon: ShoppingCart, adminOnly: true },
  { href: "/notas-credito", label: "Notas crédito", icon: FileMinus, adminOnly: true },
  { href: "/fabricacion", label: "Fabricación", icon: Factory, adminOnly: true },
  { href: "/usuarios", label: "Usuarios", icon: UserCog, adminOnly: true },
  { href: "/exportar", label: "Exportar", icon: Download, adminOnly: true },
  { href: "/backup", label: "Respaldo", icon: DatabaseBackup, adminOnly: true },
  { href: "/configuracion", label: "Empresa", icon: Settings },
  { href: "/auditoria", label: "Historial", icon: ScrollText },
];

function NavLinks({
  unlocked,
  admin,
}: {
  unlocked: boolean;
  admin: boolean;
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
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between px-3">
          <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-white/40 uppercase">
            Privado
          </p>
          {unlocked ? (
            <span className="inline-flex items-center gap-1.5 text-[0.65rem] text-emerald-300/90">
              <Unlock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              Abierto
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[0.65rem] text-[#b0894f]">
              <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              Bloqueado
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {privateNav
            .filter((item) => !item.adminOnly || admin)
            .map((item) => (
              <Link
                key={item.href}
                href={
                  unlocked
                    ? item.href
                    : `/desbloquear?next=${encodeURIComponent(item.href)}`
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#faf6f1]/75 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                {!unlocked ? (
                  <Lock
                    className="h-3.5 w-3.5 shrink-0 text-[#b0894f]"
                    strokeWidth={2.25}
                  />
                ) : null}
              </Link>
            ))}
        </div>
        {unlocked ? (
          <form action={lockSensitiveArea} className="mt-2 px-1">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Lock className="h-3.5 w-3.5" />
              Bloquear área privada
            </button>
          </form>
        ) : null}
      </div>
    </nav>
  );
}

export async function Sidebar() {
  const session = await auth();
  const jar = await cookies();
  const unlocked = await verifySensitiveToken(
    jar.get(SENSITIVE_COOKIE)?.value,
  );
  const admin = isAdmin(session?.user?.role);

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-[#3d2a1f] text-[#faf6f1] md:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <BrandLogo width={200} height={250} className="mx-auto w-full max-w-[210px]" />
      </div>

      <NavLinks unlocked={unlocked} admin={admin} />

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium">{session?.user?.name}</p>
        <p className="truncate text-xs text-white/45">{session?.user?.email}</p>
        <p className="mt-1 text-[0.65rem] tracking-wide text-white/35 uppercase">
          {admin ? "Administrador" : "Empleado"}
        </p>
        <form
          action={async () => {
            "use server";
            const { cookies } = await import("next/headers");
            const { SENSITIVE_COOKIE } = await import("@/lib/sensitive");
            (await cookies()).delete(SENSITIVE_COOKIE);
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
  const jar = await cookies();
  const unlocked = await verifySensitiveToken(
    jar.get(SENSITIVE_COOKIE)?.value,
  );
  const admin = isAdmin(session?.user?.role);

  return (
    <div className="flex h-full flex-col text-[#faf6f1]">
      <div className="border-b border-white/10 px-4 py-5 pt-12">
        <p className="text-sm font-bold tracking-wide uppercase">Mudeco Palets</p>
      </div>
      <NavLinks unlocked={unlocked} admin={admin} />
      <div className="border-t border-white/10 p-4 text-sm">
        <p>{session?.user?.name}</p>
        <p className="text-xs text-white/50">{session?.user?.email}</p>
      </div>
    </div>
  );
}
