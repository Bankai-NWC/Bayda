// src/components/ui/GenderSelect.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender, GenderLabel } from '@/types/product';

interface Props {
  value: string;
  onValueChange: (value: string) => void;
}

export function GenderSelect({ value, onValueChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Gender</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white focus:ring-black w-[106px]">
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Gender).map((g) => (
            <SelectItem key={g} value={g}>
              {GenderLabel[g]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
