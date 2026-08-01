import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DateFilterBar } from "@/components/date-filter";
import { buildDateRange } from "@/lib/date-range";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    month?: string;
    from?: string;
    to?: string;
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const { status } = params;
  const range = buildDateRange(params);

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(range.from && range.to
        ? { issueDate: { gte: range.from, lte: range.to } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      payments: true,
    },
  });

  const filters = [
    { value: "", label: "Todas" },
    { value: "DRAFT", label: "Borrador" },
    { value: "ISSUED", label: "Emitida" },
    { value: "PARTIAL", label: "Parcial" },
    { value: "PAID", label: "Pagada" },
    { value: "VOIDED", label: "Anulada" },
  ];

  function statusHref(value: string) {
    const q = new URLSearchParams();
    if (value) q.set("status", value);
    if (params.kind) q.set("kind", params.kind);
    if (params.month) q.set("month", params.month);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    const s = q.toString();
    return s ? `/facturas?${s}` : "/facturas";
  }

  return (
    <div>
      <PageHeader
        title="Facturas"
        description={`Historial guardado · ${range.label}`}
        action={{ href: "/vender", label: "Generar factura" }}
      />

      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo de facturas" />
      </Suspense>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status || "") === f.value;
          return (
            <Link
              key={f.value || "all"}
              href={statusHref(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active
                  ? "bg-[#3d2a1f] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[#fbf7f2]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  No hay facturas en este periodo
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-medium">{inv.number}</td>
                  <td>{inv.customer.name}</td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/facturas/${inv.id}`}
                      className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
