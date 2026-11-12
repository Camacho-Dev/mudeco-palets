import Link from "next/link";
import { Compass, ArrowRight, Home } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="min-h-[70vh] bg-[#faf7f2] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#e2d5c5] bg-white p-8 sm:p-10 text-center shadow-[0_20px_50px_-20px_rgba(20,16,13,0.1)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a15a]/35 bg-[#faf7f2]">
          <Compass className="h-7 w-7 text-[#b0894f]" />
        </div>
        <p className="mt-5 text-[0.65rem] font-bold tracking-[0.22em] text-[#b0894f] uppercase">
          Error 404
        </p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl text-[#14100d]">
          Pieza o página no encontrada
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-[#786958]">
          Es posible que el enlace haya cambiado o que la pieza ya no se
          encuentre disponible en el catálogo.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#14100d] px-6 py-3 text-xs font-bold tracking-wider text-[#f5dfa8] uppercase transition hover:bg-[#261e18]"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#e2d5c5] bg-[#faf7f2] px-6 py-3 text-xs font-bold tracking-wider text-[#403227] uppercase transition hover:border-[#c9a15a] hover:bg-white"
          >
            <Home className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

