export type Money = { amount: string; currencyCode: string };

export type Image = { url: string; altText: string | null; width: number | null; height: number | null };

export type Video = { sources: { url: string; mimeType: string }[]; previewImage: { url: string } | null };

export type OptionValue = {
  name: string;
  swatch: { color: string | null; image: { previewImage: { url: string } | null } | null } | null;
};

export type ProductOption = { name: string; optionValues: OptionValue[] };

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  featuredImage: Image | null;
  images: Image[];
  videos: Video[];
  options: ProductOption[];
  variants: Variant[];
  seo: { title: string | null; description: string | null };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    image: Image | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: CartLine[];
};

export type Policy = { handle: string; title: string; body: string };
