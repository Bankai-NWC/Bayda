'use client';

import { Layers, Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';

import {
  getCategoriesAction,
  getCollectionsAction,
  getColorsAction,
} from '@/actions/catalog-actions';
import { createProductAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenderSelect } from '@/components/ui/GenderSelect';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Category, Collection, Color, Gender } from '@/types/product';

export default function CreateProductPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createProductAction, {});

  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [selectedGender, setSelectedGender] = useState<string>(Gender.UNISEX);
  const [selectedCollection, setSelectedCollection] = useState('none');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('none');
  const [selectedColor, setSelectedColor] = useState('none');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getCollectionsAction(), getColorsAction(), getCategoriesAction()]).then(
      ([c, co, cats]) => {
        setCollections(c);
        setColors(Array.isArray(co) ? co : co.items || []);
        setCategories(Array.isArray(cats) ? cats : []);
      },
    );
  }, []);

  useEffect(() => {
    if (state.success && state.product) {
      router.push(`/admin/products/${state.product.id}`);
    }
  }, [state.success, state.product, router]);

  const currentCategory = categories.find((c) => c.id.toString() === selectedCategory);

  function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    setSelectedSize('none');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(indexToRemove: number) {
    URL.revokeObjectURL(previews[indexToRemove]);
    setPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));

    if (fileInputRef.current?.files) {
      const dt = new DataTransfer();
      Array.from(fileInputRef.current.files)
        .filter((_, i) => i !== indexToRemove)
        .forEach((f) => dt.items.add(f));
      fileInputRef.current.files = dt.files;
    }
  }

  return (
    <div className="p-8 pt-0 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="gender" value={selectedGender} />
        <input type="hidden" name="categoryId" value={selectedCategory} />
        <input type="hidden" name="collectionId" value={selectedCollection} />
        <input type="hidden" name="colorId" value={selectedColor === 'none' ? '' : selectedColor} />
        <input type="hidden" name="size" value={selectedSize === 'none' ? '' : selectedSize} />

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </label>
              <Input id="name" name="name" required placeholder="e.g. Classic Black Hoodie" />
              {state.errors?.name && (
                <p className="text-destructive text-xs">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Material, fit details..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GenderSelect value={selectedGender} onValueChange={setSelectedGender} />

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Collection
                </label>
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="No collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>First Variant</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium">
                SKU *
              </label>
              <Input id="sku" name="sku" required placeholder="BAY-HD-BLK-01" />
              {state.errors?.sku && (
                <p className="text-destructive text-xs">{state.errors.sku[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">
                Stock
              </label>
              <Input id="stock" name="stock" type="number" defaultValue={0} min={0} />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price *
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
              {state.errors?.price && (
                <p className="text-destructive text-xs">{state.errors.price[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium">
                Sale Price
              </label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              {currentCategory && currentCategory.sizes.length > 0 ? (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No size</SelectItem>
                    {currentCategory.sizes.map((s) => (
                      <SelectItem key={s.id} value={s.size}>
                        {s.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={
                    selectedCategory
                      ? 'No sizes defined for this category'
                      : 'Select category first'
                  }
                  disabled={!selectedCategory || currentCategory?.sizes.length === 0}
                  value={selectedSize === 'none' ? '' : selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value || 'none')}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="No color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {colors.map((co) => (
                    <SelectItem key={co.id} value={co.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ background: co.hexCode }}
                        />
                        {co.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <p className="text-sm text-zinc-500">
              Shared across all variants. Add variant-specific images after creation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {previews.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square border rounded-md overflow-hidden bg-muted group"
                >
                  <Image
                    src={url}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white/80 text-destructive p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-zinc-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-zinc-800 hover:bg-white transition-all"
              >
                <Plus className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium uppercase">Add Photo</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              name="images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {state.errors?.images && (
              <p className="text-destructive text-xs">{state.errors.images[0]}</p>
            )}
          </CardContent>
        </Card>

        {state.serverError && (
          <p className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {state.serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending || !selectedCategory}
          className="w-full h-12 text-md font-semibold bg-black hover:bg-zinc-800"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Product...
            </>
          ) : (
            'Publish Product'
          )}
        </Button>
      </form>
    </div>
  );
}
