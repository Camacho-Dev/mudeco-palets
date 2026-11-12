"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  ShoppingBag,
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
  const pathname = usePathname();
  const { data: clientSession } = useSession();
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(initialUser);
    if (!initialUser && clientSession?.user) {
      signOut({ redirect: false });
    }
  }, [initialUser, clientSession]);

  useEffect(() => {
    if (clientSession === null) {
      setUser(null);
    }
  }, [clientSession]);

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
        className="group relative inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border border-[#d4af37]/60 bg-[#16120e]/90 px-4 sm:px-5 text-[11px] font-bold tracking-wider text-[#f5dfa8] uppercase shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-[#fbe3a8] hover:bg-[#d4af37] hover:text-[#0f0d0a] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer"
        title="Iniciar sesión o registrarse"
      >
        <User className="h-3.5 w-3.5 text-[#d4af37] transition-transform group-hover:scale-110 group-hover:text-[#0f0d0a]" />
        <span>Entrar</span>
      </Link>
    );
  }

  const effectiveRole =
    user?.role ||
    (clientSession?.user as { role?: string } | undefined)?.role ||
    null;
  const isAdminUser = effectiveRole === "ADMIN";
  const isSellerUser = effectiveRole === "VENDEDOR";

  const displayName = getDisplayCustomerName(user);
  const initials = getInitials(displayName, user.email);

  if (variant === "drawer") {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#16120e]/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37] bg-[#1a1410] text-xs font-bold text-[#f5dfa8] shadow-[0_0_12px_rgba(212,175,55,0.3)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              {isAdminUser && (
                <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#f5dfa8] uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="truncate text-xs text-white/50">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          {isAdminUser && (
            <Link
              href="/panel"
              className="flex items-center justify-between rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3.5 py-2.5 text-xs font-semibold tracking-wider text-[#f5dfa8] uppercase transition hover:bg-[#d4af37] hover:text-[#0a0a0a]"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel de Administración</span>
              </span>
              <span className="text-[10px] font-bold">Entrar →</span>
            </Link>
          )}

          {isSellerUser && !isAdminUser && (
            <Link
              href="/vender"
              className="flex items-center justify-between rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3.5 py-2.5 text-xs font-semibold tracking-wider text-[#f5dfa8] uppercase transition hover:bg-[#d4af37] hover:text-[#0a0a0a]"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Punto de Venta (POS)</span>
              </span>
              <span className="text-[10px] font-bold">Entrar →</span>
            </Link>
          )}

          <Link
            href="/mis-pedidos"
            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e2c168] px-3.5 py-2.5 text-xs font-bold tracking-wider text-[#0f0d0a] uppercase transition hover:opacity-95"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Mi Perfil y Pedidos</span>
            </span>
            <span className="text-[10px] font-bold">Ver →</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await signOut({ callbackUrl: "/" });
            }}
            className="flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-white/55 transition hover:bg-white/5 hover:text-white cursor-pointer"
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
        className={`group inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border px-3 sm:px-3.5 text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
          open
            ? "border-[#d4af37] bg-[#1a1410] text-white shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            : "border-white/15 bg-[#14100e]/80 text-white/90 hover:border-[#d4af37]/60 hover:text-white hover:bg-[#1a1410]"
        }`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37] bg-[#1a1410] text-[10px] font-bold text-[#f5dfa8] shadow-[0_0_8px_rgba(212,175,55,0.4)]">
          {initials}
        </span>
        <span className="max-w-[110px] truncate text-[11px] font-bold uppercase tracking-wider text-[#f5dfa8]">
          Mi Cuenta
        </span>
        <ChevronDown
          className={`h-3 w-3 text-white/60 transition-transform duration-200 ${
            open ? "rotate-180 text-[#d4af37]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-[#14100e]/95 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-white/10"
          >
            {/* Cabecera limpia de la cuenta */}
            <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#1a1410] font-display text-sm font-bold text-[#f5dfa8] shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-white">
                      {displayName}
                    </p>
                    {isAdminUser && (
                      <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-1.5 py-0.2 text-[8px] font-bold tracking-wider text-[#f5dfa8] uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-white/50">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="p-2 space-y-1 text-xs">
              {isAdminUser && (
                <Link
                  href="/panel"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#d4af37]" />
                  <span>Panel de Administración</span>
                </Link>
              )}

              {isSellerUser && !isAdminUser && (
                <Link
                  href="/vender"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#d4af37]" />
                  <span>Punto de Venta (POS)</span>
                </Link>
              )}

              <Link
                href="/mis-pedidos"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-white/80 transition hover:bg-[#d4af37]/15 hover:text-[#f5dfa8]"
              >
                <ShoppingBag className="h-4 w-4 text-[#d4af37]" />
                <span>Mi Perfil e Historial</span>
              </Link>

              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
