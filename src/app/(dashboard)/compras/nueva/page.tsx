import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchase-form";
import { createPurchase } from "../actions";

export default async function NuevaCompraPage() {
  await requireAdmin();
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, NOT: { sku: "CUS-001" } },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      select: { id: true, name: true, kind: true, cost: true, unit: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nueva compra"
        description="Registra la adquisición de madera, insumos o piezas para el taller"
      />
      <PurchaseForm
        suppliers={suppliers}
        products={products}
        action={createPurchase}
      />
    </div>
  );
}
