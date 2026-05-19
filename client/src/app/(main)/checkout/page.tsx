import { redirect } from 'next/navigation';

import { getCartAction } from '@/actions/cart-actions';
import { getMyAddressesAction } from '@/actions/order-actions';

import { CheckoutClient } from './_components/CheckoutClient';

export default async function CheckoutPage() {
  const [{ cart }, { addresses }] = await Promise.all([getCartAction(), getMyAddressesAction()]);

  if (!cart || cart.items.length === 0) {
    redirect('/user/cart');
  }

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-10">Checkout</h1>
      <CheckoutClient cart={cart} addresses={addresses} />
    </main>
  );
}
