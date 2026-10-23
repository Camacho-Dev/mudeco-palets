import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { updateSupplier } from "../actions";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Package,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const s = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { orderedAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!s) notFound();

  const totalPurchases = s.purchases.length;
  const receivedPurchases = s.purchases.filter((p) => p.status === "RECEIVED");
  const pendingPurchases = s.purchases.filter(
    (p) => p.status === "ORDERED" || p.status === "DRAFT",
  );
  const totalSpent = receivedPurchases.reduce((acc, p) => acc + p.total, 0);

  // Clean phone number for WhatsApp link
  const rawDigits = (s.phone || "").replace(/\D/g, "");
  const waNumber =
    rawDigits.length === 10
      ? `1${rawDigits}`
      : rawDigits.length === 11 && rawDigits.startsWith("1")
        ? rawDigits
        : rawDigits;
  const waUrl = rawDigits ? `https://wa.me/${waNumber}` : null;

  return (
    <div className="space-y-6">
      {/* Back button & Action shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/proveedores"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[var(--muted)] uppercase transition hover:text-[var(--wood-900)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Proveedores
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-xs inline-flex items-center gap-1.5 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </a>
          )}
          <Link
            href="/compras/nueva"
            className="btn btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <Truck className="h-4 w-4" />
            Nueva orden de compra
          </Link>
        </div>
      </div>

      <PageHeader
        title={s.name}
        description={
          s.taxId
            ? `RNC / Cédula: ${s.taxId} · Proveedor registrado`
            : "Proveedor registrado de insumos y materiales"
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Total Comprado (Recibido)
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--wood-950)]">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Órdenes Registradas
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--wood-950)]">
            {totalPurchases}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Recibidas
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-emerald-700">
            {receivedPurchases.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Pendientes
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-amber-800">
            {pendingPurchases.length}
          </p>
        </div>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Supplier Info & Edit Form */}
        <div className="card p-6 shadow-xs lg:col-span-1">
          <h3 className="font-display text-base font-bold text-[var(--wood-950)] mb-4 pb-2 border-b border-stone-200">
            Datos del Proveedor
          </h3>

          <form action={updateSupplier.bind(null, id)} className="space-y-4">
            <div>
              <label className="label">Nombre / Razón Social</label>
              <input
                name="name"
                className="input"
                defaultValue={s.name}
                required
              />
            </div>

            <div>
              <label className="label">RNC o Cédula</label>
              <input
                name="taxId"
                className="input font-mono"
                defaultValue={s.taxId || ""}
                placeholder="Ej. 101-12345-6"
              />
            </div>

            <div>
              <label className="label">Teléfono / WhatsApp</label>
              <input
                name="phone"
                className="input"
                defaultValue={s.phone || ""}
                placeholder="Ej. 809-555-0123"
              />
            </div>

            <div>
              <label className="label">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                className="input"
                defaultValue={s.email || ""}
                placeholder="contacto@proveedor.com"
              />
            </div>

            <div>
              <label className="label">Dirección / Depósito</label>
              <textarea
                name="address"
                className="input"
                rows={2}
                defaultValue={s.address || ""}
                placeholder="Dirección física o almacén"
              />
            </div>

            <div className="pt-2">
              <button className="btn btn-primary w-full" type="submit">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        {/* Right: Purchase Orders History */}
        <div className="card p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
                Historial de Órdenes de Compra
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Insumos, madera y materiales adquiridos de {s.name}
              </p>
            </div>

            <Link
              href="/compras/nueva"
              className="text-xs font-semibold text-[var(--wood-800)] hover:underline"
            >
              + Nueva compra
            </Link>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Artículos</th>
                  <th className="text-right">Total</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {s.purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[var(--muted)]">
                      Aún no hay compras registradas para este proveedor.
                    </td>
                  </tr>
                ) : (
                  s.purchases.map((p) => {
                    const itemCount = p.items.reduce(
                      (acc, i) => acc + i.quantity,
                      0,
                    );
                    const itemNames = p.items
                      .map((i) => `${i.quantity} ${i.product.unit} ${i.product.name}`)
                      .slice(0, 2)
                      .join(", ");
                    const moreItems =
                      p.items.length > 2 ? ` (+${p.items.length - 2} más)` : "";

                    return (
                      <tr key={p.id}>
                        <td>
                          <Link
                            href={`/compras/${p.id}`}
                            className="font-mono text-xs font-bold text-[var(--wood-900)] hover:underline"
                          >
                            {p.number}
                          </Link>
                        </td>
                        <td className="text-xs text-[var(--muted)]">
                          {formatDate(p.orderedAt)}
                        </td>
                        <td>
                          {p.status === "RECEIVED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.7rem] font-semibold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Recibida
                            </span>
                          ) : p.status === "CANCELLED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[0.7rem] font-semibold text-rose-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Cancelada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Ordenada
                            </span>
                          )}
                        </td>
                        <td className="text-xs text-stone-700 max-w-xs truncate" title={itemNames}>
                          {itemNames || "—"}
                          {moreItems}
                        </td>
                        <td className="text-right font-mono text-xs font-bold text-[var(--wood-950)]">
                          {formatCurrency(p.total)}
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/compras/${p.id}`}
                            className="text-xs font-semibold text-[var(--wood-800)] hover:underline"
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
