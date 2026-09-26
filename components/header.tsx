'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './cart';
import { BagIcon, CloseIcon, MenuIcon } from './icons';

const LINKS = [
  { href: '/produtos', label: 'Todos os óculos' },
  { href: '/produtos?filtro=lancamentos', label: 'Lançamentos' },
  { href: '/produtos?filtro=best-sellers', label: 'Best Sellers' },
];

export function Header() {
  const { cart, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const qty = cart?.totalQuantity ?? 0;

  return (
    <>
      <div className="announce label">Frete grátis para todo o Brasil</div>
      <header className="header">
        <div className="wrap header-bar">
          <div className="header-left">
            <button className="icon-btn menu-toggle" onClick={() => setMenu(true)} aria-label="Abrir menu"><MenuIcon /></button>
            <nav className="header-nav" aria-label="Principal">
              {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            </nav>
          </div>
          <Link href="/" className="header-logo" aria-label="Santioh, página inicial">
            <Image src="/brand/santioh-preto.png" alt="Santioh" width={876} height={85} priority unoptimized />
          </Link>
          <div className="header-right">
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label={`Sacola, ${qty} ${qty === 1 ? 'item' : 'itens'}`}>
              <BagIcon />{qty > 0 && <span className="count">{qty}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="scrim" data-open={menu} onClick={() => setMenu(false)} aria-hidden="true" />
      <aside className="drawer drawer-left" data-open={menu} aria-label="Menu" aria-hidden={!menu} inert={!menu}>
        <div className="drawer-head">
          <span className="label">Menu</span>
          <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Fechar menu"><CloseIcon /></button>
        </div>
        <div className="drawer-body">
          <ul className="menu-links">
            {LINKS.map((l) => <li key={l.href}><Link href={l.href} onClick={() => setMenu(false)}>{l.label}</Link></li>)}
          </ul>
        </div>
        <div className="drawer-foot">
          <a className="small" href="https://www.instagram.com/santioh_/" target="_blank" rel="noreferrer">Instagram @santioh_</a>
        </div>
      </aside>
    </>
  );
}
