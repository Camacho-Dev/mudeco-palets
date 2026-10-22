import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { BackupRestoreForm } from "@/components/backup-restore-form";
import { Download, ShieldCheck } from "lucide-react";

export default async function BackupPage() {
  await requireAdmin();
  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Respaldo y restauración"
        description="Descarga copias de seguridad de la base de datos o restaura la información del taller"
      />

      {/* Sección 1: Descargar Copia */}
      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-[#b0894f]" />
          <h2 className="text-lg font-semibold text-[var(--wood-950)]">
            Exportar copia de seguridad
          </h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Genera un archivo JSON completo con clientes, productos, proveedores, facturas, compras, cotizaciones y configuración.
        </p>
        <a href="/api/backup" className="btn btn-primary inline-flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Descargar respaldo JSON</span>
        </a>
      </div>

      {/* Sección 2: Restaurar Copia */}
      <div className="card space-y-4 p-6 border-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
          <h2 className="text-lg font-semibold text-[var(--wood-950)]">
            Restaurar base de datos
          </h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Carga un archivo de respaldo previo para sincronizar o recuperar clientes, productos y proveedores sin borrar registros existentes.
        </p>
        <BackupRestoreForm />
      </div>
    </div>
  );
}
