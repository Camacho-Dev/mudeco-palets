import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { QuickSale } from "@/components/quick-sale";
import { generateAndPrint } from "../facturas/actions";
import { formatDate } from "@/lib/format";

export default async function VenderPage() {
  await requireSession();

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Generar factura"
        description="Elige cliente y muebles. Un clic emite, descuenta stock e imprime."
      />
      <QuickSale
        customers={customers}
        products={products}
        action={generateAndPrint}
        todayLabel={formatDate(new Date())}
      />
    </div>
  );
}
