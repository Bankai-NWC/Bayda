'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { deleteColorAction, getColorsAction } from '@/actions/catalog-actions';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Color } from '@/types/product';

import ColorForm from './_components/ColorForm';
import { EditColorPopover } from './_components/EditColorPopover';

export default function ColorsPage() {
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;

  const [colors, setColors] = useState<Color[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchColors = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const data = await getColorsAction(currentPage, 10);
      if ('items' in data) {
        setColors(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors(currentPage);
  }, [currentPage, fetchColors]);

  async function handleDelete() {
    if (!confirmId) return;
    setIsDeleting(true);
    const result = await deleteColorAction(confirmId);
    if (result.success) fetchColors(currentPage);
    setIsDeleting(false);
    setConfirmId(null);
  }

  return (
    <>
      <div className="p-8 pt-0 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between h-10">
          <h1 className="text-2xl font-bold flex items-center gap-3">Colors ({total})</h1>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button className="bg-black hover:bg-zinc-800 text-white w-32">
                {open ? (
                  'Close'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Add Color
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-none shadow-xl">
              <ColorForm
                onSuccess={() => {
                  setOpen(false);
                  fetchColors(currentPage);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b text-muted-foreground uppercase text-[11px]">
              <tr>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Hex Code</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {isLoading && (
                <tr className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <td className="border-none flex items-center justify-center w-full h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  </td>
                </tr>
              )}

              {colors.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-zinc-400">
                    No colors found.
                  </td>
                </tr>
              ) : (
                colors.map((color) => (
                  <tr key={color.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="font-medium">{color.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-zinc-500">{color.hexCode}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <EditColorPopover
                          color={color}
                          onRefresh={() => fetchColors(currentPage)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => setConfirmId(color.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {colors.length} of {total} products
          </p>
          <Pagination page={currentPage} totalPages={totalPages} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && !isDeleting && setConfirmId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete color?"
        description="This will permanently remove the color. Variants using it will lose their color."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
