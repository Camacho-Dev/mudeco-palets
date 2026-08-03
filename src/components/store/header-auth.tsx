"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";

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
  const [open, setOpen] = useState(false);
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
      setError("Datos incorrectos");
      return;
    }
    const session = await getSession();
    const nextUser = session?.user
      ? {
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }
      : null;
    setUser(nextUser);
    setOpen(false);
    setLoading(false);
    router.push(homeForRole(nextUser?.role));
    router.refresh();
  }

  if (user) {
    const dest = homeForRole(user.role);
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden max-w-[140px] truncate text-[#faf6f1]/80 sm:inline">
          {user.name || user.email}
        </span>
        <Link
          href={dest}
          className="rounded-md bg-[#b0894f] px-3 py-1.5 text-xs font-semibold text-[#3d2a1f] transition hover:bg-[#c49a5c]"
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
          className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#faf6f1] transition hover:bg-white/10"
      >
        <LogIn className="h-3.5 w-3.5" strokeWidth={2.25} />
        Entrar
      </button>

      {open ? (
        <form
          onSubmit={onSubmit}
          className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-[var(--border)] bg-white p-3 shadow-xl"
        >
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            <UserRound className="h-3.5 w-3.5" />
            Acceso interno
          </p>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            autoComplete="username"
            className="input mb-2"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            autoComplete="current-password"
            className="input mb-2"
          />
          {error ? (
            <p className="mb-2 text-xs text-rose-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2 text-xs disabled:opacity-60"
          >
            {loading ? "…" : "Iniciar sesión"}
          </button>
          <Link
            href="/login"
            className="mt-2 block text-center text-[11px] text-[var(--muted)] underline"
          >
            Página completa
          </Link>
        </form>
      ) : null}
    </div>
  );
}
