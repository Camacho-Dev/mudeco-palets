export interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  description: string | null;
}

export interface WebMediaData {
  heroImage: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  workshopImage: string;
  craftImage: string;
  promoMesaImage: string;
  promoTvImage: string;
  galleryImages: string[];
}

export type FileUploadHandler = (file: File, onDone: (url: string) => void) => Promise<void>;
