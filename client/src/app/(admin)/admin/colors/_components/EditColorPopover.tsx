'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Color } from '@/types/product';

import ColorForm from './ColorForm';

interface EditColorPopoverProps {
  color: Color;
  onRefresh: () => void;
}

export function EditColorPopover({ color, onRefresh }: EditColorPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 shadow-2xl border-zinc-200">
        <ColorForm
          initialData={color}
          onSuccess={() => {
            setOpen(false);
            onRefresh();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
