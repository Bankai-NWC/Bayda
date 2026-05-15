'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { deleteCollectionAction, getCollectionsAction } from '@/actions/catalog-actions';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Collection } from '@/types/product';

import CollectionForm from './_components/CollectionForm';

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchCollections = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getCollectionsAction();

      if (Array.isArray(data)) {
        setCollections(data);
        setTotal(data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections(currentPage);
  }, [currentPage, fetchCollections]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this collection?')) return;
    const result = await deleteCollectionAction(id);
    if (result.success) {
      fetchCollections(currentPage);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="p-8 pt-0 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between h-10">
        <h1 className="text-2xl font-bold flex items-center gap-3">Collections ({total})</h1>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="bg-black hover:bg-zinc-800 text-white w-40">
              {open ? (
                'Close'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Collection
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-none shadow-xl">
            <CollectionForm
              onSuccess={() => {
                setOpen(false);
                fetchCollections(currentPage);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b text-muted-foreground uppercase text-[11px]">
            <tr>
              <th className="p-4 text-left font-semibold">Collection Name</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {isLoading && (
              <tr className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <td colSpan={2} className="flex items-center justify-center w-full h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </td>
              </tr>
            )}

            {collections.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={2} className="p-12 text-center text-zinc-400">
                  No collections found.
                </td>
              </tr>
            ) : (
              collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="p-4">
                    <span className="font-medium text-zinc-900">{collection.name}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(collection.id)}
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
        <p className="text-sm text-zinc-500">Showing {collections.length} collections</p>
        {totalPages > 1 && <Pagination page={currentPage} totalPages={totalPages} />}
      </div>
    </div>
  );
}
