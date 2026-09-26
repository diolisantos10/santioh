import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap empty" style={{ minHeight: '50vh', alignContent: 'center' }}>
      <h1 className="title">Página não encontrada</h1>
      <p className="muted small" style={{ margin: 0 }}>O endereço pode ter mudado ou o modelo saiu da coleção.</p>
      <Link className="btn btn-primary" href="/produtos">Ver todos os óculos</Link>
    </div>
  );
}
