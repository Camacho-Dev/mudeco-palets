import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createSupplier } from "../actions";

export default async function NuevoProveedorPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="Nuevo proveedor" />
      <form action={createSupplier} className="card max-w-lg space-y-3 p-6">
        <div>
          <label className="label">Nombre</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">RNC</label>
          <input name="taxId" className="input" />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input name="phone" className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input name="address" className="input" />
        </div>
        <button className="btn btn-primary" type="submit">
          Guardar
        </button>
      </form>
    </div>
  );
}
