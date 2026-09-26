'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react';
import { addToCart, loadCart, setQuantity } from '@/app/actions';
import { money, modelName } from '@/lib/format';
import type { Cart } from '@/lib/types';
import { CloseIcon, LockIcon } from './icons';

type Ctx = {
  cart: Cart | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (variantId: string) => Promise<string | null>;
  pending: boolean;
};

const CartCtx = createContext<Ctx | null>(null);

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart fora do CartProvider');
  return c;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    loadCart().then((r) => setCart(r.cart)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const add = useCallback(async (variantId: string) => {
    const r = await addToCart(variantId);
    if (r.cart) setCart(r.cart);
    if (!r.error) setOpen(true);
    return r.error ?? null;
  }, []);

  const change = (lineId: string, q: number) =>
    start(async () => {
      const r = await setQuantity(lineId, q);
      if (r.cart || !r.error) setCart(r.cart);
    });

  return (
    <CartCtx.Provider value={{ cart, open, setOpen, add, pending }}>
      {children}
      <div className="scrim" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="drawer drawer-right" data-open={open} aria-label="Sacola" aria-hidden={!open} inert={!open}>
        <div className="drawer-head">
          <span className="label">Sacola{cart?.totalQuantity ? ` (${cart.totalQuantity})` : ''}</span>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar sacola"><CloseIcon /></button>
        </div>
        <div className="drawer-body" aria-busy={pending}>
          {!cart || cart.lines.length === 0 ? (
            <div className="empty">
              <p className="title">Sua sacola está vazia</p>
              <p className="muted small">Escolha um modelo e ele aparece aqui.</p>
              <Link className="btn btn-primary" href="/produtos" onClick={() => setOpen(false)}>Ver todos os óculos</Link>
            </div>
          ) : (
            cart.lines.map((l) => {
              const color = l.merchandise.selectedOptions.filter((o) => o.value !== 'Default Title').map((o) => o.value).join(' / ');
              return (
                <div className="cart-line" key={l.id}>
                  <Link href={`/produto/${l.merchandise.product.handle}`} className="ph" onClick={() => setOpen(false)}>
                    {l.merchandise.image && <Image src={l.merchandise.image.url} alt="" fill sizes="88px" />}
                  </Link>
                  <div>
                    <p className="product-name" style={{ margin: 0 }}>{modelName(l.merchandise.product.title)}</p>
                    {color && <p className="small muted" style={{ margin: '4px 0 0' }}>{color}</p>}
                    <div className="qty" role="group" aria-label="Quantidade">
                      <button onClick={() => change(l.id, l.quantity - 1)} aria-label="Diminuir quantidade" disabled={pending}>−</button>
                      <span>{l.quantity}</span>
                      <button onClick={() => change(l.id, l.quantity + 1)} aria-label="Aumentar quantidade" disabled={pending}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', justifyItems: 'end', alignContent: 'space-between' }}>
                    <span className="price small">{money(l.cost.totalAmount)}</span>
                    <button className="remove" onClick={() => change(l.id, 0)} disabled={pending}>Remover</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {cart && cart.lines.length > 0 && (
          <div className="drawer-foot">
            <div className="row-between"><span>Subtotal</span><span className="price">{money(cart.cost.subtotalAmount)}</span></div>
            <p className="small muted" style={{ margin: 0 }}>Frete grátis para todo o Brasil. Descontos são aplicados no pagamento.</p>
            <a className="btn btn-primary btn-block" href={cart.checkoutUrl}><LockIcon size={16} /> Finalizar compra</a>
          </div>
        )}
      </aside>
    </CartCtx.Provider>
  );
}
