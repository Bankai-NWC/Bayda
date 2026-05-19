'use client';

import { Bookmark, LoaderCircle, LogOut, Search, ShieldCheck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';

import { logoutAction } from '@/actions/auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/useUserStore';

export function Header() {
  const { user, clearUser } = useUserStore();
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < lastScrollY.current || currentScrollY < 10);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      clearUser();
    });
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b bg-white transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          BAYDA
        </Link>

        <div className="hidden md:flex relative w-full max-w-sm items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-9 bg-secondary" />
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <Link href="/user/cart" className="relative">
                <ShoppingBag className="h-4.5 w-4.5" />
                {/* <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  0
                </span> */}
              </Link>
              <Link href="/user/wishlist" className="relative">
                <Bookmark className="h-4.5 w-4.5" />
              </Link>
            </div>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src="" alt={user.fullName} />
                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {!user.isActivated && (
                  <DropdownMenuItem className="text-destructive font-medium">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Confirm your email
                  </DropdownMenuItem>
                )}

                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/user/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/orders">My orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isPending}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isPending && <LoaderCircle />}
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
