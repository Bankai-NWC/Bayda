'use client';

import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

import { createColorAction, updateColorAction } from '@/actions/catalog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Color } from '@/types/product';

interface ColorFormProps {
  initialData?: Color;
  onSuccess?: () => void;
}

export default function ColorForm({ initialData, onSuccess }: ColorFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [hexCode, setHexCode] = useState(initialData?.hexCode || '#000000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hexCode) return;

    setIsSubmitting(true);

    const result = isEditing
      ? await updateColorAction(initialData.id, name, hexCode)
      : await createColorAction(name, hexCode);

    if (result.success) {
      onSuccess?.();
    } else {
      alert(result.error || 'Error saving color');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h4 className="font-medium leading-none">{isEditing ? 'Edit color' : 'Add new color'}</h4>
        <p className="text-sm text-muted-foreground">
          {isEditing ? 'Change name or hex code' : 'Enter details for the new color'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Midnight Blue"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-hex">Color Picker</Label>
          <div className="flex gap-2">
            <input
              id="edit-hex"
              type="color"
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value.toUpperCase())}
              className="w-10 h-10 cursor-pointer rounded border p-1"
            />
            <Input
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value.toUpperCase())}
              maxLength={7}
              className="font-mono"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </form>
    </div>
  );
}
