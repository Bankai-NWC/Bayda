'use client';

import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { getMaterialsAction, upsertMaterialsAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MaterialRow {
  name: string;
  percentage: string;
}

export function MaterialsEditor({ productId }: { productId: number }) {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMaterialsAction(productId).then((materials) => {
      if (materials.length) {
        setRows(
          materials.map((m) => ({
            name: m.name,
            percentage: String(m.percentage),
          })),
        );
      }
      setIsLoading(false);
    });
  }, [productId]);

  function addRow() {
    setRows((prev) => [...prev, { name: '', percentage: '' }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof MaterialRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);

  function handleSave() {
    setError('');
    const materials = rows
      .filter((r) => r.name.trim() && r.percentage)
      .map((r) => ({ name: r.name.trim(), percentage: Number(r.percentage) }));

    startTransition(async () => {
      const result = await upsertMaterialsAction(productId, materials);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (result.serverError) {
        setError(result.serverError);
      }
    });
  }

  if (isLoading) return <p className="text-sm text-zinc-400">Loading materials...</p>;

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="px-6">
        <CardTitle className="text-xl font-bold uppercase tracking-tight">Composition</CardTitle>
      </CardHeader>

      <CardContent className="px-6 space-y-4">
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                placeholder="Cotton"
                className="flex-1"
              />
              <div className="relative w-28">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={row.percentage}
                  onChange={(e) => updateRow(i, 'percentage', e.target.value)}
                  placeholder="99"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                  %
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(i)}
                className="text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Итого */}
        {rows.length > 0 && (
          <div
            className={`text-sm font-medium ${total === 100 ? 'text-green-600' : 'text-amber-600'}`}
          >
            Total: {total}% {total === 100 ? '✓' : `(${100 - total}% remaining)`}
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={addRow}>
            <Plus className="w-4 h-4 mr-2" /> Add Material
          </Button>

          {rows.length > 0 && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending || total !== 100}
              className="bg-black hover:bg-zinc-800 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}

          {success && <p className="text-green-600 text-sm">Saved ✓</p>}
        </div>
      </CardContent>
    </Card>
  );
}
