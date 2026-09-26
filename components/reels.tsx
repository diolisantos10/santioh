import Link from 'next/link';
import type { Product } from '@/lib/types';

const REELS = [
  { key: 'magnifico', file: 'magnifico-laranja-aline', model: 'Magnifico', detail: 'Laranja' },
  { key: 'gipsy', file: 'gipsy-azul-animal-pedro', model: 'Gipsy', detail: 'Azul e animal print' },
  { key: 'voltage', file: 'voltage-cristal-marrom-diego', model: 'Voltage', detail: 'Cristal com lente marrom' },
];

export function Reels({ products }: { products: Product[] }) {
  return (
    <div className="reels">
      {REELS.map((r) => {
        const p = products.find((x) => x.handle.includes(r.key) || x.title.toLowerCase().includes(r.key));
        const body = (
          <>
            <video src={`/media/${r.file}.mp4`} poster={`/media/${r.file}.jpg`} muted loop playsInline autoPlay preload="none" aria-label={`Vídeo do óculos ${r.model}`} />
            <span className="product-name">{r.model}</span>
            <span className="small muted">{r.detail}</span>
          </>
        );
        return p ? <Link key={r.key} href={`/produto/${p.handle}`} className="reel">{body}</Link> : <div key={r.key} className="reel">{body}</div>;
      })}
    </div>
  );
}
