"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Package,
  User,
  ChevronDown,
  ShoppingBag,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  Settings,
  ShieldCheck,
  Receipt,
} from "lucide-react";

export type CustomerRecentOrder = {
  id: string;
  number: string;
  total: number;
  status: string;
  statusLabel: string;
  createdAt: string;
  itemsSummary: string;
};

export type CustomerProfileSummary = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  phone?: string | null;
  address?: string | null;
  ordersCount?: number;
  totalSpent?: number;
  recentOrders?: CustomerRecentOrder[];
};

function getDisplayCustomerName(user: CustomerProfileSummary): string {
  const raw = (user.name || "").trim();
  if (raw && raw.toLowerCase() !== "administrador") {
    return raw;
  }
  if (user.email) {
    const local = user.email.split("@")[0] || "Cliente";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Mi Cuenta";
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "MP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatMoneyDOP(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function HeaderAuth({
  initialUser,
  variant = "header",
}: {
  initialUser: CustomerProfileSummary | null;
  variant?: "header" | "drawer";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 bg-[#c9a15a] px-3.5 py-2 text-[0.68rem] font-semibold tracking-[0.12em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
        title="Iniciar sesión o crear cuenta"
      >
        <User className="h-3.5 w-3.5" />
        <span>Mi Cuenta</span>
      </Link>
    );
  }

  const displayName = getDisplayCustomerName(user);
  const initials = getInitials(displayName);
  const ordersCount = user.ordersCount ?? 0;
  const totalSpent = user.totalSpent ?? 0;
  const recentOrders = user.recentOrders ?? [];
  const isStaff = user.role === "ADMIN" || user.role === "VENDEDOR";
  const staffHref = user.role === "ADMIN" ? "/panel" : "/vender";

  if (variant === "drawer") {
    return (
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/50 bg-[#c9a15a]/15 text-xs font-bold text-[#c9a15a]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/55">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-y border-white/10 py-2.5">
          <div>
            <p className="text-[0.6rem] uppercase tracking-wider text-white/45">
              Compras
            </p>
            <p className="text-xs font-bold text-white">
              {ordersCount} {ordersCount === 1 ? "pedido" : "pedidos"}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wider text-white/45">
              Historial
            </p>
            <p className="text-xs font-bold text-[#c9a15a]">
              {formatMoneyDOP(totalSpent)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/mis-pedidos"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#c9a15a] px-3 py-2 text-xs font-bold tracking-wider text-[#0f0f0f] uppercase transition hover:bg-[#d4b06e]"
          >
            <Package className="h-3.5 w-3.5" />
            <span>Mi Perfil e Historial</span>
          </Link>
          {isStaff && (
            <Link
              href={staffHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-[0.68rem] font-semibold tracking-wider text-white/75 uppercase transition hover:border-[#c9a15a]/50 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#c9a15a]" />
              <span>Administración del Taller</span>
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut({ redirect: false });
              setUser(null);
              router.refresh();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[0.68rem] font-medium text-white/60 transition hover:text-white cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Ver mi perfil e historial de compras"
        className={`inline-flex h-10 items-center gap-2 border px-3 text-[0.68rem] font-semibold tracking-[0.11em] uppercase transition duration-200 cursor-pointer ${
          open
            ? "border-[#c9a15a] bg-[#c9a15a]/15 text-[#c9a15a]"
            : "border-white/15 bg-white/[0.03] text-white/90 hover:border-[#c9a15a]/60 hover:text-white"
        }`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#c9a15a]/50 bg-[#c9a15a]/20 text-[0.62rem] font-bold tracking-normal text-[#c9a15a]">
          {initials}
        </span>
        <span className="max-w-[115px] truncate">Mi Perfil</span>
        {ordersCount > 0 && (
          <span
            className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c9a15a] px-1 text-[0.6rem] font-bold tracking-normal text-[#0f0f0f]"
            title={`${ordersCount} compras registradas`}
          >
            {ordersCount}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/60 transition-transform duration-200 ${
            open ? "rotate-180 text-[#c9a15a]" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[360px] sm:w-[400px] overflow-hidden rounded-2xl border border-[#c9a15a]/30 bg-[#14110e] text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
        >
          {/* Cabecera: Información del Perfil del Cliente */}
          <div className="border-b border-white/10 bg-gradient-to-br from-[#1d1712] to-[#14110e] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/60 bg-[#c9a15a]/15 text-sm font-bold text-[#c9a15a]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#c9a15a]">
                    Perfil del Cliente
                  </p>
                  <p className="truncate font-display text-base font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-white/65">
                    <Mail className="h-3 w-3 shrink-0 text-[#c9a15a]/80" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>
              <Link
                href="/mis-pedidos#perfil"
                onClick={() => setOpen(false)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-wider text-[#c9a15a] transition hover:border-[#c9a15a]/50 hover:bg-[#c9a15a]/10"
              >
                <Settings className="h-3 w-3" />
                <span>Editar</span>
              </Link>
            </div>

            {(user.phone || user.address) && (
              <div className="mt-3 space-y-1 rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2 text-[11px] text-white/70">
                {user.phone && (
                  <p className="flex items-center gap-2 truncate">
                    <Phone className="h-3 w-3 shrink-0 text-[#c9a15a]" />
                    <span>{user.phone}</span>
                  </p>
                )}
                {user.address && (
                  <p className="flex items-center gap-2 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-[#c9a15a]" />
                    <span className="truncate">{user.address}</span>
                  </p>
                )}
              </div>
            )}

            {/* KPIs rápidos del cliente */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-white/45">
                  Compras realizadas
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {ordersCount} {ordersCount === 1 ? "compra" : "compras"}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-white/45">
                  Total comprado
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-[#c9a15a]">
                  {formatMoneyDOP(totalSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* Historial rápido de lo que ha comprado */}
          <div className="p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-white/60">
                <Receipt className="h-3.5 w-3.5 text-[#c9a15a]" />
                Historial de Compras
              </span>
              <Link
                href="/mis-pedidos#historial"
                onClick={() => setOpen(false)}
                className="text-[0.65rem] font-semibold text-[#c9a15a] transition hover:text-[#e2bf7d]"
              >
                Ver todo ({ordersCount})
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
                <ShoppingBag className="mx-auto h-5 w-5 text-[#c9a15a]/70" />
                <p className="mt-1.5 text-xs font-medium text-white/80">
                  Aún no tienes compras registradas
                </p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  Tus pedidos y facturas aparecerán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="max-h-[210px] space-y-2 overflow-y-auto pr-1">
                {recentOrders.map((ord) => {
                  const isPaid =
                    ord.status === "PAID" || ord.status === "DONE";
                  return (
                    <Link
                      key={ord.id}
                      href={`/pedido/${ord.id}`}
                      onClick={() => setOpen(false)}
                      className="group block rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition hover:border-[#c9a15a]/50 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white group-hover:text-[#c9a15a]">
                            {ord.number}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isPaid
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {ord.statusLabel}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#c9a15a]">
                          {formatMoneyDOP(ord.total)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-white/75">
                        {ord.itemsSummary}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/45">
                        {formatShortDate(ord.createdAt)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="border-t border-white/10 bg-[#100d0b] p-3 space-y-2">
            <Link
              href="/mis-pedidos"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a15a] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.13em] text-[#0f0f0f] transition hover:bg-[#d8b46c]"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Ver Mi Perfil e Historial Completo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              {isStaff ? (
                <Link
                  href={staffHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/70 transition hover:border-[#c9a15a]/40 hover:text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c9a15a]" />
                  <span>Ir al ERP</span>
                </Link>
              ) : (
                <Link
                  href="/mis-pedidos#perfil"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/70 transition hover:border-[#c9a15a]/40 hover:text-white"
                >
                  <User className="h-3.5 w-3.5 text-[#c9a15a]" />
                  <span>Mis Datos</span>
                </Link>
              )}

              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await signOut({ redirect: false });
                  setUser(null);
                  router.refresh();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/60 transition hover:border-rose-500/40 hover:text-rose-300 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
