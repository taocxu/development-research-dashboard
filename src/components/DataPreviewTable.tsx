import type { DataRow } from '../types';

interface DataPreviewTableProps {
  columns: string[];
  rows: DataRow[];
}

const formatCell = (value: string | number | null) => {
  if (value === null) {
    return 'Missing';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  return value;
};

const DataPreviewTable = ({ columns, rows }: DataPreviewTableProps) => {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">No rows are available for preview.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-max border-separate border-spacing-0 text-left text-[13px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="sticky top-0 border-b border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, index) => (
            <tr key={`preview-${index}`} className="odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/40">
              {columns.map((column) => (
                <td key={`${index}-${column}`} className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                  {formatCell(row[column] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataPreviewTable;
