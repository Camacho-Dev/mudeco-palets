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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2f2018]/92 text-[#faf6f1] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0 transition opacity-95 hover:opacity-100">
          <BrandLogo
            width={56}
            height={70}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="store-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <nav className="flex gap-4 md:hidden">
            {nav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[0.65rem] tracking-[0.1em] text-white/70 uppercase"
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
