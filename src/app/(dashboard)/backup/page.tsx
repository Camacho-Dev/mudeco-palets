import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";

export default async function BackupPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="Respaldo"
        description="Descarga un JSON con los datos del sistema"
      />
      <a href="/api/backup" className="btn btn-primary">
        Descargar respaldo JSON
      </a>
      <p className="mt-4 max-w-lg text-sm text-[var(--muted)]">
        Incluye clientes, productos, facturas, pagos, cotizaciones, compras,
        auditoría reciente y configuración. No incluye hashes de contraseña.
        Guárdalo fuera de OneDrive si puedes.
      </p>
    </div>
  );
}
