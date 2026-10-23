import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildQuotePdf } from "@/lib/pdf/quote-pdf";
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
    const orderId = (url.searchParams.get("orderId") || "").trim();
    // Solo permitir descarga sin sesión si se provee explícitamente el orderId correcto
    if (orderId) {
      const webOrder = await prisma.webOrder.findFirst({
        where: { id: orderId, quoteId: id },
      });
      if (webOrder) {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!quote) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const company = (await prisma.companySettings.findUnique({
    where: { id: "default" },
  })) ?? {
    id: "default",
    name: "Mudeco Palets",
    slogan: "Muebles a la medida",
    taxId: null,
    address: null,
    phone: null,
    email: null,
    heroImage: null,
    heroBadge: null,
    heroTitle: null,
    heroSubtitle: null,
    workshopImage: null,
    craftImage: null,
    promoMesaImage: null,
    promoTvImage: null,
    galleryImages: null,
    beforeAfterJson: null,
  };

  const pdf = await buildQuotePdf(quote, company);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.number}.pdf"`,
    },
  });
}
