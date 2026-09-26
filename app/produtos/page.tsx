import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyCatalog, ProductGrid } from '@/components/product-card';
import { hasTag } from '@/lib/format';
import { getProducts } from '@/lib/shopify';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Óculos de sol', description: 'Todos os óculos de sol Santioh. Frete grátis para todo o Brasil.', alternates: { canonical: '/produtos' } };

const FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'lancamentos', label: 'Lançamentos' },
  { key: 'best-sellers', label: 'Best Sellers' },
];

export default async function Products({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { filtro = '' } = await searchParams;
  const all = await getProducts({ first: 100 }).catch(() => []);
  let list = all;
  if (filtro === 'lancamentos') {
    const t = all.filter((p) => hasTag(p, 'Lançamento') || hasTag(p, 'lancamento'));
    list = t.length ? t : all.slice(0, 12);
  } else if (filtro === 'best-sellers') {
    const t = all.filter((p) => hasTag(p, 'Best Seller'));
    list = t.length ? t : await getProducts({ first: 24, sortKey: 'BEST_SELLING', reverse: false }).catch(() => []);
  }
  const current = FILTERS.find((f) => f.key === filtro) ?? FILTERS[0];

  return (
    <div className="wrap">
      <div className="page-head">
        <h1 className="display">{current.key ? current.label : 'Óculos de sol'}</h1>
        {all.length > 0 && <p className="small muted" style={{ margin: 0 }}>{list.length} {list.length === 1 ? 'modelo' : 'modelos'}</p>}
      </div>
      {all.length > 0 && (
        <nav className="filters" aria-label="Filtrar">
          {FILTERS.map((f) => (
            <Link key={f.key} href={f.key ? `/produtos?filtro=${f.key}` : '/produtos'} aria-current={f.key === current.key ? 'page' : undefined}>{f.label}</Link>
          ))}
        </nav>
      )}
      {list.length ? <ProductGrid products={list} priorityCount={4} /> : <EmptyCatalog />}
    </div>
  );
}
