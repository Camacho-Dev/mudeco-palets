import { prisma } from "@/lib/prisma";
import { roundMoney, PAYMENT_METHOD_LABELS } from "@/lib/format";
import { buildDateRange, inRange, type DateRange } from "@/lib/date-range";

const SOLD_STATUSES = ["ISSUED", "PARTIAL", "PAID"] as const;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("es-DO", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export async function getBusinessAnalytics(range?: DateRange) {
  const period =
    range ||
    buildDateRange({
      kind: "month",
    });

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [invoices, payments, products, materials, customers, webOrders, ncfSeries] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: { in: [...SOLD_STATUSES] } },
      include: {
        items: { include: { product: true } },
        payments: true,
        creditNotes: true,
        customer: true,
      },
      orderBy: { issueDate: "asc" },
    }),
    prisma.payment.findMany({
      where: {
        invoice: { status: { in: [...SOLD_STATUSES] } },
      },
      orderBy: { paidAt: "asc" },
    }),
    prisma.product.findMany({ where: { active: true, kind: "FINISHED" } }),
    prisma.product.findMany({ where: { active: true, kind: "MATERIAL" } }),
    prisma.customer.count(),
    prisma.webOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        number: true,
        type: true,
        status: true,
        serviceKind: true,
        total: true,
        createdAt: true,
        customerName: true,
      },
    }),
    prisma.ncfSeries.findMany({ where: { active: true } }),
  ]);

  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ncfAlerts = ncfSeries
    .map((s) => {
      const remaining = Math.max(0, s.maxSeq - s.nextSeq + 1);
      const isLow = remaining <= 30;
      const isExpiringSoon = s.expiresAt ? s.expiresAt <= in30Days : false;
      const isExpired = s.expiresAt ? s.expiresAt < now : false;
      return {
        id: s.id,
        type: s.type,
        name: s.name,
        remaining,
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
        isLow,
        isExpiringSoon,
        isExpired,
      };
    })
    .filter((s) => s.isLow || s.isExpiringSoon || s.isExpired);

  const periodInvoices = invoices.filter((i) => inRange(i.issueDate, period));
  const periodPayments = payments.filter((p) => inRange(p.paidAt, period));

  const openInvoices = invoices.filter((i) =>
    ["ISSUED", "PARTIAL"].includes(i.status),
  );

  function netInvoiceTotal(inv: (typeof invoices)[number]) {
    const credited = (inv.creditNotes || []).reduce((a, c) => a + c.total, 0);
    return Math.max(0, inv.total - credited);
  }

  function netInvoiceTax(inv: (typeof invoices)[number]) {
    const creditedTax = (inv.creditNotes || []).reduce((a, c) => a + c.tax, 0);
    return Math.max(0, inv.tax - creditedTax);
  }

  const salesAll = roundMoney(invoices.reduce((s, i) => s + netInvoiceTotal(i), 0));
  const salesYear = roundMoney(
    invoices
      .filter((i) => i.issueDate >= startOfYear)
      .reduce((s, i) => s + netInvoiceTotal(i), 0),
  );
  const salesMonth = roundMoney(
    periodInvoices.reduce((s, i) => s + netInvoiceTotal(i), 0),
  );
  const taxAll = roundMoney(invoices.reduce((s, i) => s + netInvoiceTax(i), 0));
  const taxMonth = roundMoney(periodInvoices.reduce((s, i) => s + netInvoiceTax(i), 0));

  const collectedAll = roundMoney(payments.reduce((s, p) => s + p.amount, 0));
  const collectedMonth = roundMoney(
    periodPayments.reduce((s, p) => s + p.amount, 0),
  );
  const collectedYear = roundMoney(
    payments
      .filter((p) => p.paidAt >= startOfYear)
      .reduce((s, p) => s + p.amount, 0),
  );

  const receivables = roundMoney(
    openInvoices.reduce((s, i) => {
      const paid = i.payments.reduce((a, p) => a + p.amount, 0);
      const credited = (i.creditNotes || []).reduce((a, c) => a + c.total, 0);
      return s + Math.max(0, i.total - paid - credited);
    }, 0),
  );

  function invoiceCost(inv: (typeof invoices)[number]) {
    return inv.items.reduce((s, item) => {
      const cost = item.product?.cost ?? 0;
      return s + cost * item.quantity;
    }, 0);
  }

  const costAll = roundMoney(invoices.reduce((s, i) => s + invoiceCost(i), 0));
  const costMonth = roundMoney(
    periodInvoices.reduce((s, i) => s + invoiceCost(i), 0),
  );
  const marginAll = roundMoney(salesAll - taxAll - costAll);
  const marginMonth = roundMoney(salesMonth - taxMonth - costMonth);
  const marginPct =
    salesMonth - taxMonth > 0
      ? roundMoney(
          ((salesMonth - taxMonth - costMonth) / (salesMonth - taxMonth)) * 100,
        )
      : salesAll - taxAll > 0
        ? roundMoney(((salesAll - taxAll - costAll) / (salesAll - taxAll)) * 100)
        : 0;

  const inventoryValue = roundMoney(
    products.reduce((s, p) => s + p.stock * p.cost, 0),
  );
  const inventoryRetail = roundMoney(
    products.reduce((s, p) => s + p.stock * p.price, 0),
  );

  const invoiceCountMonth = periodInvoices.length;
  const avgTicket =
    invoiceCountMonth > 0 ? roundMoney(salesMonth / invoiceCountMonth) : 0;

  const lowStock = products.filter(
    (p) => p.sku !== "CUS-001" && p.stock <= p.minStock,
  );
  const lowStockMaterials = materials.filter(
    (m) => m.stock <= m.minStock,
  );

  const trendMap = new Map<
    string,
    { sales: number; collected: number; invoices: number }
  >();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    trendMap.set(monthKey(d), { sales: 0, collected: 0, invoices: 0 });
  }
  for (const inv of invoices) {
    if (inv.issueDate < sixMonthsAgo) continue;
    const key = monthKey(inv.issueDate);
    const row = trendMap.get(key);
    if (row) {
      row.sales += inv.total;
      row.invoices += 1;
    }
  }
  for (const pay of payments) {
    if (pay.paidAt < sixMonthsAgo) continue;
    const key = monthKey(pay.paidAt);
    const row = trendMap.get(key);
    if (row) row.collected += pay.amount;
  }

  const monthlyTrend = [...trendMap.entries()].map(([key, v]) => ({
    key,
    label: monthLabel(key),
    sales: roundMoney(v.sales),
    collected: roundMoney(v.collected),
    invoices: v.invoices,
  }));

  const productSales = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();
  for (const inv of periodInvoices) {
    for (const item of inv.items) {
      const name = item.product?.name || item.description;
      const id = item.productId || item.description;
      const cur = productSales.get(id) || { name, qty: 0, revenue: 0 };
      cur.qty += item.quantity;
      cur.revenue += item.lineTotal;
      productSales.set(id, cur);
    }
  }
  const topProducts = [...productSales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      revenue: roundMoney(p.revenue),
      qty: roundMoney(p.qty),
    }));

  const customerSales = new Map<
    string,
    { name: string; total: number; count: number }
  >();
  for (const inv of periodInvoices) {
    const cur = customerSales.get(inv.customerId) || {
      name: inv.customer.name,
      total: 0,
      count: 0,
    };
    cur.total += inv.total;
    cur.count += 1;
    customerSales.set(inv.customerId, cur);
  }
  const topCustomers = [...customerSales.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((c) => ({ ...c, total: roundMoney(c.total) }));

  const methodMap = new Map<string, number>();
  for (const p of periodPayments) {
    methodMap.set(p.method, (methodMap.get(p.method) || 0) + p.amount);
  }
  const paymentMethods = [...methodMap.entries()].map(([method, amount]) => ({
    method,
    label: PAYMENT_METHOD_LABELS[method] || method,
    amount: roundMoney(amount),
  }));

  const catMap = new Map<string, number>();
  for (const inv of periodInvoices) {
    for (const item of inv.items) {
      const cat = item.product?.category || "Otros";
      catMap.set(cat, (catMap.get(cat) || 0) + item.lineTotal);
    }
  }
  const categorySales = [...catMap.entries()]
    .map(([category, amount]) => ({
      category,
      amount: roundMoney(amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  const statusBreakdown = {
    issued: periodInvoices.filter((i) => i.status === "ISSUED").length,
    partial: periodInvoices.filter((i) => i.status === "PARTIAL").length,
    paid: periodInvoices.filter((i) => i.status === "PAID").length,
  };

  const nowDay = new Date();
  const aging = { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0, count: 0 };
  for (const inv of openInvoices) {
    const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
    const credited = (inv.creditNotes || []).reduce((a, c) => a + c.total, 0);
    const bal = inv.total - paid - credited;
    if (bal <= 0) continue;
    const base = inv.dueDate || inv.issueDate;
    const days = Math.floor(
      (nowDay.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
    );
    aging.count += 1;
    if (days <= 30) aging.d0_30 += bal;
    else if (days <= 60) aging.d31_60 += bal;
    else if (days <= 90) aging.d61_90 += bal;
    else aging.d90plus += bal;
  }
  aging.d0_30 = roundMoney(aging.d0_30);
  aging.d31_60 = roundMoney(aging.d31_60);
  aging.d61_90 = roundMoney(aging.d61_90);
  aging.d90plus = roundMoney(aging.d90plus);

  const recentInvoices = (
    await prisma.invoice.findMany({
      where:
        period.from && period.to
          ? { issueDate: { gte: period.from, lte: period.to } }
          : undefined,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: true },
    })
  ).map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    total: inv.total,
    issueDate: inv.issueDate.toISOString(),
    customer: { name: inv.customer.name },
  }));

  const webPending = webOrders.filter((o) =>
    ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"].includes(o.status),
  );
  const webRepairs = webOrders.filter((o) => o.serviceKind === "REPAIR").length;
  const webCustomQuotes = webOrders.filter(
    (o) => o.serviceKind === "CUSTOM_QUOTE",
  ).length;
  const webContacts = webOrders.filter((o) => o.serviceKind === "CONTACT").length;
  const webSales = webOrders.filter((o) => o.type === "SALE").length;
  const webQuotes = webOrders.filter((o) => o.type === "QUOTE").length;
  const webDone = webOrders.filter((o) =>
    ["DONE", "PAID"].includes(o.status),
  ).length;
  const webSalesVolume = roundMoney(
    webOrders
      .filter((o) => o.type === "SALE" || o.status === "PAID")
      .reduce((sum, o) => sum + o.total, 0),
  );
  const webConversionRate =
    webOrders.length > 0
      ? roundMoney((webDone / webOrders.length) * 100)
      : 0;

  return {
    company: await prisma.companySettings.findUnique({
      where: { id: "default" },
    }),
    period: {
      label: period.label,
      kind: period.kind,
      month: period.month || null,
      from: period.from?.toISOString() || null,
      to: period.to?.toISOString() || null,
    },
    kpis: {
      salesAll,
      salesYear,
      salesMonth,
      collectedAll,
      collectedYear,
      collectedMonth,
      receivables,
      taxAll,
      taxMonth,
      costAll,
      costMonth,
      marginAll,
      marginMonth,
      marginPct,
      inventoryValue,
      inventoryRetail,
      avgTicket,
      invoiceCountMonth,
      invoiceCountAll: invoices.length,
      customerCount: customers,
      productCount: products.length,
      openCount: openInvoices.length,
      lowStockCount: lowStock.length,
      lowStockNames: lowStock.slice(0, 4).map((p) => p.name),
      lowStockMaterialsCount: lowStockMaterials.length,
      lowStockMaterialsNames: lowStockMaterials.slice(0, 4).map((m) => m.name),
      ncfAlertsCount: ncfAlerts.length,
      ncfAlerts,
      webPendingCount: webPending.length,
      webRepairsCount: webRepairs,
      webCustomQuotesCount: webCustomQuotes,
      webContactsCount: webContacts,
      webSalesCount: webSales,
      webQuotesCount: webQuotes,
      webDoneCount: webDone,
      webSalesVolume,
      webConversionRate,
      webOrdersTotal: webOrders.length,
    },
    monthlyTrend,
    topProducts,
    topCustomers,
    paymentMethods,
    categorySales,
    statusBreakdown,
    aging,
    recentInvoices,
    recentWebOrders: webPending.slice(0, 6).map((o) => ({
      id: o.id,
      number: o.number,
      type: o.type,
      serviceKind: o.serviceKind,
      status: o.status,
      total: o.total,
      customerName: o.customerName,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export type BusinessAnalytics = Awaited<
  ReturnType<typeof getBusinessAnalytics>
>;
