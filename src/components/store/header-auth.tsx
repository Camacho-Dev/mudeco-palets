"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, User } from "lucide-react";

function homeForRole(role?: string | null) {
  if (role === "ADMIN") return "/panel";
  if (role === "VENDEDOR") return "/vender";
  return "/mis-pedidos";
}

export function HeaderAuth({
  initialUser,
}: {
  initialUser: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  if (user) {
    const isStaff = user.role === "ADMIN" || user.role === "VENDEDOR";
    const dest = homeForRole(user.role);
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[140px] truncate text-[0.7rem] font-medium text-white/70 lg:inline">
          {user.name || user.email}
        </span>
        <Link
          href="/mis-pedidos"
          className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.12em] text-white/85 uppercase transition duration-300 hover:border-[#c9a15a] hover:text-[#c9a15a]"
          title="Ver mis pedidos y cotizaciones"
        >
          <Package className="h-3.5 w-3.5 text-[#c9a15a]" />
          <span className="hidden sm:inline">Mis pedidos</span>
        </Link>
        {isStaff && (
          <Link
            href={dest}
            className="bg-[#c9a15a] px-3.5 py-2 text-[0.65rem] font-semibold tracking-[0.14em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
          >
            {user.role === "ADMIN" ? "Panel" : "Vender"}
          </Link>
        )}
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            setUser(null);
            router.refresh();
          }}
          className="border border-white/15 p-2 text-white/65 transition duration-300 hover:border-white/30 hover:text-white"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 bg-[#c9a15a] px-3.5 py-2 text-[0.68rem] font-semibold tracking-[0.12em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
      title="Iniciar sesión en la tienda o panel"
    >
      <User className="h-3.5 w-3.5" />
      <span>Entrar</span>
    </Link>
  );
}
