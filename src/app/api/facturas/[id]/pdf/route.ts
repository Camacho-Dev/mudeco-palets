import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
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
