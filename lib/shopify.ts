import 'server-only';
import type { Cart, Image, Policy, Product, Video } from './types';

const domain = process.env.SHOPIFY_STORE_DOMAIN ?? '';
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ?? '';
const version = process.env.SHOPIFY_API_VERSION ?? '2026-07';
const endpoint = `https://${domain}/api/${version}/graphql.json`;
export const MOCK = process.env.SHOPIFY_MOCK === '1';

type FetchOpts = { revalidate?: number | false; noStore?: boolean };

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, opts: FetchOpts = {}): Promise<T> {
  if (!domain || !token) throw new Error('Shopify não configurada: defina SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_PUBLIC_TOKEN.');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
    ...(opts.noStore ? { cache: 'no-store' as const } : { next: { revalidate: opts.revalidate ?? 60, tags: ['shopify'] } }),
  });
  if (!res.ok) throw new Error(`Shopify respondeu ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data as T;
}

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id handle title description descriptionHtml productType tags availableForSale createdAt
    priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    featuredImage { url altText width height }
    images(first: 12) { nodes { url altText width height } }
    media(first: 12) { nodes { mediaContentType ... on Video { sources { url mimeType } previewImage { url } } } }
    options { name optionValues { name swatch { color image { previewImage { url } } } } }
    variants(first: 60) { nodes {
      id title availableForSale
      selectedOptions { name value }
      price { amount currencyCode } compareAtPrice { amount currencyCode }
      image { url altText width height }
    } }
    seo { title description }
  }
`;

type RawProduct = Omit<Product, 'images' | 'variants' | 'videos'> & {
  images: { nodes: Image[] };
  media: { nodes: ({ mediaContentType: string } & Partial<Video>)[] };
  variants: { nodes: Product['variants'] };
};

function normalize(p: RawProduct): Product {
  const { media, images, variants, ...rest } = p;
  return {
    ...rest,
    images: images.nodes,
    variants: variants.nodes,
    videos: media.nodes
      .filter((m) => m.mediaContentType === 'VIDEO' && m.sources?.length)
      .map((m) => ({ sources: m.sources!, previewImage: m.previewImage ?? null })),
  };
}

export type SortKey = 'CREATED_AT' | 'BEST_SELLING' | 'TITLE' | 'PRICE' | 'RELEVANCE';

export async function getProducts(opts: { first?: number; sortKey?: SortKey; reverse?: boolean; query?: string } = {}): Promise<Product[]> {
  if (MOCK) return (await import('./mock')).mockProducts(opts);
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>(
    `${PRODUCT_FIELDS}
    query Products($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) { nodes { ...ProductFields } }
    }`,
    { first: opts.first ?? 48, sortKey: opts.sortKey ?? 'CREATED_AT', reverse: opts.reverse ?? true, query: opts.query ?? null },
  );
  return data.products.nodes.map(normalize);
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (MOCK) return (await import('./mock')).mockProduct(handle);
  const data = await shopifyFetch<{ product: RawProduct | null }>(
    `${PRODUCT_FIELDS}
    query Product($handle: String!) { product(handle: $handle) { ...ProductFields } }`,
    { handle },
  );
  return data.product ? normalize(data.product) : null;
}

export async function getPolicies(): Promise<Policy[]> {
  if (MOCK) return [];
  const data = await shopifyFetch<{ shop: Record<string, Policy | null> }>(
    `query Policies { shop {
      privacyPolicy { handle title body } refundPolicy { handle title body }
      shippingPolicy { handle title body } termsOfService { handle title body }
    } }`,
    {},
    { revalidate: 3600 },
  );
  return Object.values(data.shop).filter((p): p is Policy => Boolean(p?.body));
}

/* ---------------- Carrinho ---------------- */

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) { nodes {
      id quantity
      cost { totalAmount { amount currencyCode } }
      merchandise { ... on ProductVariant {
        id title selectedOptions { name value }
        image { url altText width height }
        product { handle title }
      } }
    } }
  }
`;

type RawCart = Omit<Cart, 'lines'> & { lines: { nodes: Cart['lines'] } };
const normCart = (c: RawCart | null): Cart | null => (c ? { ...c, lines: c.lines.nodes } : null);
type UserErrors = { userErrors: { message: string }[] };

function assertOk(r: UserErrors) {
  if (r.userErrors?.length) throw new Error(r.userErrors.map((e) => e.message).join('; '));
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const d = await shopifyFetch<{ cart: RawCart | null }>(`${CART_FIELDS} query Cart($id: ID!) { cart(id: $id) { ...CartFields } }`, { id: cartId }, { noStore: true });
  return normCart(d.cart);
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const d = await shopifyFetch<{ cartCreate: { cart: RawCart } & UserErrors }>(
    `${CART_FIELDS} mutation Create($input: CartInput!) { cartCreate(input: $input) { cart { ...CartFields } userErrors { message } } }`,
    { input: { lines, buyerIdentity: { countryCode: 'BR' } } },
    { noStore: true },
  );
  assertOk(d.cartCreate);
  return normCart(d.cartCreate.cart)!;
}

export async function addLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const d = await shopifyFetch<{ cartLinesAdd: { cart: RawCart } & UserErrors }>(
    `${CART_FIELDS} mutation Add($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ...CartFields } userErrors { message } } }`,
    { id: cartId, lines },
    { noStore: true },
  );
  assertOk(d.cartLinesAdd);
  return normCart(d.cartLinesAdd.cart)!;
}

export async function updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const d = await shopifyFetch<{ cartLinesUpdate: { cart: RawCart } & UserErrors }>(
    `${CART_FIELDS} mutation Upd($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ...CartFields } userErrors { message } } }`,
    { id: cartId, lines },
    { noStore: true },
  );
  assertOk(d.cartLinesUpdate);
  return normCart(d.cartLinesUpdate.cart)!;
}

export async function removeLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const d = await shopifyFetch<{ cartLinesRemove: { cart: RawCart } & UserErrors }>(
    `${CART_FIELDS} mutation Rm($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ...CartFields } userErrors { message } } }`,
    { id: cartId, ids: lineIds },
    { noStore: true },
  );
  assertOk(d.cartLinesRemove);
  return normCart(d.cartLinesRemove.cart)!;
}
