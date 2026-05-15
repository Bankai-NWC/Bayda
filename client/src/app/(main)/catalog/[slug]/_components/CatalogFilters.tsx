'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { Category, Collection, Color, ProductListItem } from '@/types/product';

interface Props {
  products: ProductListItem[];
  categories: Category[];
  collections: Collection[];
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

export function CatalogFilters({ products, categories, collections }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = searchParams.get('categoryId');
  const activeCollection = searchParams.get('collectionId');
  const activeSize = searchParams.get('size');
  const activeColor = searchParams.get('colorId');

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

  const hasFilters = activeCategory || activeCollection || activeSize || activeColor;

  return (
    <aside className="w-64 shrink-0">
      <div className="border-b border-zinc-200 pb-4 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-800 mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateParam('categoryId', null)}
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
                  updateParam(
                    'categoryId',
                    activeCategory === cat.id.toString() ? null : cat.id.toString(),
                  )
                }
                className={`text-sm w-full text-left py-0.5 transition-colors ${
                  activeCategory === cat.id.toString()
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

      {collections.length > 0 && (
        <FilterSection title="Collection">
          <ul className="space-y-2">
            {collections.map((col) => {
              const isActive = activeCollection === col.id.toString();
              return (
                <li key={col.id}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() =>
                        updateParam('collectionId', isActive ? null : col.id.toString())
                      }
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

      {availableColors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-col flex-wrap gap-2">
            {availableColors.map((color) => {
              const isActive = activeColor === color.id.toString();
              return (
                <button
                  key={color.id}
                  onClick={() => updateParam('colorId', isActive ? null : color.id.toString())}
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
                  ></div>
                  <span className="text-sm">{color.name}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Скинути фільтри */}
      {hasFilters && (
        <button
          onClick={() => startTransition(() => router.push('?'))}
          className="mt-4 text-xs text-zinc-400 hover:text-black transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
