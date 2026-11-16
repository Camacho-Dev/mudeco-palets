export type ProductOption = {
  id: string;
  sku: string | null;
  name: string;
  price: number;
  taxRate: number;
  category: string;
  stock: number;
};

export type CustomerOption = {
  id: string;
  name: string;
  taxId: string | null;
  creditLimit?: number | null;
};

export type CartLine = {
  key: string;
  productId: string;
  sku: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  stock: number;
};

export type InvoiceDraft = {
  id: string;
  name: string;
  customerId: string;
  cart: CartLine[];
  delivery: boolean;
  deliveryFee: string;
  applyTax: boolean;
};
