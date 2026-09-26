// Catálogo de exemplo só para desenvolvimento local (SHOPIFY_MOCK=1). Nunca ativo em produção.
import type { Product } from './types';

const img = (f: string) => ({ url: `/mock/${f}`, altText: null, width: 1080, height: 1350 });
const brl = (a: string) => ({ amount: a, currencyCode: 'BRL' });

function make(handle: string, title: string, price: string, tags: string[], files: string[], colors: string[]): Product {
  return {
    id: `gid://mock/${handle}`, handle, title, description: 'Armação em acetato com lentes de proteção UV400. Acompanha estojo e flanela.',
    descriptionHtml: '<p>Armação em acetato com lentes de proteção UV400.</p><p>Acompanha estojo e flanela.</p>',
    productType: 'Óculos de sol', tags, availableForSale: true, createdAt: '2026-09-01T00:00:00Z',
    priceRange: { minVariantPrice: brl(price), maxVariantPrice: brl(price) }, compareAtPriceRange: { minVariantPrice: brl('0') },
    featuredImage: img(files[0]), images: files.map(img), videos: [],
    options: [{ name: 'Cor', optionValues: colors.map((c) => ({ name: c, swatch: null })) }],
    variants: colors.map((c, i) => ({ id: `gid://mock/${handle}/${i}`, title: c, availableForSale: i !== 2, selectedOptions: [{ name: 'Cor', value: c }], price: brl(price), compareAtPrice: null, image: img(files[Math.min(i, files.length - 1)]) })),
    seo: { title: null, description: null },
  };
}

const ALL: Product[] = [
  make('monza', 'Óculos Monza', '189.90', ['Best Seller'], ['retangular-tartaruga-34.jpg', 'retangular-tartaruga-frente.jpg'], ['Animal print', 'Preto']),
  make('netuno', 'Óculos Netuno', '169.90', ['Lançamento'], ['redondo-lente-azul-34.jpg', 'redondo-lente-azul-frente.jpg'], ['Tartaruga', 'Preto', 'Cristal']),
  make('valerian', 'Óculos Valerian', '179.90', ['Lançamento'], ['hexagonal-marrom-34.jpg', 'hexagonal-marrom-frente.jpg'], ['Marrom', 'Cinza escuro']),
  make('fritz', 'Óculos Fritz', '159.90', ['Best Seller'], ['redondo-preto-34.jpg'], ['Preto']),
  make('cassino', 'Óculos Cassino', '149.90', [], ['visor-espelhado-34.jpg'], ['Espelhado']),
  make('silverstone', 'Óculos Silverstone', '189.90', ['Lançamento'], ['265197aa.jpg'], ['Cristal']),
  make('bex', 'Óculos Bex', '169.90', [], ['6f89d83c.jpg'], ['Cinza']),
  make('antuli', 'Óculos Antuli', '169.90', ['Best Seller'], ['bbbd4fac.jpg'], ['Cinza escuro']),
];

export async function mockProducts(opts: { first?: number; query?: string }) {
  let list = ALL;
  if (opts.query?.includes('tag:')) {
    const t = opts.query.split('tag:')[1].replace(/['"]/g, '').trim().toLowerCase();
    list = list.filter((p) => p.tags.some((x) => x.toLowerCase() === t));
  }
  return list.slice(0, opts.first ?? 48);
}
export async function mockProduct(handle: string) {
  return ALL.find((p) => p.handle === handle) ?? null;
}
