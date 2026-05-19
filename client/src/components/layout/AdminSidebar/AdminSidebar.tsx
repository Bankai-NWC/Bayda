'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  return (
    <nav className="hidden md:flex flex-col gap-6 min-w-[200px]">
      <div className="flex flex-col gap-4">
        <Link
          href={'/admin'}
          className={cn('uppercase text-sm', isActive('/admin') ? 'font-semibold' : '')}
        >
          |01| Main Panel
        </Link>
        <Link
          href={'/admin/orders'}
          className={cn('uppercase text-sm', isActive('/admin/orders') ? 'font-semibold' : '')}
        >
          |02| Orders
        </Link>
        <Link
          href={'/admin/products'}
          className={cn('uppercase text-sm', isActive('/admin/products') ? 'font-semibold' : '')}
        >
          |03| Product
        </Link>
        <Link
          href={'/admin/categories'}
          className={cn('uppercase text-sm', isActive('/admin/categories') ? 'font-semibold' : '')}
        >
          |04| Categories
        </Link>
        <Link
          href={'/admin/collections'}
          className={cn('uppercase text-sm', isActive('/admin/collections') ? 'font-semibold' : '')}
        >
          |05| Collections
        </Link>
        <Link
          href={'/admin/colors'}
          className={cn('uppercase text-sm', isActive('/admin/colors') ? 'font-semibold' : '')}
        >
          |06| Colors
        </Link>
        <Link
          href={'/'}
          className={cn('uppercase text-sm', isActive('/admin/wishlist') ? 'font-semibold' : '')}
        >
          |07| Back to shop
        </Link>
      </div>
    </nav>
  );
}

export default AdminSidebar;
