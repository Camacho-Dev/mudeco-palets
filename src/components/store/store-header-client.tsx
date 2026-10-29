"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/logo";
import { HeaderAuth } from "@/components/store/header-auth";
import { CartLink } from "@/components/store/cart-link";
import { formatStoreCategory } from "@/lib/store-brand";
import {
  Menu,
  X,
  Home,
  LayoutGrid,
  Phone,
  ShoppingBag,
  ChevronDown,
  Users,
  Search,
  ArrowRight,
  Package,
} from "lucide-react";

const formatCategory = formatStoreCategory;

const primaryNav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid, hasCats: true },
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openCatsMenu = () => {
    if (catsTimerRef.current) clearTimeout(catsTimerRef.current);
    catsTimerRef.current = setTimeout(() => setCatsOpen(true), 110);
  };

  const closeCatsMenu = () => {
    if (catsTimerRef.current) clearTimeout(catsTimerRef.current);
    catsTimerRef.current = setTimeout(() => setCatsOpen(false), 120);
  };

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setOpen(false);
    setCatsOpen(false);
    setSearchOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);
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
                                prefetch={false}
                                onClick={() => setOpen(false)}
                                className="block px-2 py-2 text-sm text-white/65 transition hover:text-white"
                              >
                                {formatCategory(cat)}
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
                  {user ? (
                    <Link
                      href="/mis-pedidos"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 text-white/75 transition hover:bg-white/[0.04] hover:text-white"
                    >
                      <Package
                        className="h-4 w-4 text-[#c9a15a]"
                        strokeWidth={1.75}
                      />
                      <span className="text-[0.8rem] font-medium tracking-[0.14em] uppercase">
                        Mis pedidos
                      </span>
                    </Link>
                  ) : null}
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
        className={`fixed top-0 right-0 left-0 z-50 border-b border-white/[0.08] text-white transition-[background,box-shadow] duration-300 ${
          scrolled
            ? "bg-[#0f0f0f]/98 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "bg-[#111111]/94 backdrop-blur-xl"
        }`}
      >
        <div className="relative mx-auto flex h-[90px] max-w-[1760px] items-center px-4 sm:px-8 lg:px-12 xl:px-16">
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

          <nav className="absolute inset-x-0 top-0 hidden h-full items-center justify-center gap-1 md:flex lg:gap-2">
            {primaryNav.map((item) =>
              item.hasCats ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={openCatsMenu}
                  onMouseLeave={closeCatsMenu}
                >
                  <div className="inline-flex items-center">
                    <Link
                      href="/catalogo"
                      className="store-nav-link inline-flex items-center gap-1.5 px-3 py-2"
                      aria-current={active(item.href) ? "page" : undefined}
                      onClick={() => setCatsOpen(false)}
                    >
                      <span>Catálogo</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${
                          catsOpen ? "rotate-180 text-[#c9a15a] opacity-100" : ""
                        }`}
                      />
                    </Link>
                  </div>
                  <AnimatePresence>
                    {catsOpen && (
                      <div className="absolute top-full left-1/2 z-50 pt-2 -translate-x-1/2">
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="w-[440px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#141414] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                        >
                          {/* Cabecera compacta */}
                          <div className="mb-2.5 flex items-center justify-between border-b border-white/[0.07] pb-2.5 px-1">
                            <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-white/45 uppercase">
                              Categorías del Taller
                            </span>
                            <Link
                              href="/catalogo"
                              onClick={() => setCatsOpen(false)}
                              className="group inline-flex items-center gap-1 text-[0.68rem] font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:text-[#e0be7e]"
                            >
                              <span>Ver todo</span>
                              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                          </div>

                          {/* Cuadrícula limpia de 2 columnas con las categorías reales */}
                          <div className="grid grid-cols-2 gap-1">
                            {categories.map((cat) => {
                              const formatted = formatCategory(cat);
                              return (
                                <Link
                                  key={cat}
                                  href={`/catalogo?cat=${encodeURIComponent(cat)}`}
                                  prefetch={false}
                                  onClick={() => setCatsOpen(false)}
                                  className="group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] text-white/75 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                                >
                                  <span className="flex items-center gap-2 truncate">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a15a]/45 transition-colors group-hover:bg-[#c9a15a]" />
                                    <span className="truncate">{formatted}</span>
                                  </span>
                                  <ArrowRight className="h-3 w-3 shrink-0 text-[#c9a15a] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-90" />
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
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
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={`inline-flex h-10 w-10 items-center justify-center border transition duration-300 cursor-pointer ${
                searchOpen
                  ? "border-[#c9a15a] bg-[#c9a15a]/15 text-[#c9a15a]"
                  : "border-white/10 text-white/80 hover:border-[#c9a15a]/50 hover:text-white"
              }`}
              aria-label="Buscar en el catálogo"
              aria-expanded={searchOpen}
              title="Buscar muebles en el catálogo"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </button>
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

        {/* Barra de búsqueda rápida desplegable */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="border-t border-white/[0.08] bg-[#12100d]/95 px-4 py-3 backdrop-blur-2xl sm:px-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchText.trim();
                  setSearchOpen(false);
                  router.push(
                    q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo",
                  );
                }}
                className="mx-auto flex max-w-2xl items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a15a]" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Buscar cama, mesa de comedor, gavetero, repisa..."
                    className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.05] pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-[#c9a15a] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-[#c9a15a] px-4 text-xs font-bold tracking-wider text-[#0f0f0f] uppercase transition hover:bg-[#d8b46c] cursor-pointer"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white cursor-pointer"
                  aria-label="Cerrar buscador"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-[90px]" aria-hidden />
      {drawer}
    </>
  );
}
