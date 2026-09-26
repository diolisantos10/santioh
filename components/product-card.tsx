import Image from 'next/image';
import Link from 'next/link';
import { badge, colorLabel, modelName, money } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [main, second] = product.images;
  const tag = badge(product);
  const min = product.priceRange.minVariantPrice;
  const compare = product.compareAtPriceRange.minVariantPrice;
  const onSale = Number(compare.amount) > Number(min.amount);
  const varies = product.priceRange.maxVariantPrice.amount !== min.amount;
  const colors = colorLabel(product);
  const name = modelName(product.title);

  return (
    <Link href={`/produto/${product.handle}`} className="card">
      <div className="card-ph">
        {main && <Image src={main.url} alt={main.altText || `Óculos ${name}`} fill sizes="(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw" priority={priority} />}
        {second && <Image className="alt" src={second.url} alt="" fill sizes="(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw" />}
        {tag && <span className={`tag label${tag === 'Esgotado' ? ' tag-sold' : ''}`}>{tag}</span>}
      </div>
      <div className="card-meta">
        <span className="product-name">{name}</span>
        {colors && <span className="small muted">{colors}</span>}
        <span className="price">
          {varies ? 'A partir de ' : ''}{money(min)}
          {onSale && <span className="strike">{money(compare)}</span>}
        </span>
      </div>
    </Link>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <div className="grid">
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < priorityCount} />)}
    </div>
  );
}

export function EmptyCatalog() {
  return (
    <div className="empty">
      <p className="title">Os novos modelos chegam em breve</p>
      <p className="muted small" style={{ maxWidth: '40ch', margin: 0 }}>Estamos preparando a coleção. Acompanhe os lançamentos no Instagram.</p>
      <a className="btn btn-secondary" href="https://www.instagram.com/santioh_/" target="_blank" rel="noreferrer">Seguir @santioh_</a>
    </div>
  );
}
