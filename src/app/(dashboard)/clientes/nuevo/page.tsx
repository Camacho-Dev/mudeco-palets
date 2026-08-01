import { createCustomer } from "../actions";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { requireSession } from "@/lib/session";

export default async function NuevoClientePage() {
  await requireSession();

  return (
    <div>
      <PageHeader
        title="Nuevo cliente"
        description="Datos fiscales y de contacto"
      />
      <form action={createCustomer} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">
            Nombre / Razón social
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="taxId">
            RNC / Cédula
          </label>
          <input id="taxId" name="taxId" className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono
            </label>
            <input id="phone" name="phone" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">
            Dirección
          </label>
          <textarea id="address" name="address" rows={2} className="input" />
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
            defaultValue={0}
            className="input"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <Link href="/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
