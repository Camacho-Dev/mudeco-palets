import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [
    users,
    customers,
    products,
    invoices,
    payments,
    settings,
    quotes,
    suppliers,
    purchases,
    creditNotes,
    workOrders,
    ncfSeries,
    auditLog,
    stockMoves,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        commissionRate: true,
        createdAt: true,
      },
    }),
    prisma.customer.findMany(),
    prisma.product.findMany(),
    prisma.invoice.findMany({ include: { items: true } }),
    prisma.payment.findMany(),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
    prisma.quote.findMany({ include: { items: true } }),
    prisma.supplier.findMany(),
    prisma.purchase.findMany({ include: { items: true } }),
    prisma.creditNote.findMany({ include: { items: true } }),
    prisma.workOrder.findMany({ include: { items: true } }),
    prisma.ncfSeries.findMany(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
    prisma.stockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Mudeco Palets",
    users,
    customers,
    products,
    invoices,
    payments,
    settings,
    quotes,
    suppliers,
    purchases,
    creditNotes,
    workOrders,
    ncfSeries,
    auditLog,
    stockMoves,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mudeco-backup-${Date.now()}.json"`,
    },
  });
}
