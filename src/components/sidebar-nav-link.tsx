"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavLink({
  href,
  label,
  icon,
  badge,
  group,
}: {
  href: string;
  label: string;
  /** Icono ya renderizado (los componentes no pueden cruzar de servidor a cliente) */
  icon: React.ReactNode;
  badge?: number;
  /** Agrupa el indicador animado; el escritorio y el móvil usan grupos distintos */
  group: string;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
        active
          ? "font-semibold text-white"
          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
      }`}
    >
      {active ? (
        <motion.span
          layoutId={`sidebar-active-${group}`}
          className="absolute inset-0 rounded-xl bg-white/[0.08] ring-1 ring-white/[0.06]"
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 36 }
          }
        >
          <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400" />
        </motion.span>
      ) : null}
      <span
        className={`relative flex h-4 w-4 shrink-0 items-center justify-center transition-colors duration-200 [&>svg]:h-4 [&>svg]:w-4 ${
          active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="relative flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="relative rounded-full bg-amber-400 px-2 py-0.5 text-[0.62rem] font-extrabold text-slate-950">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
