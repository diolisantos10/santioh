import type { Money, Product } from './types';

export function money(m: Money): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: m.currencyCode || 'BRL' }).format(Number(m.amount));
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function hasTag(p: Product, tag: string): boolean {
  const t = norm(tag);
  return p.tags.some((x) => norm(x) === t);
}

/** Selo exibido no cartão: um só, Lançamento tem prioridade. */
export function badge(p: Product): string | null {
  if (!p.availableForSale) return 'Esgotado';
  if (hasTag(p, 'Lançamento') || hasTag(p, 'lancamento') || hasTag(p, 'novo')) return 'Lançamento';
  if (hasTag(p, 'Best Seller') || hasTag(p, 'bestseller') || hasTag(p, 'mais vendido')) return 'Best Seller';
  return null;
}

export const COLOR_OPTION = /^(cor|cores|color|colour)$/i;

export function colorLabel(p: Product): string | null {
  const opt = p.options.find((o) => COLOR_OPTION.test(o.name));
  if (!opt) return null;
  const n = opt.optionValues.length;
  return n > 1 ? `${n} cores` : opt.optionValues[0]?.name ?? null;
}

/** Remove o prefixo "Óculos" do título: no site o modelo aparece só pelo nome. */
export function modelName(title: string): string {
  return title.replace(/^\s*[óo]culos\s+/i, '').trim();
}
