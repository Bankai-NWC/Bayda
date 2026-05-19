'use client';

import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { getSizeChartAction, upsertSizeChartAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MeasurementRow {
  name: string;
  value: string;
  unit: string;
}

interface SizeRow {
  size: string;
  measurements: MeasurementRow[];
}

const DEFAULT_MEASUREMENTS = ['chest', 'front length', 'sleeve length', 'back width', 'arm width'];

export function SizeChartEditor({ productId }: { productId: number }) {
  const [rows, setRows] = useState<SizeRow[]>([]);
  const [measurementNames, setMeasurementNames] = useState<string[]>(DEFAULT_MEASUREMENTS);
  const [newMeasurementName, setNewMeasurementName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSizeChartAction(productId).then((chart) => {
      if (chart?.entries.length) {
        const names = [...new Set(chart.entries.flatMap((e) => e.measurements.map((m) => m.name)))];
        setMeasurementNames(names);

        setRows(
          chart.entries.map((entry) => ({
            size: entry.size,
            measurements: names.map((name) => {
              const m = entry.measurements.find((m) => m.name === name);
              return { name, value: m ? String(m.value) : '', unit: m?.unit ?? 'cm' };
            }),
          })),
        );
      }
      setIsLoading(false);
    });
  }, [productId]);

  function addSize() {
    setRows((prev) => [
      ...prev,
      {
        size: '',
        measurements: measurementNames.map((name) => ({ name, value: '', unit: 'cm' })),
      },
    ]);
  }

  function removeSize(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSize(index: number, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, size: value } : row)));
  }

  function updateMeasurement(rowIndex: number, measurementIndex: number, value: string) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;
        return {
          ...row,
          measurements: row.measurements.map((m, j) =>
            j === measurementIndex ? { ...m, value } : m,
          ),
        };
      }),
    );
  }

  function addMeasurement() {
    if (!newMeasurementName.trim()) return;
    const name = newMeasurementName.trim().toLowerCase();
    if (measurementNames.includes(name)) return;

    setMeasurementNames((prev) => [...prev, name]);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        measurements: [...row.measurements, { name, value: '', unit: 'cm' }],
      })),
    );
    setNewMeasurementName('');
  }

  function removeMeasurement(nameToRemove: string) {
    setMeasurementNames((prev) => prev.filter((n) => n !== nameToRemove));
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        measurements: row.measurements.filter((m) => m.name !== nameToRemove),
      })),
    );
  }

  function handleSave() {
    const entries = rows
      .filter((row) => row.size.trim())
      .map((row) => ({
        size: row.size.trim(),
        measurements: row.measurements
          .filter((m) => m.value !== '')
          .map((m) => ({
            name: m.name,
            value: Number(m.value),
            unit: m.unit,
          })),
      }));

    startTransition(async () => {
      const result = await upsertSizeChartAction(productId, entries);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  if (isLoading) return <p className="text-sm text-zinc-400">Loading size chart...</p>;

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="px-6">
        <CardTitle className="text-xl font-bold uppercase tracking-tight">Size Chart</CardTitle>
      </CardHeader>

      <CardContent className="px-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Measurements</p>
          <div className="flex flex-wrap gap-2">
            {measurementNames.map((name) => (
              <div
                key={name}
                className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded text-sm"
              >
                <span className="capitalize">{name}</span>
                <button
                  type="button"
                  onClick={() => removeMeasurement(name)}
                  className="text-zinc-400 hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMeasurementName}
              onChange={(e) => setNewMeasurementName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMeasurement())}
              placeholder="e.g. chest, waist, length..."
              className="h-8 text-sm"
            />
            <Button type="button" onClick={addMeasurement} variant="outline" size="sm">
              Add
            </Button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left px-3 py-2 border font-medium">Size</th>
                  {measurementNames.map((name) => (
                    <th key={name} className="text-left px-3 py-2 border font-medium capitalize">
                      {name} (cm)
                    </th>
                  ))}
                  <th className="px-3 py-2 border" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-zinc-50">
                    <td className="px-2 py-1 border">
                      <Input
                        value={row.size}
                        onChange={(e) => updateSize(rowIndex, e.target.value)}
                        placeholder="XS"
                        className="h-8 w-20 text-center"
                      />
                    </td>
                    {row.measurements.map((m, mIndex) => (
                      <td key={m.name} className="px-2 py-1 border">
                        <Input
                          type="number"
                          value={m.value}
                          onChange={(e) => updateMeasurement(rowIndex, mIndex, e.target.value)}
                          placeholder="0"
                          className="h-8 w-24"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1 border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSize(rowIndex)}
                        className="text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={addSize}>
            <Plus className="w-4 h-4 mr-2" /> Add Size
          </Button>

          {rows.length > 0 && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
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
                  Save Chart
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
