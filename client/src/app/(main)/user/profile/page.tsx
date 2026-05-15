'use client';

import { ChevronRight, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { logoutAction } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';

function Profile() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { clearUser } = useUserStore();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      clearUser();
      router.replace('/');
    });
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-sm text-black font-medium uppercase">{user?.fullName}</h1>
        <Link
          href={'/user/addresses'}
          className="flex flex-row justify-between items-center max-w-[526px]"
        >
          <span className="text-sm uppercase">Addresses</span>
          <ChevronRight size={12} />
        </Link>
        <Link
          href={'/user/measurements'}
          className="flex flex-row justify-between items-center max-w-[526px]"
        >
          <span className="text-sm uppercase">My measurements</span>
          <ChevronRight size={12} />
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-sm text-black font-medium uppercase">Personal data</h1>
        <Link href={'/user/addresses'}>
          <p className="flex flex-row justify-between items-center max-w-[526px]">
            <span className="text-sm uppercase">E-mail</span>
            <ChevronRight size={12} />
          </p>
          <p className="text-sm">{user?.email}</p>
        </Link>
        <Link href={'/user/measurements'}>
          <p className="flex flex-row justify-between items-center max-w-[526px]">
            <span className="text-sm uppercase">Password</span>
            <ChevronRight size={12} />
          </p>
          <p className="text-sm tracking-wider">············</p>
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <Button
            onClick={handleLogout}
            disabled={isPending}
            variant={'ghostCustom'}
            className="p-0"
          >
            {isPending && <LoaderCircle />}Sign out
          </Button>
        </div>
        <div>
          <Button variant={'link'} className="max-w-[200px] p-0 hover:text-red-500/50">
            Delete my account
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Profile;
