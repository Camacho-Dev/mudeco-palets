"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/logo";
import { HeaderAuth } from "@/components/store/header-auth";
import { CartLink } from "@/components/store/cart-link";
import {
  Menu,
  X,
  Home,
  LayoutGrid,
  Wrench,
  Phone,
  ShoppingBag,
  ChevronDown,
  Users,
  Search,
} from "lucide-react";

const primaryNav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid, hasCats: true },
  { href: "/reparaciones", label: "Reparaciones", icon: Wrench },
  { href: "/nosotros", label: "Nosotros", icon: Users },
  { href: "/contacto", label: "Contacto", icon: Phone },
];

export function StoreHeaderClient({
  user,
  categories = [],
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  categories?: string[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setOpen(false);
    setCatsOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function active(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const drawer = mounted
    ? createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[100]">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0f0f0f] text-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5">
                  <div>
                    <p className="text-[0.65rem] font-medium tracking-[0.22em] text-[#c9a15a] uppercase">
                      Menú
                    </p>
                    <p className="mt-1 font-display text-xl text-white">
                      Mudeco Palets
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-10 items-center justify-center border border-white/15 transition hover:border-[#c9a15a]/50 hover:bg-white/5"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                  {primaryNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (!item.hasCats) setOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3.5 transition-colors rounded-sm ${
                            active(item.href)
                              ? "bg-white/[0.08] text-[#c9a15a] font-semibold border-l-2 border-[#c9a15a]"
                              : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-[#c9a15a]"
                            strokeWidth={1.75}
                          />
                          <span className="flex-1 text-[0.8rem] font-medium tracking-[0.14em] uppercase">
                            {item.label}
                          </span>
                        </Link>
                        {item.hasCats && categories.length > 0 ? (
                          <div className="mb-2 ml-4 border-l border-white/10 pl-3">
                            <p className="px-2 py-2 text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                              Categorías
                            </p>
                            {categories.map((cat) => (
                              <Link
                                key={cat}
                                href={`/catalogo?cat=${encodeURIComponent(cat)}`}
                                onClick={() => setOpen(false)}
                                className="block px-2 py-2 text-sm text-white/65 transition hover:text-white"
                              >
                                {cat}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  <Link
                    href="/carrito"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-white/75 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <ShoppingBag
                      className="h-4 w-4 text-[#c9a15a]"
                      strokeWidth={1.75}
                    />
                    <span className="text-[0.8rem] font-medium tracking-[0.14em] uppercase">
                      Carrito
                    </span>
                  </Link>
                </nav>

                <div className="border-t border-white/[0.08] p-5">
                  <HeaderAuth initialUser={user} />
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;


  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 border-b border-white/[0.08] text-white transition-[background,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-[#0f0f0f]/88 backdrop-blur-[20px]"
            : "bg-[#0f0f0f]/72 backdrop-blur-[20px]"
        }`}
      >
        <div className="relative mx-auto flex h-[90px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative z-10 shrink-0 transition duration-300 hover:opacity-90"
          >
            <BrandLogo
              width={120}
              height={100}
              className="h-12 w-auto sm:h-14"
              priority
            />
          </Link>

          <nav className="absolute inset-x-0 top-0 hidden h-[90px] items-center justify-center gap-1 md:flex lg:gap-2">
            {primaryNav.map((item) =>
              item.hasCats ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setCatsOpen(true)}
                  onMouseLeave={() => setCatsOpen(false)}
                >
                  <button
                    type="button"
                    className="store-nav-link inline-flex items-center gap-1 px-3 py-2"
                    aria-expanded={catsOpen}
                    aria-current={active(item.href) ? "page" : undefined}
                    onClick={() => setCatsOpen((v) => !v)}
                  >
                    Catálogo
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>
                  {catsOpen ? (
                    <div className="absolute top-full left-1/2 z-50 min-w-[240px] -translate-x-1/2 border border-white/[0.08] bg-[#0f0f0f]/95 py-2 shadow-2xl backdrop-blur-xl">
                      <Link
                        href="/catalogo"
                        className="block px-4 py-2.5 text-sm text-[#c9a15a] transition hover:bg-white/[0.04]"
                      >
                        Ver todo el catálogo
                      </Link>
                      <div className="my-1 border-t border-white/[0.08]" />
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/catalogo?cat=${encodeURIComponent(cat)}`}
                          className="block px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="store-nav-link px-3 py-2"
                  aria-current={active(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="relative z-10 ml-auto flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/catalogo"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/80 transition duration-300 hover:border-[#c9a15a]/50 hover:text-white"
              aria-label="Buscar en el catálogo"
              title="Buscar en el catálogo"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <CartLink />
            <div className="hidden sm:block">
              <HeaderAuth initialUser={user} />
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white/80 transition duration-300 hover:border-[#c9a15a]/50 hover:text-white md:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
        {/* Barra de progreso de lectura premium */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[#c9a15a]/30 via-[#c9a15a] to-[#f3d289] shadow-[0_0_10px_rgba(201,161,90,0.7)]"
        />
      </header>
      {/* Spacer for fixed header */}
      <div className="h-[90px]" aria-hidden />
      {drawer}
    </>
  );
}
