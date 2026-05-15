'use client';

import { ImageIcon, Layers, Loader2, Plus, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';

import { getCollectionsAction } from '@/actions/catalog-actions';
import {
  addProductImagesAction,
  deleteProductImageAction,
  getProductAction,
  updateProductAction,
} from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field';
import { FormStatus } from '@/components/ui/FormStatus';
import { GenderSelect } from '@/components/ui/GenderSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collection, Product } from '@/types/product';

import { ConfirmDialog } from '../../../../../../components/ui/ConfirmDialog/ConfirmDialog';

export function ProductInfoForm({ product }: { product: Product }) {
  const action = updateProductAction.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(action, {});

  const [collections, setCollections] = useState<Collection[]>([]);

  const [productImages, setProductImages] = useState(product.images ?? []);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedGender, setSelectedGender] = useState<string>(product.gender);
  const [selectedCollection, setSelectedCollection] = useState(
    product.collectionId?.toString() ?? 'none',
  );

  const [confirmImageId, setConfirmImageId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getCollectionsAction()]).then(([c]) => {
      setCollections(c);
    });
  }, []);

  async function handleAddProductImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));

    const result = await addProductImagesAction(product.id, formData);
    if (result.success) {
      const updated = await getProductAction(product.id);
      setProductImages(updated.images ?? []);
    }
    setIsUploading(false);
  }

  async function handleDeleteImage() {
    if (!confirmImageId) return;
    setIsDeleting(true);
    const result = await deleteProductImageAction(confirmImageId);
    if (result.success) {
      setProductImages((prev) => prev.filter((img) => img.id !== confirmImageId));
    }
    setIsDeleting(false);
    setConfirmImageId(null);
  }

  return (
    <>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="px-6">
          <CardTitle className="text-xl font-bold uppercase tracking-tight">
            Basic Information
          </CardTitle>
          <CardDescription>Edit the product title and description</CardDescription>
        </CardHeader>

        <CardContent className="px-6 space-y-6">
          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product.name}
                  required
                  placeholder="Enter a name"
                  className="focus-visible:ring-black transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product.description ?? ''}
                  rows={5}
                  placeholder="Describe the product details..."
                  className="resize-none focus-visible:ring-black transition-all"
                />
              </div>
              {state.serverError && <FieldError>{state.serverError}</FieldError>}

              <GenderSelect value={selectedGender} onValueChange={setSelectedGender} />
              <input type="hidden" name="gender" value={selectedGender} />

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Collection
                </label>
                <div className="flex items-center gap-2">
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger className="focus:ring-black bg-white  w-[124px]">
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
                  <input type="hidden" name="collectionId" value={selectedCollection} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Product Images *
                <span className="text-zinc-400 font-normal text-xs">
                  (shared across all variants)
                </span>
              </Label>

              <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-9 gap-3">
                  {productImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-28 h-28 group rounded-md overflow-hidden bg-white border shadow-sm"
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      {img.isMain && (
                        <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white/90 hover:bg-white text-destructive p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setConfirmImageId(img.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-28 h-28 border-2 border-dashed border-zinc-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-zinc-800 hover:bg-white transition-all group">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-800" />
                        <span className="text-[10px] mt-1 text-zinc-400 font-medium group-hover:text-zinc-800 uppercase">
                          Add photo
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddProductImages}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <FormStatus state={state} />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-fit px-8 bg-black hover:bg-zinc-800 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmImageId !== null}
        onOpenChange={(open) => !open && !isDeleting && setConfirmImageId(null)}
        onConfirm={handleDeleteImage}
        isLoading={isDeleting}
        title="Delete image?"
        description="This will permanently remove the image from the product."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
