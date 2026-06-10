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
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-max border-separate border-spacing-0 text-left text-[13px]">
        <thead>
          <tr>
            {['Column', 'Mean', 'Std. dev.', 'Min', 'Median', 'Max', 'Missing'].map((header) => (
              <th
                key={header}
                className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.column} className="odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/30">
              <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-ink">{row.column}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{formatNumber(row.mean)}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{formatNumber(row.standardDeviation)}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{formatNumber(row.min)}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{formatNumber(row.median)}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{formatNumber(row.max)}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">{row.missingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DescriptiveStatsTable;
