'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  createCategoryAction,
  deleteCategoryAction,
  getCategoriesAction,
  setCategorySizesAction,
} from '@/actions/catalog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Category } from '@/types/product';

const PRESET_SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  'One size',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSizes, setIsSavingSizes] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const [name, setName] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategoriesAction();
      setCategories(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const result = await createCategoryAction(name.trim());
    if (result.success && result.category) {
      setName('');
      setOpenPopover(false);
      await fetchCategories();
      handleSelectCategory({ ...result.category, sizes: [] });
    } else {
      alert('Error creating category');
    }
    setIsSubmitting(false);
  };

  const handleAddCustomSize = () => {
    const val = customSize.trim().toUpperCase();
    if (!val || selectedSizes.includes(val)) return;
    setSelectedSizes((prev) => [...prev, val]);
    setCustomSize('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete category?')) return;
    const result = await deleteCategoryAction(id);
    if (result.success) {
      if (selectedCat?.id === id) setSelectedCat(null);
      await fetchCategories();
    }
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCat(cat);
    setSelectedSizes(cat.sizes.map((s) => s.size));
    setCustomSize('');
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  async function handleSaveSizes() {
    if (!selectedCat) return;
    setIsSavingSizes(true);
    const result = await setCategorySizesAction(selectedCat.id, selectedSizes);
    if (result.success) {
      await fetchCategories();
      setSelectedCat((prev) =>
        prev
          ? {
              ...prev,
              sizes: selectedSizes.map((s, i) => ({ id: i, size: s, categoryId: prev.id })),
            }
          : null,
      );
    }
    setIsSavingSizes(false);
  }

  const allSizes = [...new Set([...PRESET_SIZES, ...selectedSizes])];

  return (
    <div className="p-8 pt-0 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>

        <Popover
          open={openPopover}
          onOpenChange={(val) => {
            setOpenPopover(val);
            if (!val) setName('');
          }}
        >
          <PopoverTrigger asChild>
            <Button className="bg-black hover:bg-zinc-800 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">New category</h4>
                <p className="text-sm text-muted-foreground">Enter a name for the new category</p>
              </div>
              <Input
                autoFocus
                placeholder="Name (e.g., Footwear)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <div className="border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b text-muted-foreground">
            <tr>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Sizes</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 w-24 bg-zinc-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-12 bg-zinc-100 rounded" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-8 w-8 bg-zinc-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              : categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr
                      onClick={() => handleSelectCategory(cat)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50/50 ${
                        selectedCat?.id === cat.id ? 'bg-zinc-100/80' : ''
                      }`}
                    >
                      <td className="p-4 font-medium">{cat.name}</td>
                      <td className="p-4 text-zinc-500">
                        {cat.sizes.length > 0 ? (
                          `${cat.sizes.length} pcs.`
                        ) : (
                          <span className="text-zinc-300">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>

                    {selectedCat?.id === cat.id && (
                      <tr className="bg-zinc-50/50 animate-in slide-in-from-top-1 duration-200">
                        <td colSpan={3} className="p-0 border-b">
                          <div className="p-6 space-y-6 bg-white/50">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
                                Available sizes for {cat.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCat(null);
                                }}
                              >
                                Close
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {allSizes.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => toggleSize(size)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                    selectedSizes.includes(size)
                                      ? 'bg-black text-white border-black shadow-sm'
                                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-4 border-t">
                              <div className="flex gap-2 w-full sm:max-w-xs">
                                <Input
                                  placeholder="Custom size..."
                                  value={customSize}
                                  onChange={(e) => setCustomSize(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomSize();
                                    }
                                  }}
                                  className="bg-white"
                                />
                                <Button
                                  variant="outline"
                                  onClick={handleAddCustomSize}
                                  className="bg-white"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                onClick={handleSaveSizes}
                                disabled={isSavingSizes}
                                className="text-white px-8"
                              >
                                {isSavingSizes ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
