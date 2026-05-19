import { getCartAction } from '@/actions/cart-actions';

import { CartClient } from './_components/CartClient';

export default async function CartPage() {
  const { cart } = await getCartAction();

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Cart</h1>
      <CartClient initialCart={cart} />
    </main>
  );
}
