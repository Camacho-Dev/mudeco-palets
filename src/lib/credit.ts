import { prisma } from "@/lib/prisma";
import { calcInvoiceBalance } from "@/lib/invoice-calc";

export async function getCustomerOpenBalance(customerId: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { in: ["ISSUED", "PARTIAL"] },
    },
    include: { payments: true, creditNotes: true },
  });
  return invoices.reduce((sum, inv) => {
    return sum + calcInvoiceBalance(inv.total, inv.payments, inv.creditNotes);
  }, 0);
}

/** creditLimit 0 = sin límite */
export async function assertCreditAllows(
  customerId: string,
  additionalTotal: number,
) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer || !customer.creditLimit || customer.creditLimit <= 0) return;

  const open = await getCustomerOpenBalance(customerId);
  if (open + additionalTotal > customer.creditLimit + 0.001) {
    throw new Error(
      `Límite de crédito excedido para ${customer.name}. Límite: ${customer.creditLimit}, saldo abierto: ${open}`,
    );
  }
}
