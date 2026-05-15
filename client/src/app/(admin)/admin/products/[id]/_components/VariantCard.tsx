'use client';

import { Loader2, Save, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';

import { getColorsAction } from '@/actions/catalog-actions';
import {
  assignVariantImagesAction,
  deleteImageAction,
  deleteVariantAction,
  updateVariantAction,
} from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Color, Product, ProductVariant } from '@/types/product';

import { ConfirmDialog } from '../../../../../../components/ui/ConfirmDialog/ConfirmDialog';

export function VariantCard({
  productId,
  product,
  variant,
  onDelete,
  index,
}: {
  productId: number;
  product: Product;
  variant: ProductVariant;
  onDelete: (id: number) => void;
  index: number;
}) {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [selectedColorId, setSelectedColorId] = useState<string>(
    variant.color?.id?.toString() ?? 'none',
  );
  const [colors, setColors] = useState<Color[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{
    type: 'image' | 'variant';
    id: number;
  } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [assignedImageIds, setAssignedImageIds] = useState<number[]>(
    variant.images.map((vi) => vi.imageId),
  );
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(currentVariant.size ?? 'none');

  const updateAction = updateVariantAction.bind(null, productId, variant.id);
  const [updateState, formAction, isPending] = useActionState(updateAction, {});

  useEffect(() => {
    getColorsAction().then((data) => {
      if (Array.isArray(data)) setColors(data);
    });
  }, []);

  const handleConfirm = async () => {
    if (!confirmConfig) return;
    setIsConfirmLoading(true);

    if (confirmConfig.type === 'image') {
      const res = await deleteImageAction(confirmConfig.id);
      if (res.success) {
        setCurrentVariant((prev) => ({
          ...prev,
          images: prev.images.filter((img) => img.id !== confirmConfig.id),
        }));
      }
    } else {
      const res = await deleteVariantAction(productId, confirmConfig.id);
      if (res.success) onDelete(confirmConfig.id);
    }

    setIsConfirmLoading(false);
    setConfirmConfig(null);
  };

  async function handleToggleImage(imageId: number) {
    setAssignedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId],
    );
  }

  async function handleSaveImages() {
    setIsSavingImages(true);
    await assignVariantImagesAction(productId, variant.id, assignedImageIds);
    setIsSavingImages(false);
  }

  return (
    <>
      <Card className="overflow-hidden border bg-zinc-50/50">
        <CardHeader className="px-6">
          <CardTitle className="text-xl font-bold uppercase tracking-tight">
            Variant - {index + 1}
          </CardTitle>
          <CardDescription>Edit the product variant</CardDescription>
        </CardHeader>
        <CardContent className="px-6 space-y-6">
          <form action={formAction} className="space-y-6">
            <input
              type="hidden"
              name="colorId"
              value={selectedColorId === 'none' ? '' : selectedColorId}
            />
            <input type="hidden" name="size" value={selectedSize === 'none' ? '' : selectedSize} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`sku-${variant.id}`}>SKU *</Label>
                <Input
                  id={`sku-${variant.id}`}
                  name="sku"
                  defaultValue={currentVariant.sku}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`stock-${variant.id}`}>Stock</Label>
                <Input
                  id={`stock-${variant.id}`}
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={currentVariant.stock}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`price-${variant.id}`}>Price *</Label>
                <Input
                  id={`price-${variant.id}`}
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={Number(currentVariant.price)}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`salePrice-${variant.id}`}>Sale Price</Label>
                <Input
                  id={`salePrice-${variant.id}`}
                  name="salePrice"
                  type="number"
                  step="0.01"
                  defaultValue={currentVariant.salePrice ? Number(currentVariant.salePrice) : ''}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Size</Label>
                {product.category.sizes.length > 0 ? (
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No size</SelectItem>
                      {product.category.sizes.map((s) => (
                        <SelectItem key={s.id} value={s.size}>
                          {s.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    name="size"
                    defaultValue={currentVariant.size ?? ''}
                    placeholder="No sizes defined"
                    className="bg-white"
                  />
                )}
              </div>

              {/* Color Select */}
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Select value={selectedColorId} onValueChange={setSelectedColorId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="No color">
                      {selectedColorId !== 'none' && colors.length > 0
                        ? (() => {
                            const c = colors.find((c) => c.id.toString() === selectedColorId);
                            return c ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                  style={{ background: c.hexCode }}
                                />
                                {c.name}
                              </div>
                            ) : null;
                          })()
                        : 'No color'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {colors.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ background: c.hexCode }}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Variant Images</Label>
              <p className="text-xs text-zinc-400">
                Select which product images to show for this variant
              </p>
              <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-9 gap-3">
                  {product.images.map((img) => {
                    const isSelected = assignedImageIds.includes(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleToggleImage(img.id)}
                        className={`relative w-28 h-28 rounded-md overflow-hidden border-2 transition-all ${
                          isSelected ? 'border-black' : 'border-zinc-200 opacity-50'
                        }`}
                      >
                        <Image src={img.url} alt="" fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveImages}
                disabled={isSavingImages}
              >
                {isSavingImages ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save image selection'
                )}
              </Button>
            </div>

            <div className="col-span-full pt-2 flex flex-col gap-4">
              <FormStatus state={updateState} />

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full md:w-auto px-8 bg-black hover:bg-zinc-800 text-white transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmConfig({ type: 'variant', id: variant.id })}
                  disabled={isConfirmLoading}
                  className="text-destructive hover:bg-destructive/5 border-zinc-200"
                >
                  {isConfirmLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmConfig !== null}
        onOpenChange={(open) => !open && setConfirmConfig(null)}
        onConfirm={handleConfirm}
        isLoading={isConfirmLoading}
        title={confirmConfig?.type === 'image' ? 'Delete Image' : 'Delete Variant'}
        description={
          confirmConfig?.type === 'image'
            ? 'Remove this photo from the gallery?'
            : 'Are you sure? All stock and SKU data for this variant will be lost.'
        }
        confirmText="Delete"
      />
    </>
  );
}
