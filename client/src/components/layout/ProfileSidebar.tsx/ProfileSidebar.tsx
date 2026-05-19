'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

function ProfileSidebar() {
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  return (
    <aside className="hidden md:flex flex-col gap-4">
      <Link
        href={'/user/profile'}
        className={cn('uppercase text-sm', isActive('/user/profile') ? 'font-semibold' : '')}
      >
        |01| Profile
      </Link>
      <Link
        href={'/user/orders'}
        className={cn('uppercase text-sm', isActive('/user/orders') ? 'font-semibold' : '')}
      >
        |02| Orders
      </Link>
      <Link
        href={'/user/cart'}
        className={cn('uppercase text-sm', isActive('/user/cart') ? 'font-semibold' : '')}
      >
        |03| Cart
      </Link>
      <Link
        href={'/user/wishlist'}
        className={cn('uppercase text-sm', isActive('/user/wishlist') ? 'font-semibold' : '')}
      >
        |04| Wishlist
      </Link>
    </aside>
  );
}

export default ProfileSidebar;
