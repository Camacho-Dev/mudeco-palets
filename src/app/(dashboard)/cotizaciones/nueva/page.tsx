import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { CustomerSearchSelect } from "@/components/customer-search-select";
import { createQuote } from "../actions";

export default async function NuevaCotizacionPage() {
  await requireSession();
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true, kind: "FINISHED" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Nueva cotización" />
      <form action={createQuote} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="customerId">
            Cliente
          </label>
          <CustomerSearchSelect
            id="customerId"
            name="customerId"
            customers={customers}
            required
          />
        </div>
        <div>
          <label className="label">Válida hasta</label>
          <input
            name="validUntil"
            type="date"
            className="input"
            min="2000-01-01"
            max="2100-12-31"
          />
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea name="notes" className="input" rows={2} />
        </div>
        <div className="space-y-2">
          <p className="label">Líneas (hasta 5)</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-2 md:grid-cols-5">
              <select name="productId" className="input md:col-span-2" defaultValue="">
                <option value="">Manual / producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price}
                  </option>
                ))}
              </select>
              <input name="description" className="input" placeholder="Descripción" />
              <input name="quantity" type="number" step="0.01" defaultValue={1} className="input" placeholder="Cant" />
              <input name="unitPrice" type="number" step="0.01" defaultValue={0} className="input" placeholder="Precio" />
              <input type="hidden" name="taxRate" value="0.18" />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar cotización
        </button>
      </form>
    </div>
  );
}
