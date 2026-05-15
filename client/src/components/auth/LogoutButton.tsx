'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { logoutAction } from '@/actions/auth-actions';
import { useUserStore } from '@/store/useUserStore';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      clearUser();
      router.push('/');
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? 'Выходим...' : 'Выйти'}
    </button>
  );
}
