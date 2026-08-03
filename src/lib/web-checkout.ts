import { prisma } from "@/lib/prisma";
import { calcInvoiceTotals } from "@/lib/invoice-calc";
import {
  nextInvoiceNumber,
  nextQuoteNumber,
  nextWebOrderNumber,
} from "@/lib/invoice-number";
import { assertStockAvailable, deductStock } from "@/lib/stock";
import { roundMoney } from "@/lib/format";

export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
};

async function webSalesUserId() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) throw new Error("No hay administrador para registrar pedidos web");
  return admin.id;
}

async function upsertWebCustomer(data: CheckoutCustomer) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.customer.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || existing.phone,
        taxId: data.taxId?.trim() || existing.taxId,
        address: data.address?.trim() || existing.address,
      },
    });
  }
  return prisma.customer.create({
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      taxId: data.taxId?.trim() || null,
      address: data.address?.trim() || null,
    },
  });
}

async function resolveLines(cart: CartLineInput[]) {
  if (!cart.length) throw new Error("El carrito está vacío");
  const lines = [];
  for (const row of cart) {
    const qty = Number(row.quantity);
    if (!row.productId || !(qty > 0)) continue;
    const product = await prisma.product.findFirst({
      where: { id: row.productId, active: true, kind: "FINISHED" },
    });
    if (!product) throw new Error("Hay un producto no disponible");
    lines.push({
      productId: product.id,
      description: product.name,
      quantity: qty,
      unitPrice: product.price,
      taxRate: product.taxRate,
      lineTotal: roundMoney(qty * product.price),
    });
  }
  if (!lines.length) throw new Error("El carrito está vacío");
  return lines;
}

export async function createWebQuote(
  customerData: CheckoutCustomer,
  cart: CartLineInput[],
) {
  const lines = await resolveLines(cart);
  const totals = calcInvoiceTotals(lines, { applyTax: true });
  const customer = await upsertWebCustomer(customerData);
  const userId = await webSalesUserId();
  const [quoteNumber, webNumber] = await Promise.all([
    nextQuoteNumber(),
    nextWebOrderNumber(),
  ]);

  const quote = await prisma.quote.create({
    data: {
      number: quoteNumber,
      status: "DRAFT",
      source: "WEB",
      notes: customerData.notes || "Cotización solicitada desde la web",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      userId,
      items: { create: lines },
    },
  });

  const order = await prisma.webOrder.create({
    data: {
      number: webNumber,
      type: "QUOTE",
      paymentMode: null,
      status: "QUOTED",
      customerName: customerData.name.trim(),
      customerEmail: customerData.email.trim().toLowerCase(),
      customerPhone: customerData.phone?.trim() || null,
      customerTaxId: customerData.taxId?.trim() || null,
      customerAddress: customerData.address?.trim() || null,
      notes: customerData.notes || null,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      quoteId: quote.id,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  return { order, quote, customer };
}

/** Compra con pago en local: factura emitida pendiente de cobro */
export async function createWebLocalSale(
  customerData: CheckoutCustomer,
  cart: CartLineInput[],
) {
  const lines = await resolveLines(cart);
  await assertStockAvailable(lines);
  const totals = calcInvoiceTotals(lines, { applyTax: true });
  const customer = await upsertWebCustomer(customerData);
  const userId = await webSalesUserId();
  const [invoiceNumber, webNumber] = await Promise.all([
    nextInvoiceNumber(),
    nextWebOrderNumber(),
  ]);

  const invoice = await prisma.invoice.create({
    data: {
      number: invoiceNumber,
      status: "ISSUED",
      source: "WEB",
      notes:
        customerData.notes ||
        "Pedido web — el cliente pagará en el local",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      userId,
      items: { create: lines },
    },
  });

  await deductStock(
    lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
    })),
    { refType: "INVOICE", refId: invoice.id },
  );

  const order = await prisma.webOrder.create({
    data: {
      number: webNumber,
      type: "SALE",
      paymentMode: "LOCAL",
      status: "PENDING",
      customerName: customerData.name.trim(),
      customerEmail: customerData.email.trim().toLowerCase(),
      customerPhone: customerData.phone?.trim() || null,
      customerTaxId: customerData.taxId?.trim() || null,
      customerAddress: customerData.address?.trim() || null,
      notes: customerData.notes || null,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      invoiceId: invoice.id,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  return { order, invoice, customer };
}

/** Prepara venta online: factura borrador + pedido esperando pago Stripe */
export async function createWebOnlineSalePending(
  customerData: CheckoutCustomer,
  cart: CartLineInput[],
) {
  const lines = await resolveLines(cart);
  await assertStockAvailable(lines);
  const totals = calcInvoiceTotals(lines, { applyTax: true });
  const customer = await upsertWebCustomer(customerData);
  const userId = await webSalesUserId();
  const [invoiceNumber, webNumber] = await Promise.all([
    nextInvoiceNumber(),
    nextWebOrderNumber(),
  ]);

  const invoice = await prisma.invoice.create({
    data: {
      number: invoiceNumber,
      status: "DRAFT",
      source: "WEB",
      notes: customerData.notes || "Pedido web — pago online pendiente",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      userId,
      items: { create: lines },
    },
  });

  const order = await prisma.webOrder.create({
    data: {
      number: webNumber,
      type: "SALE",
      paymentMode: "ONLINE",
      status: "AWAITING_PAYMENT",
      customerName: customerData.name.trim(),
      customerEmail: customerData.email.trim().toLowerCase(),
      customerPhone: customerData.phone?.trim() || null,
      customerTaxId: customerData.taxId?.trim() || null,
      customerAddress: customerData.address?.trim() || null,
      notes: customerData.notes || null,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId: customer.id,
      invoiceId: invoice.id,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  return { order, invoice, customer, lines, totals };
}

export async function finalizeOnlinePaidOrder(webOrderId: string) {
  const order = await prisma.webOrder.findUnique({
    where: { id: webOrderId },
    include: { invoice: { include: { items: true } } },
  });
  if (!order?.invoice) throw new Error("Pedido no encontrado");
  if (order.status === "PAID") return order;

  const inv = order.invoice;
  if (inv.status === "DRAFT") {
    await assertStockAvailable(inv.items);
    await prisma.invoice.update({
      where: { id: inv.id },
      data: { status: "ISSUED" },
    });
    await deductStock(
      inv.items.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
      { refType: "INVOICE", refId: inv.id },
    );
  }

  const existingPay = await prisma.payment.findFirst({
    where: { invoiceId: inv.id, method: "CARD" },
  });
  if (!existingPay) {
    await prisma.payment.create({
      data: {
        invoiceId: inv.id,
        amount: inv.total,
        method: "CARD",
        notes: "Pago online (Stripe)",
      },
    });
  }

  await prisma.invoice.update({
    where: { id: inv.id },
    data: { status: "PAID" },
  });

  return prisma.webOrder.update({
    where: { id: order.id },
    data: { status: "PAID" },
    include: { invoice: { include: { customer: true, items: true } } },
  });
}
