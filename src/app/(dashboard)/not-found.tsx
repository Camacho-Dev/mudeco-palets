import Link from "next/link";
import { ArrowLeft, FileText, LayoutDashboard, Search, Warehouse } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b0894f]/15 text-[#b0894f] border border-[#b0894f]/30 mb-6 shadow-inner">
        <Search className="h-8 w-8" />
      </div>

      <span className="text-xs font-bold tracking-[0.2em] text-[#b0894f] uppercase">
        Error 404 · Registro no encontrado
      </span>

      <h1 className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)] sm:text-4xl">
        No encontramos lo que buscas
      </h1>

      <p className="mt-3 max-w-md text-sm text-[var(--muted)] leading-relaxed">
        El registro, documento o módulo solicitado no existe, fue eliminado o no tienes permisos suficientes para visualizarlo.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/panel"
          className="btn btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <LayoutDashboard className="h-4 w-4" />
          Ir al Panel
        </Link>

        <Link
          href="/facturas"
          className="btn btn-secondary inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <FileText className="h-4 w-4" />
          Ver Facturas
        </Link>

        <Link
          href="/inventario"
          className="btn btn-ghost inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <Warehouse className="h-4 w-4" />
          Inventario
        </Link>
      </div>
    </div>
  );
}
