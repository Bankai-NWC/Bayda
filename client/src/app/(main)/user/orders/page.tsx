'use client';

import { ClipboardX } from 'lucide-react';

function Orders() {
  return (
    <div className="flex flex-col gap-8">
      <ClipboardX />
      <p className="text-sm">You haven&apos;t placed any orders yet</p>
    </div>
  );
}

export default Orders;
