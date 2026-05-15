'use client';

import { useEffect, useMemo, useState } from 'react';

import { getColorsAction } from '@/actions/catalog-actions';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Color } from '@/types/product';

interface ColorSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  initialColor?: Color | null; // Новый пропс
}

export function ColorSelect({
  value,
  onValueChange,
  label = 'Color',
  initialColor,
}: ColorSelectProps) {
  const [colors, setColors] = useState<Color[]>(initialColor ? [initialColor] : []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadColors() {
      try {
        const data = await getColorsAction();
        const items = Array.isArray(data) ? data : data?.items || [];
        setColors(items);
      } catch (error) {
        console.error('Failed to load colors:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadColors();
  }, []);

  // Ищем выбранный цвет либо в загруженном списке, либо используем initialColor
  const activeColor = useMemo(() => {
    if (initialColor && value === initialColor.id.toString()) return initialColor;
    return colors.find((c) => c.id.toString() === value);
  }, [colors, value, initialColor]);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input type="hidden" name="colorId" value={value} />

      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="bg-white focus:ring-black min-w-[140px]">
          <div className="flex items-center gap-2">
            {activeColor ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: activeColor.hexCode }}
                />
                <span className="truncate">{activeColor.name}</span>
              </>
            ) : (
              <SelectValue placeholder={isLoading ? 'Loading...' : 'Select color'} />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">— None —</span>
          </SelectItem>
          {colors.map((color) => (
            <SelectItem key={color.id} value={color.id.toString()}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: color.hexCode }}
                />
                <span>{color.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
