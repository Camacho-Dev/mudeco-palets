import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/logo";

/** Columna editorial estática (solo desktop). Server component, sin animaciones. */
export function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#0e0b09] p-10 text-brand-cream-warm lg:col-span-5 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <Image
        src="/brand/store-hero.jpg"
        alt="Taller Mudeco Palets"
        fill
        priority
        sizes="42vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b09] via-[#0e0b09]/70 to-[#0e0b09]/80" />

      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white/85 transition hover:border-brand-gold/60 hover:text-[#f3d48c]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <div className="flex items-center gap-3.5">
          <LogoMark className="h-11 w-11 shrink-0 text-brand-gold" />
          <div className="leading-none">
            <span className="font-display block text-2xl tracking-[0.14em] text-white">
              MUDECO PALETS
            </span>
            <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-brand-gold">
              Taller Artesanal
            </span>
          </div>
        </div>
        <div className="h-px w-12 bg-brand-gold/70" />
        <h1 className="font-display text-4xl leading-[1.12] tracking-tight text-white xl:text-[2.65rem]">
          Madera recuperada,{" "}
          <span className="text-brand-gold">hecha a tu medida.</span>
        </h1>
        <p className="text-sm leading-relaxed text-white/65">
          Accede a tu cuenta para consultar tus pedidos, descargar facturas y
          dar seguimiento a tus piezas en fabricación.
        </p>
      </div>

      <p className="relative z-10 text-xs text-white/40">
        © {new Date().getFullYear()} Mudeco Palets · Taller artesanal
      </p>
    </aside>
  );
}

/** Barra superior móvil (estática). */
export function MobileTopBar() {
  return (
    <div className="flex items-center justify-between lg:hidden">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6f5d4b] hover:text-[#14100d]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Tienda</span>
      </Link>
      <div className="flex items-center gap-2">
        <LogoMark className="h-6 w-6 text-[#9b7435]" />
        <span className="font-display text-sm tracking-[0.12em] text-[#14100d]">
          MUDECO PALETS
        </span>
      </div>
    </div>
  );
}
