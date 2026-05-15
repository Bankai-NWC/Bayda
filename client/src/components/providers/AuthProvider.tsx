'use client';

import { useEffect } from 'react';

import { getProfileAction } from '@/actions/auth-actions';
import { useUserStore } from '@/store/useUserStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    getProfileAction().then((result) => {
      if (result.success) {
        setUser(result.user);
      }
    });
  }, [setUser]);

  return <>{children}</>;
}
