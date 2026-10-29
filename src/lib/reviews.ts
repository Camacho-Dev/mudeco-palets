import { prisma } from "@/lib/prisma";

export type CustomerReviewData = {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  rating: number;
  comment: string;
  city?: string | null;
  productName?: string | null;
  orderNumber?: string | null;
  isVerified: boolean;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  officialReply?: string | null;
  officialReplyAt?: Date | null;
  status: string;
  createdAt: Date;
};

// In-memory cache con TTL de 20s para lecturas ultra-rápidas en la home
let reviewsCache: { data: CustomerReviewData[]; expires: number } | null = null;

export async function getApprovedReviews(limit = 12): Promise<CustomerReviewData[]> {
  const now = Date.now();
  if (reviewsCache && reviewsCache.expires > now) {
    return reviewsCache.data.slice(0, limit);
  }

  try {
    const reviews = await prisma.customerReview.findMany({
      where: { status: "APPROVED" },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        rating: true,
        comment: true,
        city: true,
        productName: true,
        orderNumber: true,
        isVerified: true,
        likes: true,
        dislikes: true,
        isPinned: true,
        officialReply: true,
        officialReplyAt: true,
        status: true,
        createdAt: true,
      },
    });

    reviewsCache = {
      data: reviews,
      expires: now + 20_000,
    };

    return reviews;
  } catch (err) {
    console.error("Error al obtener reseñas de clientes:", err);
    return [];
  }
}

export function invalidateReviewsCache() {
  reviewsCache = null;
}
