'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import { deleteProductAction, getProductAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

import { ConfirmDialog } from '../../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { AddVariantForm } from './_components/AddVariantForm';
import { MaterialsEditor } from './_components/MaterialsEditor';
import { ProductInfoForm } from './_components/ProductInfoForm';
import { SizeChartEditor } from './_components/SizeChartEditor';
import { VariantCard } from './_components/VariantCard';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);

  const [variantFormKey, setVariantFormKey] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getProductAction(productId)
      .then(setProduct)
      .finally(() => setIsLoading(false));
  }, [productId]);

  function handleVariantAdded() {
    getProductAction(productId).then(setProduct);
    setVariantFormKey((prev) => prev + 1);
  }

  function handleVariantDeleted(variantId: number) {
    setProduct((prev) =>
      prev ? { ...prev, variants: prev.variants.filter((v) => v.id !== variantId) } : prev,
    );
  }

  async function handleDeleteProduct() {
    setIsDeleting(true);
    const result = await deleteProductAction(productId);
    if (result.success) {
      router.push('/admin');
    } else {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (isLoading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="p-8 pt-0 space-y-8">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 text-zinc-500 hover:text-black"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to products
        </Button>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Edit Product</h1>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/5 border-zinc-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </div>

      <ProductInfoForm product={product} />
      <SizeChartEditor productId={product.id} />
      <MaterialsEditor productId={product.id} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Variants ({product.variants.length})</h2>

        {product.variants.map((variant, index) => (
          <VariantCard
            key={variant.id}
            index={index}
            product={product}
            productId={productId}
            variant={variant}
            onDelete={handleVariantDeleted}
          />
        ))}

        <AddVariantForm
          key={variantFormKey}
          productId={productId}
          category={product.category}
          onSuccess={handleVariantAdded}
        />
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => !open && !isDeleting && setShowDeleteDialog(false)}
        onConfirm={handleDeleteProduct}
        isLoading={isDeleting}
        title="Delete entire product?"
        description={`This will permanently remove "${product.name}" and all its ${product.variants.length} variants from the catalog. This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
