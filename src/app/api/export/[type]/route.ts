import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { NextResponse } from "next/server";

function csvEscape(v: unknown) {
  if (v == null) return "";
  let s = String(v);
  // Mitigar CSV Formula Injection (CWE-1236)
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
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

function cleanNcfDisplay(ncf: string | null | undefined, fallback: string) {
  if (!ncf || ncf.startsWith("PENDING:")) return fallback;
  return ncf;
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
      ncf: i.ncf && !i.ncf.startsWith("PENDING:") ? i.ncf : "",
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
      notes: (o.notes || "")
        .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "[Comprobante adjunto]")
        .replace(/\[COMPROBANTE:[^\]]+\]/g, "[Comprobante adjunto]")
        .trim(),
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
  } else if (type === "dgii-607") {
    // Formato 607 DGII: Reporte mensual de ventas y operaciones + Notas de Crédito (B04)
    const [invoices, creditNotes] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: { in: ["ISSUED", "PARTIAL", "PAID"] } },
        include: { customer: true },
        orderBy: { issueDate: "desc" },
      }),
      prisma.creditNote.findMany({
        include: { customer: true, invoice: true },
        orderBy: { issueDate: "desc" },
      }),
    ]);

    const invoiceRows = invoices.map((i) => {
      const cleanTax = (i.customer.taxId || "").replace(/\D/g, "");
      const idType = cleanTax.length === 9 ? "1" : cleanTax.length === 11 ? "2" : "3";
      const y = i.issueDate.getFullYear();
      const m = String(i.issueDate.getMonth() + 1).padStart(2, "0");
      const d = String(i.issueDate.getDate()).padStart(2, "0");

      return {
        RNC_CEDULA: cleanTax,
        TIPO_IDENTIFICACION: idType,
        NUMERO_COMPROBANTE_FISCAL: cleanNcfDisplay(i.ncf, i.number),
        NCF_MODIFICADO: "",
        TIPO_INGRESO: "01",
        FECHA_COMPROBANTE: `${y}${m}${d}`,
        FECHA_RETENCION: "",
        MONTO_FACTURADO: i.subtotal,
        ITBIS_FACTURADO: i.tax,
        ITBIS_RETENIDO_POR_TERCEROS: 0,
        ITBIS_PERCIBIDO: 0,
        RETENCION_RENTA_POR_TERCEROS: 0,
        ISR_PERCIBIDO: 0,
        IMPUESTO_SELECTIVO_AL_CONSUMO: 0,
        OTROS_IMPUESTOS_TASAS: 0,
        MONTO_PROPINA_LEGAL: 0,
        TOTAL_FACTURADO: i.total,
        ESTADO: i.status,
      };
    });

    const creditNoteRows = creditNotes.map((cn) => {
      const cleanTax = (cn.customer.taxId || "").replace(/\D/g, "");
      const idType = cleanTax.length === 9 ? "1" : cleanTax.length === 11 ? "2" : "3";
      const y = cn.issueDate.getFullYear();
      const m = String(cn.issueDate.getMonth() + 1).padStart(2, "0");
      const d = String(cn.issueDate.getDate()).padStart(2, "0");
      const b04Match = cn.reason.match(/NCF:\s*([A-Z0-9]+)/i);
      const cnNcf = b04Match ? b04Match[1] : cn.number;

      return {
        RNC_CEDULA: cleanTax,
        TIPO_IDENTIFICACION: idType,
        NUMERO_COMPROBANTE_FISCAL: cnNcf,
        NCF_MODIFICADO: cleanNcfDisplay(cn.invoice.ncf, cn.invoice.number),
        TIPO_INGRESO: "01",
        FECHA_COMPROBANTE: `${y}${m}${d}`,
        FECHA_RETENCION: "",
        MONTO_FACTURADO: cn.subtotal,
        ITBIS_FACTURADO: cn.tax,
        ITBIS_RETENIDO_POR_TERCEROS: 0,
        ITBIS_PERCIBIDO: 0,
        RETENCION_RENTA_POR_TERCEROS: 0,
        ISR_PERCIBIDO: 0,
        IMPUESTO_SELECTIVO_AL_CONSUMO: 0,
        OTROS_IMPUESTOS_TASAS: 0,
        MONTO_PROPINA_LEGAL: 0,
        TOTAL_FACTURADO: cn.total,
        ESTADO: "CREDIT_NOTE",
      };
    });

    rows = [...invoiceRows, ...creditNoteRows];
  } else if (type === "dgii-606") {
    const data = await prisma.purchase.findMany({
      where: { status: "RECEIVED" },
      include: { supplier: true },
      orderBy: { orderedAt: "desc" },
    });
    rows = data.map((p) => {
      const cleanTax = (p.supplier.taxId || "").replace(/\D/g, "");
      const idType = cleanTax.length === 9 ? "1" : cleanTax.length === 11 ? "2" : "3";
      const refDate = p.receivedAt || p.orderedAt;
      const y = refDate.getFullYear();
      const m = String(refDate.getMonth() + 1).padStart(2, "0");
      const d = String(refDate.getDate()).padStart(2, "0");

      return {
        RNC_CEDULA: cleanTax,
        TIPO_IDENTIFICACION: idType,
        TIPO_BIENES_SERVICIOS_COMPRADOS: "09",
        NUMERO_COMPROBANTE_FISCAL: p.number,
        NCF_MODIFICADO: "",
        FECHA_COMPROBANTE: `${y}${m}${d}`,
        FECHA_PAGO: `${y}${m}${d}`,
        MONTO_FACTURADO_SERVICIOS: 0,
        MONTO_FACTURADO_BIENES: p.total,
        TOTAL_MONTO_FACTURADO: p.total,
        ITBIS_FACTURADO: 0,
        ITBIS_RETENIDO: 0,
        ITBIS_SUJETO_A_PROPORCIONALIDAD: 0,
        ITBIS_LLEVADO_AL_COSTO: 0,
        ITBIS_POR_ADELANTAR: 0,
        ITBIS_PERCIBIDO_EN_COMPRAS: 0,
        TIPO_RETENCION_ISR: "",
        MONTO_RETENCION_RENTA: 0,
        ISR_PERCIBIDO_EN_COMPRAS: 0,
        IMPUESTO_SELECTIVO_AL_CONSUMO: 0,
        OTROS_IMPUESTOS_TASAS: 0,
        MONTO_PROPINA_LEGAL: 0,
        FORMA_DE_PAGO: "01",
      };
    });
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
