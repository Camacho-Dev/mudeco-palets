"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createWebLocalSale,
  createWebOnlineSalePending,
  createWebQuote,
  type CartLineInput,
  type CheckoutCustomer,
} from "@/lib/web-checkout";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/store-info";
import { checkDualRateLimit } from "@/lib/rate-limit";

function parseCustomer(fd: FormData): CheckoutCustomer {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const fulfillment = String(fd.get("fulfillment") || "pickup");
  const address = String(fd.get("address") || "").trim();
  if (!name) throw new Error("Nombre requerido");
  if (!email || !email.includes("@")) throw new Error("Email válido requerido");
  if (!phone) throw new Error("Teléfono requerido");
  if (fulfillment === "delivery" && !address) {
    throw new Error("Dirección de entrega requerida");
  }
  const fulfillmentLabel =
    fulfillment === "delivery" ? "Entrega a domicilio" : "Retiro en taller";
  const extraNotes = String(fd.get("notes") || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/gi, "")
    .replace(/\[COMPROBANTE:[^\]]+\]/gi, "")
    .trim()
    .slice(0, 1500);
  const notes = [`[${fulfillmentLabel}]`, extraNotes || null]
    .filter(Boolean)
    .join("\n");
  return {
    name,
    email,
    phone,
    taxId: String(fd.get("taxId") || "").trim() || undefined,
    address: address || undefined,
    notes,
  };
}

function parseCart(fd: FormData): CartLineInput[] {
  const raw = String(fd.get("cartJson") || "[]");
  const parsed = JSON.parse(raw) as CartLineInput[];
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error("El carrito está vacío");
  }
  return parsed.map((l) => ({
    productId: String(l.productId),
    quantity: Number(l.quantity),
  }));
}

import { auth } from "@/lib/auth";

export async function submitWebCheckout(fd: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const mode = String(fd.get("mode") || "");
  const customer = parseCustomer(fd);

  // Rate limiting dual (por IP y por correo) para prevenir spam de pedidos y agotamiento de recursos
  const rl = await checkDualRateLimit({
    scope: "checkout",
    identifier: customer.email,
    ipLimit: 12,
    idLimit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    throw new Error(
      "Has realizado demasiados intentos de pedido en poco tiempo. Por favor espera unos minutos antes de intentar de nuevo.",
    );
  }

  const cart = parseCart(fd);

  if (mode === "quote") {
    const { order } = await createWebQuote(customer, cart);
    revalidatePath("/pedidos-web");
    revalidatePath("/cotizaciones");
    revalidatePath("/clientes");
    revalidatePath("/panel");
    redirect(`/pedido/${order.id}?ok=cotizacion`);
  }

  if (mode === "transfer") {
    const { order } = await createWebLocalSale(
      {
        ...customer,
        notes: `[Pago: Transferencia bancaria]\n${customer.notes || ""}`.trim(),
      },
      cart,
      { paymentMode: "TRANSFER" },
    );
    revalidatePath("/pedidos-web");
    revalidatePath("/facturas");
    revalidatePath("/pagos");
    revalidatePath("/clientes");
    revalidatePath("/panel");
    redirect(`/pedido/${order.id}?ok=transferencia`);
  }

  if (mode === "local") {
    const { order } = await createWebLocalSale(customer, cart);
    revalidatePath("/pedidos-web");
    revalidatePath("/facturas");
    revalidatePath("/pagos");
    revalidatePath("/clientes");
    revalidatePath("/panel");
    redirect(`/pedido/${order.id}?ok=local`);
  }

  if (mode === "online") {
    if (!isStripeConfigured()) {
      throw new Error(
        "El pago online no está configurado aún. Elige pagar en el local o solicita cotización.",
      );
    }
    const { order, invoice, totals } = await createWebOnlineSalePending(
      customer,
      cart,
    );
    const stripe = getStripe();
    const base = siteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      client_reference_id: order.id,
      metadata: {
        webOrderId: order.id,
        invoiceId: invoice.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "dop",
            unit_amount: Math.round(totals.total * 100),
            product_data: {
              name: `Pedido ${order.number}`,
              description: `Factura ${invoice.number}`,
            },
          },
        },
      ],
      success_url: `${base}/pedido/${order.id}?ok=online`,
      cancel_url: `${base}/checkout?cancel=1`,
    });

    await prisma.webOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) throw new Error("No se pudo iniciar Stripe Checkout");
    redirect(session.url);
  }

  throw new Error("Modo de checkout inválido");
}
