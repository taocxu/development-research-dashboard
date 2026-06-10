import type { DescriptiveStatistic } from '../types';

interface DescriptiveStatsTableProps {
  rows: DescriptiveStatistic[];
}

const formatNumber = (value: number | null) => (value === null ? 'n/a' : value.toFixed(3));

const DescriptiveStatsTable = ({ rows }: DescriptiveStatsTableProps) => {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">No numeric columns were detected for descriptive statistics.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {['Column', 'Mean', 'Std. dev.', 'Min', 'Median', 'Max', 'Missing'].map((header) => (
              <th
                key={header}
                className="border-b border-stone-200 bg-stone-50 px-3 py-2 font-medium text-slate-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.column} className="odd:bg-white even:bg-stone-50/70">
              <td className="border-b border-stone-100 px-3 py-2 font-medium text-ink">{row.column}</td>
              <td className="border-b border-stone-100 px-3 py-2">{formatNumber(row.mean)}</td>
              <td className="border-b border-stone-100 px-3 py-2">{formatNumber(row.standardDeviation)}</td>
              <td className="border-b border-stone-100 px-3 py-2">{formatNumber(row.min)}</td>
              <td className="border-b border-stone-100 px-3 py-2">{formatNumber(row.median)}</td>
              <td className="border-b border-stone-100 px-3 py-2">{formatNumber(row.max)}</td>
              <td className="border-b border-stone-100 px-3 py-2">{row.missingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DescriptiveStatsTable;
