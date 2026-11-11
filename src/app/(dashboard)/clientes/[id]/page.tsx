import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { deleteCustomer, toggleCustomerActive, updateCustomer } from "../actions";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { webOrderTypeLabel } from "@/lib/web-order-labels";
import { ConfirmForm } from "@/components/confirm-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { issueDate: "desc" },
        take: 20,
        select: {
          id: true,
          number: true,
          ncf: true,
          status: true,
          total: true,
          issueDate: true,
        },
      },
      webOrders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          number: true,
          type: true,
          status: true,
          serviceKind: true,
          total: true,
          createdAt: true,
        },
      },
      quotes: {
        where: { source: "WEB" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, number: true, status: true, total: true },
      },
    },
  });
  if (!customer) notFound();

  const totalBilled = customer.invoices
    .filter((i) => i.status !== "VOIDED" && i.status !== "CANCELLED" && i.status !== "DRAFT")
    .reduce((s, i) => s + i.total, 0);

  const update = updateCustomer.bind(null, id);
  const toggleActive = toggleCustomerActive.bind(null, id);
  const remove = deleteCustomer.bind(null, id);
  const hasTransactions =
    customer.invoices.length > 0 ||
    customer.webOrders.length > 0 ||
    customer.quotes.length > 0;

  return (
    <div>
      <PageHeader
        title={customer.active ? "Editar cliente" : "Editar cliente (Bloqueado)"}
        description={`${customer.name} · Estado: ${customer.active ? "Activo" : "Bloqueado"}`}
      />
      <form action={update} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">
            Nombre / Razón social
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={customer.name}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="taxId">
            RNC / Cédula
          </label>
          <input
            id="taxId"
            name="taxId"
            defaultValue={customer.taxId || ""}
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={customer.email || ""}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={customer.phone || ""}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">
            Dirección
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={customer.address || ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="creditLimit">
            Límite de crédito (0 = sin límite)
          </label>
          <input
            id="creditLimit"
            name="creditLimit"
            type="number"
            step="0.01"
            defaultValue={customer.creditLimit}
            className="input"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Guardar cambios
          </button>
          <Link href="/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
      <div className="mt-6 max-w-xl space-y-4">
        {/* Control de Bloqueo / Desbloqueo */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--wood-950)]">
                {customer.active ? "Estado del cliente: Activo" : "Estado del cliente: Bloqueado"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {customer.active
                  ? "Bloquear este cliente impedirá que realice nuevos pedidos o inicie sesión en la tienda web."
                  : "El cliente se encuentra bloqueado actualmente. Puedes reactivarlo para permitirle comprar."}
              </p>
            </div>
            <ConfirmForm
              action={toggleActive}
              title={customer.active ? "Bloquear cliente" : "Desbloquear cliente"}
              message={
                customer.active
                  ? `¿Estás seguro de que deseas bloquear a "${customer.name}"? No podrá realizar compras ni acceder a su cuenta web.`
                  : `¿Deseas desbloquear a "${customer.name}" para restaurar su acceso y permitirle realizar pedidos?`
              }
              confirmLabel={customer.active ? "Sí, bloquear cliente" : "Sí, desbloquear cliente"}
              isDestructive={customer.active}
            >
              <button
                type="submit"
                className={`btn text-xs font-semibold cursor-pointer ${
                  customer.active
                    ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    : "border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                }`}
              >
                {customer.active ? "Bloquear cliente" : "Desbloquear cliente"}
              </button>
            </ConfirmForm>
          </div>
        </div>

        {/* Zona de Eliminación Protegida */}
        {hasTransactions ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5">
              <span>🛡️ Cliente con historial fiscal protegido</span>
            </p>
            <p className="mt-1 text-amber-800/90 leading-relaxed">
              Este cliente cuenta con {customer.invoices.length} factura(s), {customer.webOrders.length} pedido(s) o cotizaciones registradas.
              Por normativas fiscales y auditoría contable no se puede eliminar del historial histórico.
              Utiliza el botón <strong>{customer.active ? "Bloquear cliente" : "Desbloquear cliente"}</strong> para gestionar su acceso.
            </p>
          </div>
        ) : (
          <ConfirmForm
            action={remove}
            title="Eliminar cliente"
            message={`¿Estás seguro de que deseas eliminar permanentemente al cliente "${customer.name}"? Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar cliente"
            isDestructive={true}
          >
            <button type="submit" className="btn btn-danger text-xs">
              Eliminar cliente (Sin historial)
            </button>
          </ConfirmForm>
        )}
      </div>

      {customer.invoices.length > 0 ? (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold text-[var(--wood-950)]">
              Facturas emitidas ({customer.invoices.length})
            </h2>
            <span className="text-xs font-medium text-[var(--muted)]">
              Total facturado:{" "}
              <span className="font-mono text-sm font-bold text-[var(--wood-950)]">
                {formatCurrency(totalBilled)}
              </span>
            </span>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>NCF</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {customer.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        href={`/facturas/${inv.id}`}
                        className="font-mono font-medium text-[var(--wood-900)] hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="font-mono text-xs text-[var(--muted)]">
                      {inv.ncf || "—"}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="text-xs text-[var(--muted)]">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="text-right font-mono font-bold text-xs text-[var(--wood-950)]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/facturas/${inv.id}`}
                        className="text-xs font-semibold text-[var(--wood-800)] hover:underline"
                      >
                        Ver factura
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {customer.webOrders.length > 0 ? (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-[var(--wood-950)]">
            Pedidos desde la web
          </h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {customer.webOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link
                        href={`/pedidos-web/${o.id}`}
                        className="font-medium underline"
                      >
                        {o.number}
                      </Link>
                    </td>
                    <td>{webOrderTypeLabel(o)}</td>
                    <td>{o.status}</td>
                    <td>{formatCurrency(o.total)}</td>
                    <td>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
