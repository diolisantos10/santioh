import Image from 'next/image';
import Link from 'next/link';
import { EmptyCatalog, ProductGrid } from '@/components/product-card';
import { Reels } from '@/components/reels';
import { ArrowIcon } from '@/components/icons';
import { hasTag, modelName, money } from '@/lib/format';
import { getProducts } from '@/lib/shopify';

export const revalidate = 60;

/** Mantém a grade sem buraco: múltiplos de 4 quando possível (4 colunas no desktop, 2 no celular). */
const fill = <T,>(list: T[]) => (list.length >= 4 ? list.slice(0, list.length - (list.length % 4)) : list.length > 1 ? list.slice(0, list.length - (list.length % 2)) : list);

export default async function Home() {
  const [all, top] = await Promise.all([
    getProducts({ first: 48, sortKey: 'CREATED_AT', reverse: true }).catch(() => []),
    getProducts({ first: 8, sortKey: 'BEST_SELLING', reverse: false }).catch(() => []),
  ]);

  const tagged = all.filter((p) => hasTag(p, 'Lançamento') || hasTag(p, 'lancamento'));
  const launches = fill((tagged.length ? tagged : all).slice(0, 8));
  const taggedBest = all.filter((p) => hasTag(p, 'Best Seller'));
  const best = (taggedBest.length ? taggedBest : top).filter((p) => !launches.slice(0, 4).some((l) => l.id === p.id)).slice(0, 8);
  const bestGrid = fill(best);
  const hero = launches.find((p) => p.images.length) ?? null;

  return (
    <>
      <section className="wrap hero">
        {hero ? (
          <>
            <Link href={`/produto/${hero.handle}`} className="hero-ph" aria-label={`Ver óculos ${modelName(hero.title)}`}>
              <Image src={hero.images[0].url} alt={hero.images[0].altText || `Óculos ${modelName(hero.title)}`} fill priority sizes="(min-width:900px) 58vw, 100vw" />
            </Link>
            <div className="hero-copy">
              <span className="label muted">Novos modelos</span>
              <h1 className="display">{modelName(hero.title)}</h1>
              <p className="muted" style={{ margin: 0 }}>{money(hero.priceRange.minVariantPrice)} · Frete grátis para todo o Brasil</p>
              <div className="hero-cta">
                <Link className="btn btn-primary" href={`/produto/${hero.handle}`}>Ver modelo</Link>
                <Link className="btn btn-secondary" href="/produtos">Todos os óculos</Link>
              </div>
            </div>
          </>
        ) : (
          <div className="hero-copy" style={{ paddingBlock: 48 }}>
            <span className="label muted">Santioh</span>
            <h1 className="display">Óculos de sol para a pista, a música e a arte.</h1>
          </div>
        )}
      </section>

      <section className="wrap section" aria-labelledby="lancamentos">
        <div className="section-head">
          <h2 id="lancamentos" className="title">Lançamentos</h2>
          {launches.length > 0 && <Link className="link-under" href="/produtos?filtro=lancamentos">Ver todos</Link>}
        </div>
        {launches.length ? <ProductGrid products={launches} priorityCount={2} /> : <EmptyCatalog />}
      </section>

      <section className="campaign" aria-labelledby="campanha">
        <div className="wrap campaign-inner">
          <div className="campaign-copy">
            <span className="label" style={{ color: '#a8a4a1' }}>Santioh</span>
            <h2 id="campanha" className="display">Feito para a pista.</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '40ch' }}>Armações com personalidade para festival, after e todo o resto.</p>
            <div><Link className="btn btn-light" href="/produtos">Ver a coleção <ArrowIcon size={16} /></Link></div>
          </div>
          <video src="/media/magnifico-laranja-aline.mp4" poster="/media/magnifico-laranja-aline.jpg" muted loop playsInline autoPlay preload="metadata" aria-label="Vídeo de campanha Santioh" />
        </div>
      </section>

      {bestGrid.length > 0 && (
        <section className="wrap section" aria-labelledby="best">
          <div className="section-head">
            <h2 id="best" className="title">Best Sellers</h2>
            <Link className="link-under" href="/produtos?filtro=best-sellers">Ver todos</Link>
          </div>
          <ProductGrid products={bestGrid} />
        </section>
      )}

      <section className="wrap section" aria-labelledby="rosto">
        <div className="section-head">
          <h2 id="rosto" className="title">No rosto</h2>
          <a className="link-under" href="https://www.instagram.com/santioh_/" target="_blank" rel="noreferrer">@santioh_</a>
        </div>
        <Reels products={all} />
      </section>
    </>
  );
}
