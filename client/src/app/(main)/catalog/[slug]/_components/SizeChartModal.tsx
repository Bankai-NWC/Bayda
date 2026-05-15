import { SizeChart } from '@/types/product';

export function SizeChartModal({
  sizeChart,
  onClose,
}: {
  sizeChart: SizeChart;
  onClose: () => void;
}) {
  const measurementNames = Array.from(
    new Set(sizeChart.entries.flatMap((e) => e.measurements.map((m) => m.name))),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Size Chart</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-black text-xl leading-none">
            ×
          </button>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-medium text-zinc-500">Size</th>
              {measurementNames.map((name) => (
                <th key={name} className="text-left py-2 pr-4 font-medium text-zinc-500 capitalize">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeChart.entries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="py-2 pr-4 font-semibold">{entry.size}</td>
                {measurementNames.map((name) => {
                  const m = entry.measurements.find((m) => m.name === name);
                  return (
                    <td key={name} className="py-2 pr-4 text-zinc-600">
                      {m ? `${m.value} ${m.unit}` : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
