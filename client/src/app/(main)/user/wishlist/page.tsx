import { getWishlistAction } from '@/actions/wishlist-actions';

import { WishlistClient } from './_components/WishlistClient';

export default async function WishlistPage() {
  const { items } = await getWishlistAction();

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Wishlist</h1>

      <WishlistClient initialItems={items} />
    </main>
  );
}
