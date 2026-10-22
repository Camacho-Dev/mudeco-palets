import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";

const exports = [
  { type: "facturas", label: "Facturas CSV" },
  { type: "cotizaciones", label: "Cotizaciones CSV" },
  { type: "pedidos-web", label: "Pedidos web CSV" },
  { type: "clientes", label: "Clientes CSV" },
  { type: "productos", label: "Productos / inventario CSV" },
  { type: "auditoria", label: "Auditoría CSV" },
  { type: "pagos", label: "Pagos CSV" },
];

export default async function ExportarPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="Exportar"
        description="Descargas CSV para Excel / control"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {exports.map((e) => (
          <a
            key={e.type}
            href={`/api/export/${e.type}`}
            className="card block p-4 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            {e.label}
          </a>
        ))}
      </div>
    </div>
  );
}
