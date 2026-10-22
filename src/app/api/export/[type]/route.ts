import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { NextResponse } from "next/server";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  return [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => csvEscape(r[k])).join(",")),
  ].join("\n");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ type: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { type } = await ctx.params;
  let rows: Record<string, unknown>[] = [];

  if (type === "facturas") {
    const data = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { issueDate: "desc" },
    });
    rows = data.map((i) => ({
      number: i.number,
      ncf: i.ncf,
      status: i.status,
      customer: i.customer.name,
      issueDate: i.issueDate.toISOString(),
      subtotal: i.subtotal,
      tax: i.tax,
      total: i.total,
    }));
  } else if (type === "clientes") {
    const data = await prisma.customer.findMany({ orderBy: { name: "asc" } });
    rows = data.map((c) => ({
      name: c.name,
      taxId: c.taxId,
      phone: c.phone,
      email: c.email,
      creditLimit: c.creditLimit,
    }));
  } else if (type === "productos") {
    const data = await prisma.product.findMany({ orderBy: { name: "asc" } });
    rows = data.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock,
      active: p.active,
    }));
  } else if (type === "auditoria") {
    const data = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    rows = data.map((a) => ({
      createdAt: a.createdAt.toISOString(),
      userEmail: a.userEmail,
      action: a.action,
      entity: a.entity,
      summary: a.summary,
    }));
  } else if (type === "pagos") {
    const data = await prisma.payment.findMany({
      include: { invoice: true },
      orderBy: { paidAt: "desc" },
    });
    rows = data.map((p) => ({
      invoice: p.invoice.number,
      amount: p.amount,
      method: p.method,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
    }));
  } else if (type === "pedidos-web") {
    const data = await prisma.webOrder.findMany({
      orderBy: { createdAt: "desc" },
    });
    rows = data.map((o) => ({
      number: o.number,
      type: o.type,
      paymentMode: o.paymentMode || "",
      status: o.status,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone || "",
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      notes: o.notes || "",
      createdAt: o.createdAt.toISOString(),
    }));
  } else if (type === "cotizaciones") {
    const data = await prisma.quote.findMany({
      include: { customer: true },
      orderBy: { issueDate: "desc" },
    });
    rows = data.map((q) => ({
      number: q.number,
      status: q.status,
      source: q.source,
      customer: q.customer.name,
      issueDate: q.issueDate.toISOString(),
      subtotal: q.subtotal,
      tax: q.tax,
      total: q.total,
    }));
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const body = toCsv(rows);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
