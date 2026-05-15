'use client';

import { ImageIcon, Loader2, Plus, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';

import { addVariantAction } from '@/actions/product-actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ColorSelect } from '@/components/ui/ColorSelect';
import { FormStatus } from '@/components/ui/FormStatus';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, CreateProductFormState } from '@/types/product';

export function AddVariantForm({
  productId,
  category,
  onSuccess,
}: {
  productId: number;
  category: Category;
  onSuccess?: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState('none');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [state, setState] = useState<CreateProductFormState>({});
  const [selectedSize, setSelectedSize] = useState('none');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(previews[i]);
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete('images');
    selectedFiles.forEach((f) => formData.append('images', f));

    startTransition(async () => {
      const result = await addVariantAction(productId, {}, formData);
      setState(result);
      if (result.success) onSuccess?.();
    });
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="add-variant" className="border px-6 bg-white shadow-sm">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            Add variant
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="colorId" value={selectedColor} />
            <input type="hidden" name="size" value={selectedSize === 'none' ? '' : selectedSize} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" placeholder="TSHIRT-BLK-XL" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min={0} defaultValue={0} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input id="salePrice" name="salePrice" type="number" step="0.01" />
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                {category.sizes.length > 0 ? (
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No size</SelectItem>
                      {category.sizes.map((s) => (
                        <SelectItem key={s.id} value={s.size}>
                          {s.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input name="size" placeholder="No sizes defined for this category" disabled />
                )}
              </div>

              <ColorSelect value={selectedColor} onValueChange={setSelectedColor} />

              <div className="col-span-1 md:col-span-2 space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Variant-specific Images
                </Label>

                <div className="flex gap-3 flex-nowrap overflow-x-auto">
                  {previews.map((url, i) => (
                    <div
                      key={url}
                      className="relative w-24 h-24 shrink-0 group rounded-md overflow-hidden bg-white border shadow-sm"
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
                        className="absolute top-1 right-1 bg-white/90 hover:bg-white text-destructive p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 shrink-0 border-2 mr-1 border-dashed border-zinc-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-zinc-800 hover:bg-white transition-all group"
                  >
                    <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-800" />
                    <span className="text-[10px] mt-1 text-zinc-400 font-medium group-hover:text-zinc-800 uppercase">
                      Add photo
                    </span>
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
                  <p className="text-destructive text-xs font-medium">{state.errors.images[0]}</p>
                )}
              </div>
            </div>

            <FormStatus state={state} />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto px-8 bg-black hover:bg-zinc-800 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
