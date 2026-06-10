import type { ChartType, ColumnMeta, DataRow } from '../types';

type SeriesEntry = Record<string, string | number>;

export const parseNumber = (value: string | number | null): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

export const getAllowedXColumns = (meta: ColumnMeta[], chartType: ChartType): string[] =>
  meta
    .filter((column) => {
      if (chartType === 'scatter') {
        return column.kind === 'numeric' || column.kind === 'year';
      }

      return true;
    })
    .map((column) => column.name);

export const getAllowedYColumns = (meta: ColumnMeta[]): string[] =>
  meta.filter((column) => column.kind === 'numeric').map((column) => column.name);

export const getAllowedGroupColumns = (meta: ColumnMeta[]): string[] =>
  meta.filter((column) => column.kind === 'categorical').map((column) => column.name);

export const buildSeriesData = (
  rows: DataRow[],
  xVariable: string,
  yVariable: string,
  groupVariable: string,
  xMeta: ColumnMeta | undefined,
): SeriesEntry[] => {
  const accumulator = new Map<string, SeriesEntry>();

  rows.forEach((row) => {
    const xValue = row[xVariable] ?? null;
    const yValue = parseNumber(row[yVariable] ?? null);
    if (xValue === null || yValue === null) {
      return;
    }

    const groupValue = groupVariable ? String(row[groupVariable] ?? 'All observations') : 'All observations';
    const key = String(xValue);
    const existing = accumulator.get(key) ?? { x: key, sortValue: typeof xValue === 'number' ? xValue : key };
    const currentSum = typeof existing[`${groupValue}__sum`] === 'number' ? (existing[`${groupValue}__sum`] as number) : 0;
    const currentCount =
      typeof existing[`${groupValue}__count`] === 'number' ? (existing[`${groupValue}__count`] as number) : 0;

    existing[groupValue] = groupValue;
    existing[`${groupValue}__sum`] = currentSum + yValue;
    existing[`${groupValue}__count`] = currentCount + 1;
    accumulator.set(key, existing);
  });

  return Array.from(accumulator.values())
    .map((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key.endsWith('__sum')) {
          const groupKey = key.replace('__sum', '');
          const count = entry[`${groupKey}__count`] as number;
          entry[groupKey] = Number(((entry[key] as number) / count).toFixed(3));
        }
      });
      return entry;
    })
    .sort((left, right) => {
      const leftValue = left.sortValue as string | number;
      const rightValue = right.sortValue as string | number;
      if (xMeta?.kind === 'numeric' || xMeta?.kind === 'year') {
        return Number(leftValue) - Number(rightValue);
      }
      return String(leftValue).localeCompare(String(rightValue));
    });
};

export const buildScatterGroups = (
  rows: DataRow[],
  xVariable: string,
  yVariable: string,
  groupVariable: string,
) => {
  const groups = new Map<string, Array<{ x: number; y: number }>>();

  rows.forEach((row) => {
    const x = parseNumber(row[xVariable] ?? null);
    const y = parseNumber(row[yVariable] ?? null);
    if (x === null || y === null) {
      return;
    }

    const key = groupVariable ? String(row[groupVariable] ?? 'All observations') : 'All observations';
    const points = groups.get(key) ?? [];
    points.push({ x, y });
    groups.set(key, points);
  });

  return Array.from(groups.entries());
};
