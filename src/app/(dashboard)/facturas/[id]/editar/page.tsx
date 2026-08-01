import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "@/components/invoice-form";
import { updateInvoice } from "../../actions";

export default async function EditarFacturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice || invoice.status !== "DRAFT") notFound();

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED" },
      orderBy: { name: "asc" },
    }),
  ]);

  const update = updateInvoice.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Editar ${invoice.number}`}
        description="Solo borradores se pueden editar"
      />
      <InvoiceForm
        customers={customers}
        products={products}
        action={update}
        initial={{
          customerId: invoice.customerId,
          ncf: invoice.ncf || "",
          notes: invoice.notes || "",
          dueDate: invoice.dueDate
            ? invoice.dueDate.toISOString().slice(0, 10)
            : "",
          delivery: invoice.delivery,
          deliveryFee: invoice.deliveryFee,
          applyTax: invoice.applyTax,
          lines: invoice.items.map((i) => ({
            productId: i.productId || "",
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
          })),
        }}
      />
    </div>
  );
}
