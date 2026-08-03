"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(initialUser);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    if (result?.error) {
      setLoading(false);
      setError("Incorrecto");
      return;
    }
    const session = await getSession();
    const role = session?.user?.role;
    const nextUser = session?.user
      ? {
          name: session.user.name,
          email: session.user.email,
          role,
        }
      : null;
    setUser(nextUser);
    setLoading(false);
    // Admin siempre al panel de una vez
    router.push(homeForRole(role));
    router.refresh();
  }

  if (user) {
    const dest = homeForRole(user.role);
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[120px] truncate text-[0.7rem] text-white/70 lg:inline">
          {user.name || user.email}
        </span>
        <Link
          href={dest}
          className="rounded-sm bg-[#b0894f] px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.08em] text-[#3d2a1f] uppercase transition hover:bg-[#c49a5c]"
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
          className="rounded-sm border border-white/20 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="store-login-bar flex items-center gap-1.5"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="username"
        className="hidden sm:block"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Clave"
        autoComplete="current-password"
        className="hidden sm:block"
        style={{ width: "6.5rem" }}
      />
      {/* Mobile: opens full login */}
      <Link
        href="/login"
        className="rounded-sm border border-white/25 px-2.5 py-1.5 text-[0.65rem] tracking-wide text-white/80 uppercase sm:hidden"
      >
        Entrar
      </Link>
      <button type="submit" disabled={loading} className="hidden sm:inline-flex">
        {loading ? "…" : "Entrar"}
      </button>
      {error ? (
        <span className="hidden text-[0.65rem] text-rose-300 sm:inline">
          {error}
        </span>
      ) : null}
    </form>
  );
}
