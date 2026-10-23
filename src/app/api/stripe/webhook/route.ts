import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { finalizeOnlinePaidOrder } from "@/lib/web-checkout";
import { sendInvoiceEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Firma inválida";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { webOrderId?: string; invoiceId?: string };
      client_reference_id?: string | null;
    };
    const webOrderId =
      session.metadata?.webOrderId || session.client_reference_id || "";
    if (webOrderId) {
      const order = await finalizeOnlinePaidOrder(webOrderId);
      if (order.invoiceId) {
        try {
          await sendInvoiceEmail(order.invoiceId);
        } catch (err) {
          console.error("Email factura falló:", err);
          await prisma.webOrder.update({
            where: { id: webOrderId },
            data: {
              notes: [
                order.notes,
                "Pago OK; el correo de factura no se pudo enviar (revisa SMTP).",
              ]
                .filter(Boolean)
                .join(" | "),
            },
          });
        }
      }
      revalidatePath("/pedidos-web");
      revalidatePath("/facturas");
      revalidatePath("/pagos");
      revalidatePath("/panel");
      revalidatePath("/");
      revalidatePath("/catalogo");
    }
  }

  return NextResponse.json({ received: true });
}
