import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createCreditNote } from "../actions";

export default async function NuevaNotaCreditoPage() {
  await requireAdmin();
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ["ISSUED", "PARTIAL", "PAID"] } },
    orderBy: { issueDate: "desc" },
    take: 50,
    include: { customer: true },
  });

  return (
    <div>
      <PageHeader title="Nueva nota de crédito" />
      <form action={createCreditNote} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label">Factura</label>
          <select name="invoiceId" className="input" required>
            <option value="">Seleccionar…</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.number} · {inv.customer.name} · {inv.total}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Motivo</label>
          <textarea name="reason" className="input" rows={3} required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="full" value="true" defaultChecked />
          Devolver todas las líneas y reponer stock
        </label>
        <button type="submit" className="btn btn-primary">
          Emitir NC
        </button>
      </form>
    </div>
  );
}
