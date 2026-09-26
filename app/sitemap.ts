import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/shopify';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');
  const products = await getProducts({ first: 250 }).catch(() => []);
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/produto/${p.handle}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
