import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPolicies } from '@/lib/shopify';

export const revalidate = 3600;
type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = (await getPolicies().catch(() => [])).find((x) => x.handle === handle);
  return { title: p?.title ?? 'Política' };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const p = (await getPolicies().catch(() => [])).find((x) => x.handle === handle);
  if (!p) notFound();
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <h1 className="display" style={{ marginBottom: 32 }}>{p.title}</h1>
      <div className="rte" dangerouslySetInnerHTML={{ __html: p.body }} />
    </div>
  );
}
