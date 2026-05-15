'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Collection, Gender, GenderLabel } from '@/types/product';

interface Props {
  collections: Collection[];
  categories: Category[];
  filters: {
    search?: string;
    collectionId?: string;
    categoryId?: string;
    gender?: string;
  };
}

export function ProductFilters({ collections, categories, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname],
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters = filters.search || filters.categoryId || filters.collectionId;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search products..."
          defaultValue={filters.search ?? ''}
          onChange={handleSearch}
          className="pl-9 bg-white"
        />
      </div>

      <Select
        value={filters.collectionId ?? 'all'}
        onValueChange={(v) => updateFilter('collectionId', v)}
      >
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="All collections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All collections</SelectItem>
          {collections.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId ?? 'all'}
        onValueChange={(v) => updateFilter('categoryId', v)}
      >
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.gender ?? 'all'} onValueChange={(v) => updateFilter('gender', v)}>
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="All genders" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All genders</SelectItem>
          {Object.values(Gender).map((g) => (
            <SelectItem key={g} value={g}>
              {GenderLabel[g]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        disabled={!hasFilters || isPending}
        className="text-zinc-500"
      >
        <X className="w-4 h-4 mr-1" /> Clear
      </Button>
    </div>
  );
}
