import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { WorkOrderForm } from "@/components/work-order-form";
import { createWorkOrder } from "../actions";

export default async function NuevaFabricacionPage() {
  await requireAdmin();
  const [finished, materials] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED", NOT: { sku: "CUS-001" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, stock: true },
    }),
    prisma.product.findMany({
      where: { active: true, kind: "MATERIAL" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true, stock: true, unit: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nueva orden de fabricación"
        description="Consume materiales del almacén y suma muebles terminados al inventario"
      />
      <WorkOrderForm
        finished={finished}
        materials={materials}
        action={createWorkOrder}
      />
    </div>
  );
}
