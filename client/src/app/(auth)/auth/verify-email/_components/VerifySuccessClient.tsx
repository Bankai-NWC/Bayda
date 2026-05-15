'use client';

import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useUserStore } from '@/store/useUserStore';
import { IUser } from '@/types/auth';

export function VerifySuccessClient({ user }: { user: IUser }) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(user);
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, user, setUser]);

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-50 p-4 dark:bg-green-950/20 animate-bounce">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Email Verified!</h1>
          <p className="text-muted-foreground">Your account has been successfully activated.</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Redirecting to home page...</span>
        </div>
      </div>
    </div>
  );
}
