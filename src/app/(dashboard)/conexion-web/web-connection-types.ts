export interface WebConnectionViewProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    salesOrders: number;
    totalSalesVolume: number;
    totalProducts: number;
    activeProducts: number;
    outOfStockCount: number;
    missingPhotosCount: number;
  };
  company: {
    name: string;
    phone: string | null;
    email: string | null;
    heroTitle: string | null;
    heroImage: string | null;
  } | null;
  stripeStatus: {
    configured: boolean;
    hasWebhookSecret: boolean;
    environment: string;
    webhookUrl: string;
  };
  recentOrders: Array<{
    id: string;
    number: string;
    type: string;
    serviceKind: string | null;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    total: number;
    createdAt: Date;
    invoice: { id: string; number: string } | null;
    quote: { id: string; number: string } | null;
  }>;
  recentAudits: Array<{
    id: string;
    action: string;
    summary: string;
    userName: string | null;
    createdAt: Date;
  }>;
}

export type WebConnectionStats = WebConnectionViewProps["stats"];
export type WebConnectionCompany = WebConnectionViewProps["company"];
export type WebStripeStatus = WebConnectionViewProps["stripeStatus"];
export type WebRecentOrder = WebConnectionViewProps["recentOrders"][number];
export type WebRecentAudit = WebConnectionViewProps["recentAudits"][number];
