import type { DescriptiveStatistic } from '../types';

const csvEscape = (value: string | number | null): string => {
  if (value === null) {
    return '';
  }

  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const descriptiveStatisticsToCsv = (rows: DescriptiveStatistic[]): string => {
  const header = ['column', 'mean', 'standard_deviation', 'min', 'median', 'max', 'missing_count'];
  const body = rows.map((row) =>
    [
      row.column,
      row.mean,
      row.standardDeviation,
      row.min,
      row.median,
      row.max,
      row.missingCount,
    ]
      .map(csvEscape)
      .join(','),
  );

  return [header.join(','), ...body].join('\n');
};

export const datasetToCsv = (columns: string[], rows: Array<Record<string, string | number | null>>): string => {
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column] ?? null)).join(','));
  return [columns.join(','), ...body].join('\n');
};
