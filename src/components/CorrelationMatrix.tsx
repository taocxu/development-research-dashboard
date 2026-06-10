import type { CorrelationRow } from '../types';

interface CorrelationMatrixProps {
  rows: CorrelationRow[];
  columns: string[];
}

const CorrelationMatrix = ({ rows, columns }: CorrelationMatrixProps) => {
  if (rows.length === 0 || columns.length === 0) {
    return <p className="text-sm text-slate-600">At least one numeric column is required to compute correlations.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-stone-200 bg-stone-50 px-3 py-2 font-medium text-slate-700">Variable</th>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-stone-200 bg-stone-50 px-3 py-2 font-medium text-slate-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.variable} className="odd:bg-white even:bg-stone-50/70">
              <td className="border-b border-stone-100 px-3 py-2 font-medium text-ink">{row.variable}</td>
              {columns.map((column) => (
                <td key={`${row.variable}-${column}`} className="border-b border-stone-100 px-3 py-2">
                  {typeof row[column] === 'number' ? (row[column] as number).toFixed(3) : row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationMatrix;
