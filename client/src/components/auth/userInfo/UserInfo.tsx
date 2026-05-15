'use client';

import { useUserStore } from '@/store/useUserStore';

function UserInfo() {
  const user = useUserStore((state) => state.user);
  return user && <p>{JSON.stringify(user, null, 2)}</p>;
}

export default UserInfo;
