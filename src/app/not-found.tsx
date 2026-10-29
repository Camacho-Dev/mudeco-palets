import Link from "next/link";
import { BrandLogo } from "@/components/logo";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6f1] px-4 py-12 text-center selection:bg-[#c49a5c] selection:text-[#2c1d14]">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="mx-auto flex justify-center">
          <BrandLogo width={180} height={150} tone="onLight" className="h-auto w-40" />
        </div>

        <div className="space-y-3">
          <span className="inline-block rounded-full bg-[#3d2a1f]/10 px-4 py-1 text-xs font-bold tracking-widest text-[#3d2a1f] uppercase">
            Error 404 · No encontrado
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#3d2a1f] sm:text-4xl">
            Pieza o página no encontrada
          </h1>
          <p className="text-sm text-stone-600 sm:text-base">
            El enlace que seguiste no existe o fue reubicado en nuestro taller. Puedes volver a navegar por las áreas principales del sistema:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#3d2a1f] px-5 py-3 text-sm font-semibold text-[#faf6f1] shadow-md hover:bg-[#2c1d14] transition"
          >
            <Home className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </Link>
          <Link
            href="/catalogo"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#3d2a1f]/20 bg-white px-5 py-3 text-sm font-semibold text-[#3d2a1f] shadow-sm hover:bg-stone-50 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Ver Catálogo Web</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-400">
            Mudeco Palets · Muebles artesanales en madera recuperada · República Dominicana
          </p>
        </div>
      </div>
    </div>
  );
}
