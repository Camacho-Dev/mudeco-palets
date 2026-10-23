import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { WebConnectionView } from "./web-connection-view";
import { checkStripeStatus } from "./actions";
import Link from "next/link";
import { ExternalLink, Globe, Image as ImageIcon, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Conexión Web · Mudeco Palets",
};

export default async function ConexionWebPage() {
  await requireAdmin();

  // 1. Datos de empresa y tienda
  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  // 2. Métricas de pedidos web
  const [
    totalOrders,
    pendingOrders,
    salesOrders,
    paidSales,
    products,
    recentOrders,
    recentAudits,
    stripeStatus,
  ] = await Promise.all([
    prisma.webOrder.count(),
    prisma.webOrder.count({
      where: {
        status: { in: ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"] },
      },
    }),
    prisma.webOrder.count({
      where: { type: "SALE" },
    }),
    prisma.webOrder.findMany({
      where: {
        type: "SALE",
        status: { in: ["PAID", "DONE"] },
      },
      select: { total: true },
    }),
    prisma.product.findMany({
      select: { id: true, active: true, stock: true, imageUrl: true },
    }),
    prisma.webOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        invoice: { select: { id: true, number: true } },
        quote: { select: { id: true, number: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        entity: { in: ["WebOrder", "WebMedia", "WebStore", "Quote"] },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        action: true,
        summary: true,
        userName: true,
        createdAt: true,
      },
    }),
    checkStripeStatus(),
  ]);

  const totalSalesVolume = paidSales.reduce((acc, curr) => acc + curr.total, 0);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const outOfStockCount = products.filter((p) => p.active && p.stock <= 0).length;
  const missingPhotosCount = products.filter(
    (p) => !p.imageUrl || p.imageUrl.trim() === ""
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Conexión Web"
        description="Panel de sincronización en vivo entre la tienda pública (e-commerce), pasarela de pagos, catálogo y el ERP"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Abrir tienda pública en una nueva pestaña"
            >
              <Globe className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Tienda pública</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <Link
              href="/contenido-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Fotos & Portadas</span>
            </Link>
            <Link
              href="/pedidos-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Bandeja de pedidos</span>
            </Link>
          </div>
        }
      />

      <WebConnectionView
        stats={{
          totalOrders,
          pendingOrders,
          salesOrders,
          totalSalesVolume,
          totalProducts,
          activeProducts,
          outOfStockCount,
          missingPhotosCount,
        }}
        company={company}
        stripeStatus={stripeStatus}
        recentOrders={recentOrders}
        recentAudits={recentAudits}
      />
    </div>
  );
}
