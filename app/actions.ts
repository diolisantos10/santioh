'use server';

import { cookies } from 'next/headers';
import { addLines, createCart, getCart, removeLines, updateLines } from '@/lib/shopify';
import type { Cart } from '@/lib/types';

const COOKIE = 'santioh_cart';
type Result = { cart: Cart | null; error?: string };

async function cartId() {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

async function save(cart: Cart) {
  (await cookies()).set(COOKIE, cart.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

function fail(e: unknown, cart: Cart | null = null): Result {
  console.error('[carrinho]', e);
  return { cart, error: 'Não foi possível atualizar a sacola. Tente de novo em instantes.' };
}

export async function loadCart(): Promise<Result> {
  const id = await cartId();
  if (!id) return { cart: null };
  try {
    const cart = await getCart(id);
    if (!cart) (await cookies()).delete(COOKIE);
    return { cart };
  } catch (e) {
    return fail(e);
  }
}

export async function addToCart(variantId: string, quantity = 1): Promise<Result> {
  try {
    const id = await cartId();
    let cart = id ? await getCart(id) : null;
    cart = cart ? await addLines(cart.id, [{ merchandiseId: variantId, quantity }]) : await createCart([{ merchandiseId: variantId, quantity }]);
    await save(cart);
    return { cart };
  } catch (e) {
    return fail(e);
  }
}

export async function setQuantity(lineId: string, quantity: number): Promise<Result> {
  const id = await cartId();
  if (!id) return { cart: null };
  try {
    const cart = quantity <= 0 ? await removeLines(id, [lineId]) : await updateLines(id, [{ id: lineId, quantity }]);
    return { cart };
  } catch (e) {
    return fail(e);
  }
}
