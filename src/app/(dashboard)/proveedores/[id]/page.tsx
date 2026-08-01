import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { updateSupplier } from "../actions";

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const s = await prisma.supplier.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div>
      <PageHeader title={s.name} description="Editar proveedor" />
      <form action={updateSupplier.bind(null, id)} className="card max-w-lg space-y-3 p-6">
        <div>
          <label className="label">Nombre</label>
          <input name="name" className="input" defaultValue={s.name} required />
        </div>
        <div>
          <label className="label">RNC</label>
          <input name="taxId" className="input" defaultValue={s.taxId || ""} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input name="phone" className="input" defaultValue={s.phone || ""} />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" defaultValue={s.email || ""} />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input name="address" className="input" defaultValue={s.address || ""} />
        </div>
        <button className="btn btn-primary" type="submit">
          Guardar
        </button>
      </form>
    </div>
  );
}
