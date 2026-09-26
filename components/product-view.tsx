'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { COLOR_OPTION, badge, modelName, money } from '@/lib/format';
import type { Product, Variant } from '@/lib/types';
import { useCart } from './cart';
import { TruckIcon } from './icons';

function pickInitial(p: Product, fromUrl?: string): Variant | undefined {
  return p.variants.find((v) => v.id.endsWith(`/${fromUrl}`)) ?? p.variants.find((v) => v.availableForSale) ?? p.variants[0];
}

export function ProductView({ product, initialVariant }: { product: Product; initialVariant?: string }) {
  const { add } = useCart();
  const [variant, setVariant] = useState<Variant | undefined>(() => pickInitial(product, initialVariant));
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);

  const options = product.options.filter((o) => !(o.optionValues.length === 1 && o.optionValues[0].name === 'Default Title'));
  const selected = Object.fromEntries((variant?.selectedOptions ?? []).map((o) => [o.name, o.value]));

  // Galeria: a imagem da variante escolhida vem primeiro.
  const images = useMemo(() => {
    const list = [...product.images];
    const vi = variant?.image?.url;
    if (vi) {
      const i = list.findIndex((x) => x.url.split('?')[0] === vi.split('?')[0]);
      if (i > 0) list.unshift(list.splice(i, 1)[0]);
      else if (i < 0 && variant?.image) list.unshift(variant.image);
    }
    return list;
  }, [product.images, variant]);

  function choose(name: string, value: string) {
    const want = { ...selected, [name]: value };
    const exact = product.variants.find((v) => v.selectedOptions.every((o) => want[o.name] === o.value));
    const loose = product.variants.find((v) => v.selectedOptions.some((o) => o.name === name && o.value === value));
    const next = exact ?? loose;
    if (!next) return;
    setVariant(next);
    setStatus(null);
    gallery.current?.scrollTo({ left: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('variant', next.id.split('/').pop()!);
    window.history.replaceState(null, '', url);
  }

  function availableWith(name: string, value: string) {
    return product.variants.some((v) => v.availableForSale && v.selectedOptions.some((o) => o.name === name && o.value === value));
  }

  async function buy() {
    if (!variant) return;
    setBusy(true);
    setStatus(null);
    const err = await add(variant.id);
    setBusy(false);
    setStatus(err ? { kind: 'err', msg: err } : { kind: 'ok', msg: 'Adicionado à sacola' });
  }

  const name = modelName(product.title);
  const tag = badge(product);
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compare = variant?.compareAtPrice;
  const soldOut = !variant?.availableForSale;

  return (
    <div className="pdp">
      <div>
        <div
          className="gallery"
          ref={gallery}
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          aria-label={`Fotos do óculos ${name}`}
        >
          {images.length === 0 && <div className="ph" />}
          {images.map((img, i) => (
            <div className="ph" key={img.url + i}>
              <Image src={img.url} alt={img.altText || `Óculos ${name}, foto ${i + 1}`} fill priority={i === 0} sizes="(min-width:900px) 58vw, 100vw" />
            </div>
          ))}
        </div>
        {images.length > 1 && <p className="gallery-count small muted" aria-hidden="true">{Math.min(slide + 1, images.length)} / {images.length}</p>}
      </div>

      <div className="info">
        <div className="info-head">
          {tag && <span className="label muted">{tag}</span>}
          <h1 className="title">{name}</h1>
          <p className="price" style={{ margin: 0 }}>
            {money(price)}
            {compare && Number(compare.amount) > Number(price.amount) && <span className="strike">{money(compare)}</span>}
          </p>
        </div>

        {options.map((opt) => {
          const isColor = COLOR_OPTION.test(opt.name);
          return (
            <div className="opt" key={opt.name}>
              <p className="small muted" style={{ margin: 0 }}>{opt.name}: <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{selected[opt.name]}</b></p>
              <div className={isColor ? 'swatches' : 'pills'} role="group" aria-label={opt.name}>
                {opt.optionValues.map((v) => {
                  const on = selected[opt.name] === v.name;
                  const ok = availableWith(opt.name, v.name);
                  if (!isColor) {
                    return (
                      <button key={v.name} className={`pill${ok ? '' : ' off'}`} aria-pressed={on} onClick={() => choose(opt.name, v.name)}>
                        {v.name}{ok ? '' : <span className="sr-only"> (esgotado)</span>}
                      </button>
                    );
                  }
                  const vImg = product.variants.find((x) => x.selectedOptions.some((o) => o.name === opt.name && o.value === v.name))?.image?.url;
                  const swImg = v.swatch?.image?.previewImage?.url ?? vImg;
                  const style = v.swatch?.color
                    ? { background: v.swatch.color }
                    : swImg
                      ? { backgroundImage: `url(${swImg}${swImg.includes('cdn.shopify.com') ? (swImg.includes('?') ? '&' : '?') + 'width=96' : ''})` }
                      : undefined;
                  return (
                    <button
                      key={v.name}
                      className={`sw${ok ? '' : ' off'}`}
                      style={style}
                      aria-pressed={on}
                      aria-label={`${v.name}${ok ? '' : ', esgotado'}`}
                      title={v.name}
                      onClick={() => choose(opt.name, v.name)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="buy-bar">
          <button className="btn btn-primary btn-block" onClick={buy} disabled={soldOut || busy || !variant}>
            {soldOut ? 'Esgotado' : busy ? 'Adicionando…' : 'Adicionar à sacola'}
          </button>
          <p className={`status${status ? ` ${status.kind}` : ''}`} role="status" aria-live="polite" style={{ margin: '8px 0 0' }}>{status?.msg ?? ''}</p>
        </div>

        <ul className="facts">
          <li><TruckIcon size={18} /> Frete grátis para todo o Brasil</li>
        </ul>

        {product.descriptionHtml && <div className="rte" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
      </div>
    </div>
  );
}
