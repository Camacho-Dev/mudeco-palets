"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

function homeForRole(role?: string | null) {
  return role === "ADMIN" ? "/panel" : "/vender";
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

  if (user) {
    const dest = homeForRole(user.role);
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[140px] truncate text-[0.7rem] text-white/55 lg:inline">
          {user.name || user.email}
        </span>
        <Link
          href={dest}
          className="bg-[#c9a15a] px-4 py-2.5 text-[0.65rem] font-semibold tracking-[0.14em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
        >
          {user.role === "ADMIN" ? "Panel" : "Vender"}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            setUser(null);
            router.refresh();
          }}
          className="border border-white/15 p-2 text-white/65 transition duration-300 hover:border-white/30 hover:text-white"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-[#c9a15a] px-4 py-2.5 text-[0.65rem] font-semibold tracking-[0.14em] text-[#0f0f0f] uppercase transition duration-300 hover:bg-[#d4b06e]"
    >
      Entrar
    </Link>
  );
}
