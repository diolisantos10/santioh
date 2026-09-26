import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product-card';
import { ProductView } from '@/components/product-view';
import { modelName } from '@/lib/format';
import { getProduct, getProducts } from '@/lib/shopify';

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<{ variant?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle).catch(() => null);
  if (!p) return { title: 'Produto não encontrado' };
  const name = modelName(p.title);
  const description = p.seo.description || p.description.slice(0, 160) || `Óculos ${name} Santioh. Frete grátis para todo o Brasil.`;
  return {
    title: p.seo.title || `Óculos ${name}`,
    description,
    alternates: { canonical: `/produto/${p.handle}` },
    openGraph: { title: `Óculos ${name} · Santioh`, description, images: p.featuredImage ? [{ url: p.featuredImage.url }] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ handle }, { variant }] = await Promise.all([params, searchParams]);
  const product = await getProduct(handle).catch(() => null);
  if (!product) notFound();

  const others = (await getProducts({ first: 12 }).catch(() => [])).filter((p) => p.id !== product.id).slice(0, 4);
  const min = product.priceRange.minVariantPrice;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Santioh' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: min.currencyCode,
      lowPrice: min.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="wrap">
      <nav className="breadcrumb small" aria-label="Você está em">
        <Link href="/produtos">Óculos</Link><span className="muted">/</span><span>{modelName(product.title)}</span>
      </nav>
      <ProductView product={product} initialVariant={variant} />

      {product.videos.length > 0 && (
        <section className="section" aria-labelledby="no-rosto">
          <h2 id="no-rosto" className="title" style={{ marginBottom: 24 }}>No rosto</h2>
          <div className="reels">
            {product.videos.map((v, i) => {
              const src = v.sources.find((s) => s.mimeType === 'video/mp4') ?? v.sources[0];
              return (
                <div className="reel" key={i}>
                  <video src={src.url} poster={v.previewImage?.url} muted loop playsInline autoPlay preload="none" aria-label={`Vídeo do óculos ${modelName(product.title)} no rosto`} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section" aria-labelledby="mais">
          <div className="section-head"><h2 id="mais" className="title">Você também pode gostar</h2><Link className="link-under" href="/produtos">Ver todos</Link></div>
          <ProductGrid products={others} />
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}
