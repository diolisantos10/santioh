import { getProducts } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProducts({ first: 1 });
    return Response.json({ ok: true, shopify: 'conectada', produtos: products.length > 0 ? 'publicados' : 'nenhum publicado' });
  } catch (e) {
    return Response.json({ ok: false, shopify: String(e) }, { status: 200 });
  }
}
