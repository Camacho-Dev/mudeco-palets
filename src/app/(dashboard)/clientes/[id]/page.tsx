import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { deleteCustomer, updateCustomer } from "../actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const update = updateCustomer.bind(null, id);
  const remove = deleteCustomer.bind(null, id);

  return (
    <div>
      <PageHeader title="Editar cliente" description={customer.name} />
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
      <form action={remove} className="mt-6 max-w-xl">
        <button type="submit" className="btn btn-danger">
          Eliminar cliente
        </button>
      </form>
    </div>
  );
}
