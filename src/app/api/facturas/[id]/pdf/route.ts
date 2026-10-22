import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  let authorized = Boolean(session?.user?.id);

  if (!authorized) {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    // Permitir descarga si el invoice pertenece a un pedido web o coincide con orderId
    const webOrder = await prisma.webOrder.findFirst({
      where: orderId ? { id: orderId, invoiceId: id } : { invoiceId: id },
    });
    if (webOrder) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  let company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  if (!company) {
    company = {
      id: "default",
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      taxId: null,
      address: null,
      phone: null,
      email: null,
    };
  }

  const pdf = await buildInvoicePdf(invoice, company);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}
