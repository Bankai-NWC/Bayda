'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { createCollectionAction } from '@/actions/catalog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CollectionFormProps {
  onSuccess: () => void;
}

export default function CollectionForm({ onSuccess }: CollectionFormProps) {
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    const result = await createCollectionAction(name);
    setIsPending(false);

    if (result.success) {
      setName('');
      onSuccess();
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white">
      <div className="space-y-2">
        <label className="text-sm font-medium">Collection Name</label>
        <Input
          placeholder="e.g. Summer 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-black text-white"
        disabled={isPending || !name.trim()}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
      </Button>
    </form>
  );
}
