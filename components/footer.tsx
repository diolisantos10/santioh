import Image from 'next/image';
import Link from 'next/link';
import { getPolicies } from '@/lib/shopify';

export async function Footer() {
  const policies = await getPolicies().catch(() => []);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <Link href="/" className="footer-logo" aria-label="Santioh"><Image src="/brand/santioh-preto.png" alt="Santioh" width={876} height={85} unoptimized /></Link>
            <p className="small muted" style={{ margin: 0, maxWidth: '36ch' }}>Óculos de sol para a pista, a música e a arte. Frete grátis para todo o Brasil.</p>
          </div>
          <div>
            <p className="label" style={{ margin: '0 0 12px' }}>Loja</p>
            <ul className="small">
              <li><Link href="/produtos">Todos os óculos</Link></li>
              <li><Link href="/produtos?filtro=lancamentos">Lançamentos</Link></li>
              <li><Link href="/produtos?filtro=best-sellers">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <p className="label" style={{ margin: '0 0 12px' }}>Santioh</p>
            <ul className="small">
              <li><a href="https://www.instagram.com/santioh_/" target="_blank" rel="noreferrer">Instagram</a></li>
              {policies.map((p) => <li key={p.handle}><Link href={`/politicas/${p.handle}`}>{p.title}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom small muted">
          <span>© {new Date().getFullYear()} Santioh</span>
          <span>Pagamento seguro pela Shopify</span>
        </div>
      </div>
    </footer>
  );
}
