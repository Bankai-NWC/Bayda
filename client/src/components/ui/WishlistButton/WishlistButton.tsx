'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  addToWishlistAction,
  checkWishlistAction,
  removeFromWishlistAction,
} from '@/actions/wishlist-actions';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';

interface Props {
  variantId: number;
  className?: string;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export function WishlistButton({ variantId, className, size = 'md', onRemove }: Props) {
  const { user } = useUserStore();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkWishlistAction(variantId)
      .then((res) => setInWishlist(res.inWishlist))
      .finally(() => setIsLoading(false));
  }, [variantId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    if (inWishlist) {
      const res = await removeFromWishlistAction(variantId);
      if (res.success) {
        setInWishlist(false);
        onRemove?.();
      }
    } else {
      const res = await addToWishlistAction(variantId);
      if (res.success) setInWishlist(true);
    }

    setIsLoading(false);
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    user && (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={cn('transition-all disabled:opacity-50', className)}
      >
        <Bookmark
          className={cn(iconSize, 'transition-all', {
            'fill-black stroke-black': inWishlist,
            'stroke-current fill-none': !inWishlist,
          })}
        />
      </button>
    )
  );
}
