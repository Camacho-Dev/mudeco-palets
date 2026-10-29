import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { WorkOrderForm } from "@/components/work-order-form";
import { createWorkOrder } from "../actions";

export default async function NuevaFabricacionPage({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    qty?: string;
    orderNumber?: string;
    customer?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
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

  const defaultQty = params.qty ? Math.max(1, Number(params.qty) || 1) : 1;
  const defaultNotes = params.orderNumber
    ? `Orden de fabricación vinculada al Pedido Web ${params.orderNumber}${
        params.customer ? ` (${params.customer})` : ""
      }`
    : "";

  return (
    <div>
      <PageHeader
        title="Nueva orden de fabricación"
        description={
          params.orderNumber
            ? `Preparando fabricación para el pedido web ${params.orderNumber}`
            : "Consume materiales del almacén y suma muebles terminados al inventario"
        }
      />
      <WorkOrderForm
        finished={finished}
        materials={materials}
        action={createWorkOrder}
        defaultProductId={params.productId || ""}
        defaultQuantity={defaultQty}
        defaultNotes={defaultNotes}
      />
    </div>
  );
}
