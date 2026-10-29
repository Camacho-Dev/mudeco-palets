import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import {
  FileText,
  ClipboardList,
  Globe,
  Users,
  Package,
  ScrollText,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Download,
  ShieldCheck,
} from "lucide-react";

const standardExports = [
  {
    type: "facturas",
    label: "Facturas Emitidas",
    desc: "Números, clientes, NCF, subtotal, ITBIS y total",
    icon: FileText,
  },
  {
    type: "cotizaciones",
    label: "Cotizaciones",
    desc: "Presupuestos emitidos y solicitudes web",
    icon: ClipboardList,
  },
  {
    type: "pedidos-web",
    label: "Pedidos de la Tienda Online",
    desc: "Ventas por carrito y cotizaciones a medida",
    icon: Globe,
  },
  {
    type: "clientes",
    label: "Directorio de Clientes",
    desc: "RNC/Cédula, teléfonos, emails y límites de crédito",
    icon: Users,
  },
  {
    type: "productos",
    label: "Catálogo e Inventario",
    desc: "Muebles, insumos, costos, precios y existencias",
    icon: Package,
  },
  {
    type: "pagos",
    label: "Cobros y Pagos Recibidos",
    desc: "Historial de efectivo, transferencias y tarjetas",
    icon: CreditCard,
  },
  {
    type: "auditoria",
    label: "Registro de Auditoría",
    desc: "Trazabilidad de acciones de usuarios y fechas",
    icon: ScrollText,
  },
];

const fiscalExports = [
  {
    type: "dgii-607",
    code: "Formato 607",
    title: "Ventas de Bienes y Servicios (DGII)",
    desc: "Estructura oficial para la remisión de comprobantes fiscales emitidos, montos facturados, NCF y retenciones.",
    badge: "Declaración Mensual ITBIS",
  },
  {
    type: "dgii-606",
    code: "Formato 606",
    title: "Compras de Bienes y Servicios (DGII)",
    desc: "Estructura oficial para reporte de costos, gastos y adquisiciones de insumos madereros a proveedores.",
    badge: "Compras y Gastos Costo",
  },
];

export default async function ExportarPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Centro de Exportación de Datos"
        description="Descarga de reportes operativos en formato CSV para Excel y formatos fiscales oficiales para la DGII"
      />

      {/* Sección Formatos Oficiales DGII */}
      <div className="rounded-2xl border-2 border-[#b0894f]/40 bg-gradient-to-br from-[#faf6f1] via-white to-[#f5ede2] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3d2a1f] text-[#b0894f] shadow">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#3d2a1f] px-2 py-0.5 text-[0.65rem] font-bold text-[#faf6f1] uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3 text-[#b0894f]" />
                  Dirección General de Impuestos Internos (DGII)
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--wood-950)] mt-0.5">
                Formatos Fiscales Oficiales (República Dominicana)
              </h2>
            </div>
          </div>
        </div>

        <p className="mb-5 text-xs text-[var(--muted)] leading-relaxed">
          Archivos estructurados según las especificaciones técnicas vigentes de la DGII para importar directamente en la herramienta de envío o abrir en Excel.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {fiscalExports.map((f) => (
            <div
              key={f.type}
              className="group flex flex-col justify-between rounded-xl border border-[#b0894f]/30 bg-white p-5 shadow-sm transition hover:border-[#b0894f] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-mono font-bold text-[var(--wood-950)]">
                    {f.code}
                  </span>
                  <span className="rounded-full bg-[#b0894f]/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-[#8a652f]">
                    {f.badge}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-[var(--wood-950)]">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                <a
                  href={`/api/export/${f.type}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wood-950)] px-3.5 py-2 text-xs font-semibold text-[#faf6f1] shadow hover:bg-[var(--wood-800)] transition"
                >
                  <Download className="h-3.5 w-3.5 text-[#b0894f]" />
                  <span>Descargar {f.code}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Reportes Operativos Estándar */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-[#b0894f]" />
          <h2 className="font-display text-lg font-bold text-[var(--wood-950)]">
            Reportes Operativos Internos (CSV para Excel)
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {standardExports.map((e) => {
            const Icon = e.icon;
            return (
              <a
                key={e.type}
                href={`/api/export/${e.type}`}
                className="group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[#b0894f] hover:bg-[#fbf7f2]/50 hover:shadow"
              >
                <div className="rounded-lg bg-stone-100 p-2.5 text-[var(--wood-800)] group-hover:bg-[#b0894f]/20 group-hover:text-[var(--wood-950)] transition">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--wood-950)] group-hover:text-[var(--wood-800)]">
                    {e.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)] truncate">
                    {e.desc}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#b0894f] group-hover:underline">
                    Descargar CSV <Download className="h-3 w-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
