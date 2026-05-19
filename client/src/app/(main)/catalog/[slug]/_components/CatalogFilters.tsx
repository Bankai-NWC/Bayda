'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { Slider } from '@/components/ui/slider';
import { Category, Collection, Color, Gender, GenderLabel, ProductListItem } from '@/types/product';

interface Props {
  products: ProductListItem[];
  categories: Category[];
  collections: Collection[];
  minPriceLimit: number;
  maxPriceLimit: number;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-200 py-4">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-widest text-zinc-800 mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function CatalogFilters({
  products,
  categories,
  collections,
  minPriceLimit,
  maxPriceLimit,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get('category');
  const activeCollection = searchParams.get('collection');
  const activeSize = searchParams.get('size');
  const activeColor = searchParams.get('color');
  const activeGender = searchParams.get('gender');
  const paramMin = searchParams.get('minPrice');
  const paramMax = searchParams.get('maxPrice');

  const globalMin = minPriceLimit;
  const globalMax = maxPriceLimit;

  const [dragRange, setDragRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!isPending) {
      const id = setTimeout(() => setDragRange(null), 0);
      return () => clearTimeout(id);
    }
  }, [isPending]);

  const currentRange: [number, number] = dragRange ?? [
    paramMin ? Number(paramMin) : globalMin,
    paramMax ? Number(paramMax) : globalMax,
  ];

  const availableSizes = Array.from(
    new Set(products.flatMap((p) => p.variants.map((v) => v.size).filter((s): s is string => !!s))),
  ).sort();

  const availableColors = Array.from(
    new Map(
      products
        .flatMap((p) => p.variants.map((v) => v.color).filter((c): c is Color => !!c))
        .map((c) => [c.id, c]),
    ).values(),
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      startTransition(() => router.push(`?${params.toString()}`));
    },
    [router, searchParams],
  );

  function handlePriceCommit(value: number[]) {
    const [min, max] = value as [number, number];
    const params = new URLSearchParams(searchParams.toString());

    if (min <= globalMin) {
      params.delete('minPrice');
    } else {
      params.set('minPrice', String(min));
    }

    if (max >= globalMax) {
      params.delete('maxPrice');
    } else {
      params.set('maxPrice', String(max));
    }

    params.delete('page');

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  const hasFilters =
    activeCategory ||
    activeCollection ||
    activeSize ||
    activeColor ||
    activeGender ||
    paramMin ||
    paramMax;

  return (
    <aside className="w-64 shrink-0">
      {/* Category */}
      <div className="border-b border-zinc-200 pb-4 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-800 mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateParam('category', null)}
              className={`text-sm w-full text-left py-0.5 transition-colors ${
                !activeCategory ? 'font-semibold text-black' : 'text-zinc-500 hover:text-black'
              }`}
            >
              All products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() =>
                  updateParam('category', activeCategory === cat.slug ? null : cat.slug)
                }
                className={`text-sm w-full text-left py-0.5 transition-colors ${
                  activeCategory === cat.slug
                    ? 'font-semibold text-black'
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-800 pt-2 mb-1">
        Filters
      </p>

      {/* Price */}
      <FilterSection title="Price">
        <div className="px-1 space-y-4">
          <Slider
            min={globalMin}
            max={globalMax}
            step={1}
            value={currentRange}
            onValueChange={(v) => setDragRange(v as [number, number])}
            onValueCommit={(value) => {
              handlePriceCommit(value);
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <span>{currentRange[0]} $</span>
            <span>{currentRange[1]} $</span>
          </div>
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender">
        <ul className="space-y-1">
          {Object.values(Gender)
            .filter((g) => g !== Gender.UNISEX)
            .map((g) => {
              const isActive = activeGender === g;
              return (
                <li key={g}>
                  <button
                    onClick={() => updateParam('gender', isActive ? null : g)}
                    className={`text-sm w-full text-left py-0.5 transition-colors ${
                      isActive ? 'font-semibold text-black' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    {GenderLabel[g]}
                  </button>
                </li>
              );
            })}
        </ul>
      </FilterSection>

      {/* Collection */}
      {collections.length > 0 && (
        <FilterSection title="Collection">
          <ul className="space-y-2">
            {collections.map((col) => {
              const isActive = activeCollection === col.slug;
              return (
                <li key={col.id}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => updateParam('collection', isActive ? null : col.slug)}
                      className="w-4 h-4 border-zinc-300 rounded-none accent-black cursor-pointer"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isActive ? 'text-black font-medium' : 'text-zinc-500 group-hover:text-black'
                      }`}
                    >
                      {col.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      )}

      {/* Size */}
      {availableSizes.length > 0 && (
        <FilterSection title="Size">
          <ul className="space-y-2">
            {availableSizes.map((size) => {
              const isActive = activeSize === size;
              return (
                <li key={size}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => updateParam('size', isActive ? null : size)}
                      className="w-4 h-4 border-zinc-300 rounded-none accent-black cursor-pointer"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isActive ? 'text-black font-medium' : 'text-zinc-500 group-hover:text-black'
                      }`}
                    >
                      {size}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-col gap-2">
            {availableColors.map((color) => {
              const isActive = activeColor === color.name;
              return (
                <button
                  key={color.id}
                  onClick={() => updateParam('color', isActive ? null : color.name)}
                  title={color.name}
                  className="flex flex-row gap-2 items-center"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      isActive
                        ? 'border-black scale-110'
                        : 'border-transparent hover:border-zinc-400'
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                  />
                  <span className="text-sm">{color.name}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => {
            setDragRange(null);
            startTransition(() => router.push('?'));
          }}
          className="mt-4 text-xs text-zinc-400 hover:text-black transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
