import Link from "next/link";
import { BrandLogo } from "@/components/logo";
import { HeaderAuth } from "@/components/store/header-auth";
import { auth } from "@/lib/auth";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export async function StoreHeader() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#3d2a1f]/95 text-[#faf6f1] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLogo width={72} height={90} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-white/75 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <nav className="flex gap-3 md:hidden">
            {nav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-white/75"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <HeaderAuth initialUser={user} />
        </div>
      </div>
    </header>
  );
}
