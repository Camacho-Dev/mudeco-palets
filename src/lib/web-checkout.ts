import { prisma } from "@/lib/prisma";
import { calcInvoiceTotals } from "@/lib/invoice-calc";
import {
  nextInvoiceNumber,
  nextQuoteNumber,
  nextWebOrderNumber,
} from "@/lib/invoice-number";
import { deductStock } from "@/lib/stock";
import { roundMoney } from "@/lib/format";
import { serviceKindFromRequest } from "@/lib/web-order-labels";
import { notifyStaffNewWebOrder } from "@/lib/mail";


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
  if (cart.length > 50) {
    throw new Error("El carrito supera el límite máximo de 50 artículos distintos");
  }

  const sanitized: { productId: string; qty: number }[] = [];
  for (const row of cart) {
    const rawQty = Number(row.quantity);
    if (!row.productId || !Number.isFinite(rawQty) || rawQty < 1) continue;
    const qty = Math.min(100, Math.floor(rawQty));
    sanitized.push({ productId: String(row.productId).trim(), qty });
  }
  if (!sanitized.length) throw new Error("El carrito está vacío");

  const uniqueIds = Array.from(new Set(sanitized.map((r) => r.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, active: true, kind: "FINISHED" },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  for (const row of sanitized) {
    const product = byId.get(row.productId);
    if (!product) throw new Error("Hay un producto no disponible");
    lines.push({
      productId: product.id,
      description: product.name,
      quantity: row.qty,
      unitPrice: product.price,
      taxRate: product.taxRate,
      lineTotal: roundMoney(row.qty * product.price),
    });
  }
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

  await notifyStaffNewWebOrder(order.id).catch(() => undefined);
  return { order, quote, customer };
}

export type ServiceRequestKind = "quote" | "contact";

/** Cotización sin carrito: proyecto a medida o consulta */
export async function createWebServiceRequest(
  customerData: CheckoutCustomer,
  kind: ServiceRequestKind,
  detail: {
    piece?: string;
    description: string;
    photoNote?: string;
  },
) {
  const description = detail.description.trim();
  if (!description) throw new Error("Describe el trabajo que necesitas");

  const label = kind === "contact" ? "Consulta" : "Cotización a medida";
  const piece = detail.piece?.trim();
  const lineDesc = piece
    ? `${label}: ${piece}`
    : `${label} solicitada desde la web`;
  const notes = [
    `[${label.toUpperCase()}]`,
    piece ? `Pieza/mueble: ${piece}` : null,
    description,
    detail.photoNote || null,
    customerData.notes?.trim() || null,
  ]
    .filter(Boolean)
    .join("\n");

  const line = {
    productId: null as string | null,
    description: lineDesc,
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    lineTotal: 0,
  };

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
      notes,
      subtotal: 0,
      tax: 0,
      total: 0,
      customerId: customer.id,
      userId,
      items: {
        create: [
          {
            productId: null,
            description: lineDesc,
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            lineTotal: 0,
          },
        ],
      },
    },
  });

  const order = await prisma.webOrder.create({
    data: {
      number: webNumber,
      type: "QUOTE",
      paymentMode: null,
      status: "QUOTED",
      serviceKind: serviceKindFromRequest(kind),
      customerName: customerData.name.trim(),
      customerEmail: customerData.email.trim().toLowerCase(),
      customerPhone: customerData.phone?.trim() || null,
      customerTaxId: customerData.taxId?.trim() || null,
      customerAddress: customerData.address?.trim() || null,
      notes,
      subtotal: 0,
      tax: 0,
      total: 0,
      customerId: customer.id,
      quoteId: quote.id,
      items: {
        create: [
          {
            productId: null,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            lineTotal: line.lineTotal,
          },
        ],
      },
    },
  });

  await notifyStaffNewWebOrder(order.id).catch(() => undefined);
  return { order, quote, customer };
}

/** Compra con pago en local o por transferencia bancaria: factura emitida pendiente de cobro */
export async function createWebLocalSale(
  customerData: CheckoutCustomer,
  cart: CartLineInput[],
  options?: { paymentMode?: "LOCAL" | "TRANSFER" },
) {
  const mode = options?.paymentMode ?? "LOCAL";
  const isTransfer = mode === "TRANSFER";
  const lines = await resolveLines(cart);
  const totals = calcInvoiceTotals(lines, { applyTax: true });
  const customer = await upsertWebCustomer(customerData);
  const userId = await webSalesUserId();
  const [invoiceNumber, webNumber] = await Promise.all([
    nextInvoiceNumber(),
    nextWebOrderNumber(),
  ]);

  // Factura + WebOrder en transacción atómica
  const { invoice, order } = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        number: invoiceNumber,
        status: "ISSUED",
        source: "WEB",
        notes:
          customerData.notes ||
          (isTransfer
            ? "Pedido web — pago por transferencia bancaria"
            : "Pedido web — el cliente pagará en el local"),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        customerId: customer.id,
        userId,
        items: { create: lines },
      },
    });

    const wo = await tx.webOrder.create({
      data: {
        number: webNumber,
        type: "SALE",
        paymentMode: mode,
        status: isTransfer ? "AWAITING_PAYMENT" : "PENDING",
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
        invoiceId: inv.id,
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

    return { invoice: inv, order: wo };
  });

  // Descuenta stock físico disponible (permite muebles bajo pedido con stock 0)
  await deductStock(
    lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
    })),
    { refType: "Invoice", refId: invoice.id },
    { allowBackorder: true },
  );

  await notifyStaffNewWebOrder(order.id).catch(() => undefined);
  return { order, invoice, customer };
}

/** Prepara venta online: factura borrador + pedido esperando pago Stripe */
export async function createWebOnlineSalePending(
  customerData: CheckoutCustomer,
  cart: CartLineInput[],
) {
  const lines = await resolveLines(cart);
  const totals = calcInvoiceTotals(lines, { applyTax: true });
  const customer = await upsertWebCustomer(customerData);
  const userId = await webSalesUserId();
  const [invoiceNumber, webNumber] = await Promise.all([
    nextInvoiceNumber(),
    nextWebOrderNumber(),
  ]);

  // Factura + WebOrder en transacción atómica
  const { invoice, order } = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
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

    const wo = await tx.webOrder.create({
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
        invoiceId: inv.id,
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

    return { invoice: inv, order: wo };
  });

  await notifyStaffNewWebOrder(order.id).catch(() => undefined);
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

  // Pago + status updates en transacción atómica
  const result = await prisma.$transaction(async (tx) => {
    if (inv.status === "DRAFT") {
      await tx.invoice.update({
        where: { id: inv.id },
        data: { status: "ISSUED" },
      });
    }

    const existingPay = await tx.payment.findFirst({
      where: { invoiceId: inv.id, method: "CARD" },
    });
    if (!existingPay) {
      await tx.payment.create({
        data: {
          invoiceId: inv.id,
          amount: inv.total,
          method: "CARD",
          notes: "Pago online (Stripe)",
        },
      });
    }

    await tx.invoice.update({
      where: { id: inv.id },
      data: { status: "PAID" },
    });

    return tx.webOrder.update({
      where: { id: order.id },
      data: { status: "PAID" },
      include: { invoice: { include: { customer: true, items: true } } },
    });
  });

  // Stock atómico fuera de la transacción DB (permite muebles bajo pedido con stock 0)
  if (inv.status === "DRAFT") {
    await deductStock(
      inv.items.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
      { refType: "Invoice", refId: inv.id },
      { allowBackorder: true },
    );
  }

  return result;
}
