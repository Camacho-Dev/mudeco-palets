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
  ChevronRight,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";

export type CustomerProfileSummary = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  phone?: string | null;
  address?: string | null;
  ordersCount?: number;
};

function getDisplayCustomerName(user: CustomerProfileSummary): string {
  const raw = (user.name || "").trim();
  if (raw && raw.toLowerCase() !== "administrador") {
    return raw;
  }
  if (user.email) {
    const local = user.email.split("@")[0] || "Mi Cuenta";
    if (local.toLowerCase() === "admin") return "Mi Cuenta";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Mi Cuenta";
}

function getInitials(name: string, email?: string | null): string {
  if (name && name !== "Mi Cuenta") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "MC";
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
        className="inline-flex h-10 items-center gap-2 bg-[#c9a15a] px-4 text-[0.68rem] font-semibold tracking-[0.14em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
        title="Iniciar sesión o crear cuenta"
      >
        <User className="h-3.5 w-3.5" />
        <span>Entrar</span>
      </Link>
    );
  }

  const displayName = getDisplayCustomerName(user);
  const initials = getInitials(displayName, user.email);
  const ordersCount = user.ordersCount ?? 0;
  const isStaff = user.role === "ADMIN" || user.role === "VENDEDOR";
  const staffHref = user.role === "ADMIN" ? "/panel" : "/vender";

  if (variant === "drawer") {
    return (
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/15 text-xs font-semibold text-[#c9a15a]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/50">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <Link
            href="/mis-pedidos"
            className="flex items-center justify-between rounded-lg bg-[#c9a15a] px-3.5 py-2.5 text-xs font-semibold tracking-wider text-[#0f0f0f] uppercase transition hover:bg-[#d4b06e]"
          >
            <span className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              <span>Mi Perfil y Compras</span>
            </span>
            {ordersCount > 0 && (
              <span className="rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-bold">
                {ordersCount}
              </span>
            )}
          </Link>
          {isStaff && (
            <Link
              href={staffHref}
              className="flex items-center justify-between rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-white/80 transition hover:border-[#c9a15a]/50 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5 text-[#c9a15a]" />
                <span>Panel Administrativo</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut({ redirect: false });
              setUser(null);
              router.refresh();
            }}
            className="flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium text-white/55 transition hover:bg-white/5 hover:text-white cursor-pointer"
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
        title="Mi cuenta y pedidos"
        className={`inline-flex h-10 items-center gap-2.5 border px-3 text-[0.7rem] font-medium tracking-[0.1em] uppercase transition duration-200 cursor-pointer ${
          open
            ? "border-[#c9a15a] bg-[#1a1612] text-white"
            : "border-white/12 bg-transparent text-white/85 hover:border-[#c9a15a]/50 hover:text-white"
        }`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a15a]/20 text-[0.62rem] font-semibold tracking-normal text-[#c9a15a]">
          {initials}
        </span>
        <span className="max-w-[110px] truncate">Mi Cuenta</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180 text-[#c9a15a]" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/12 bg-[#141210] text-white shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-xl"
        >
          {/* Cabecera limpia de la cuenta */}
          <div className="border-b border-white/[0.08] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/15 text-xs font-semibold text-[#c9a15a]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-white/50">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Enlaces principales de navegación */}
          <div className="p-1.5">
            <Link
              href="/mis-pedidos#perfil"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <UserCircle2 className="h-4 w-4 text-[#c9a15a]" />
                <span>Mi Perfil y Datos</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
            </Link>

            <Link
              href="/mis-pedidos#historial"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-[#c9a15a]" />
                <span>Historial de Compras</span>
              </span>
              <span className="flex items-center gap-1.5">
                {ordersCount > 0 && (
                  <span className="rounded-full bg-[#c9a15a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#c9a15a]">
                    {ordersCount}
                  </span>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
              </span>
            </Link>

            {isStaff && (
              <Link
                href={staffHref}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs text-white/80 transition hover:bg-white/[0.06] hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-[#c9a15a]" />
                  <span>Panel Administrativo</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
              </Link>
            )}
          </div>

          {/* Pie de cierre de sesión */}
          <div className="border-t border-white/[0.08] p-1.5">
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut({ redirect: false });
                setUser(null);
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/55 transition hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
