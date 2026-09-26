type LoaderArgs = { src: string; width: number; quality?: number };

// Imagens da Shopify são redimensionadas pelo próprio CDN deles; as locais são servidas como estão.
export default function shopifyLoader({ src, width }: LoaderArgs): string {
  if (src.includes('cdn.shopify.com')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    return url.toString();
  }
  return src;
}
