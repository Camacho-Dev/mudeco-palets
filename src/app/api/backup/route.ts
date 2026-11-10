import { getVerifiedApiSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getVerifiedApiSession();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = checkRateLimit(`admin-backup:${session.user.id}`, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas descargas de respaldo seguidas. Espera unos minutos." },
      { status: 429 },
    );
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
    webOrders,
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
    prisma.webOrder.findMany({ include: { items: true } }),
  ]);

  await writeAudit({
    action: "BACKUP_DOWNLOAD",
    entity: "System",
    summary: `Respaldo completo JSON descargado por ${session.user.email}`,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  }).catch(() => undefined);

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
    webOrders,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mudeco-backup-${Date.now()}.json"`,
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
