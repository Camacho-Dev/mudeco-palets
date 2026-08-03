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

function parseCustomer(fd: FormData): CheckoutCustomer {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  if (!name) throw new Error("Nombre requerido");
  if (!email || !email.includes("@")) throw new Error("Email válido requerido");
  return {
    name,
    email,
    phone: String(fd.get("phone") || "").trim() || undefined,
    taxId: String(fd.get("taxId") || "").trim() || undefined,
    address: String(fd.get("address") || "").trim() || undefined,
    notes: String(fd.get("notes") || "").trim() || undefined,
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

export async function submitWebCheckout(fd: FormData) {
  const mode = String(fd.get("mode") || "");
  const customer = parseCustomer(fd);
  const cart = parseCart(fd);
  const origin = String(fd.get("origin") || "");

  if (mode === "quote") {
    const { order } = await createWebQuote(customer, cart);
    revalidatePath("/pedidos-web");
    revalidatePath("/cotizaciones");
    redirect(`/pedido/${order.id}?ok=cotizacion`);
  }

  if (mode === "local") {
    const { order } = await createWebLocalSale(customer, cart);
    revalidatePath("/pedidos-web");
    revalidatePath("/facturas");
    revalidatePath("/pagos");
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
    const base =
      origin ||
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

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
