'use client';

import { BookmarkX } from 'lucide-react';

function Wishlist() {
  return (
    <div className="flex flex-col gap-8">
      <BookmarkX />
      <p className="text-sm uppercase">You don&apos;t have any saved items</p>
      <p className="text-sm">Save your favorite items and share them with anyone</p>
    </div>
  );
}

export default Wishlist;
