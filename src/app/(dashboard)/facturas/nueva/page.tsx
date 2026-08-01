import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "@/components/invoice-form";
import { createInvoice } from "../actions";

export default async function NuevaFacturaPage() {
  await requireSession();

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nueva factura"
        description="Agrega líneas, calcula ITBIS y emite"
      />
      <InvoiceForm
        customers={customers}
        products={products}
        action={createInvoice}
      />
    </div>
  );
}
