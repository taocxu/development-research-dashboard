import * as ss from 'simple-statistics';
import { sampleDatasetRows } from '../data/sampleDataset';
import type {
  ColumnMeta,
  CorrelationRow,
  DataRow,
  Dataset,
  DescriptiveStatistic,
  PrimitiveValue,
  SummaryMetrics,
} from '../types';

const YEAR_LOWER_BOUND = 1800;
const YEAR_UPPER_BOUND = 2100;

const isMissing = (value: PrimitiveValue): boolean =>
  value === null || (typeof value === 'string' && value.trim() === '');

const parseNumericCandidate = (value: PrimitiveValue): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }

    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const normaliseValue = (value: unknown): PrimitiveValue => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }

    return trimmed;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
};

const extractColumns = (rows: DataRow[]): string[] => {
  const seen = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
      }
    });
  });
  return Array.from(seen);
};

const round = (value: number | null, digits = 3): number | null => {
  if (value === null) {
    return null;
  }

  return Number(value.toFixed(digits));
};

export const normaliseRows = (rows: Record<string, unknown>[]): DataRow[] =>
  rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normaliseValue(value)])),
  );

export const inferColumnMeta = (rows: DataRow[], columns: string[]): ColumnMeta[] =>
  columns.map((name) => {
    const values = rows.map((row) => row[name] ?? null).filter((value) => !isMissing(value));
    const numericCandidates = values.map(parseNumericCandidate);
    const allNumeric = values.length > 0 && numericCandidates.every((value) => value !== null);
    const yearLike =
      allNumeric &&
      numericCandidates.every((value) => {
        if (value === null) {
          return false;
        }

        return Number.isInteger(value) && value >= YEAR_LOWER_BOUND && value <= YEAR_UPPER_BOUND;
      });

    if (yearLike || name.toLowerCase() === 'year') {
      return { name, kind: 'year' };
    }

    if (allNumeric) {
      return { name, kind: 'numeric' };
    }

    return { name, kind: 'categorical' };
  });

export const buildDataset = (rows: Record<string, unknown>[], sourceLabel: string): Dataset => {
  const normalisedRows = normaliseRows(rows);
  const columns = extractColumns(normalisedRows);
  const meta = inferColumnMeta(normalisedRows, columns);

  return {
    rows: normalisedRows,
    columns,
    meta,
    sourceLabel,
  };
};

export const createSampleDataset = (): Dataset => buildDataset(sampleDatasetRows, 'Synthetic sample dataset');

export const countMissingCells = (rows: DataRow[]): number =>
  rows.reduce(
    (total, row) =>
      total +
      Object.values(row).reduce<number>((count, value) => count + (isMissing(value) ? 1 : 0), 0),
    0,
  );

export const getNumericColumns = (meta: ColumnMeta[]): string[] =>
  meta.filter((column) => column.kind === 'numeric').map((column) => column.name);

export const getYearColumns = (meta: ColumnMeta[]): string[] =>
  meta.filter((column) => column.kind === 'year').map((column) => column.name);

export const getCategoricalColumns = (meta: ColumnMeta[]): string[] =>
  meta.filter((column) => column.kind === 'categorical').map((column) => column.name);

const getNumericSeries = (rows: DataRow[], column: string): { values: number[]; missingCount: number } => {
  const values: number[] = [];
  let missingCount = 0;

  rows.forEach((row) => {
    const numeric = parseNumericCandidate(row[column] ?? null);
    if (numeric === null) {
      missingCount += 1;
      return;
    }
    values.push(numeric);
  });

  return { values, missingCount };
};

export const buildSummaryMetrics = (rows: DataRow[], meta: ColumnMeta[]): SummaryMetrics => {
  const yearValues = getYearColumns(meta).flatMap((column) =>
    rows
      .map((row) => parseNumericCandidate(row[column] ?? null))
      .filter((value): value is number => value !== null),
  );

  return {
    observations: rows.length,
    variables: meta.length,
    numericVariables: getNumericColumns(meta).length,
    categoricalVariables: getCategoricalColumns(meta).length,
    missingCells: countMissingCells(rows),
    yearRange:
      yearValues.length > 0 ? `${Math.min(...yearValues)} to ${Math.max(...yearValues)}` : 'Unavailable',
  };
};

export const buildDescriptiveStatistics = (
  rows: DataRow[],
  meta: ColumnMeta[],
): DescriptiveStatistic[] =>
  getNumericColumns(meta).map((column) => {
    const { values, missingCount } = getNumericSeries(rows, column);

    if (values.length === 0) {
      return {
        column,
        mean: null,
        standardDeviation: null,
        min: null,
        median: null,
        max: null,
        missingCount,
      };
    }

    return {
      column,
      mean: round(ss.mean(values)),
      standardDeviation: values.length > 1 ? round(ss.sampleStandardDeviation(values)) : null,
      min: round(ss.min(values)),
      median: round(ss.median(values)),
      max: round(ss.max(values)),
      missingCount,
    };
  });

export const buildCorrelationMatrix = (rows: DataRow[], meta: ColumnMeta[]): CorrelationRow[] => {
  const numericColumns = getNumericColumns(meta);

  return numericColumns.map((rowColumn) => {
    const result: CorrelationRow = { variable: rowColumn };

    numericColumns.forEach((column) => {
      const paired = rows
        .map((row) => {
          const left = parseNumericCandidate(row[rowColumn] ?? null);
          const right = parseNumericCandidate(row[column] ?? null);
          return left !== null && right !== null ? [left, right] : null;
        })
        .filter((pair): pair is [number, number] => pair !== null);

      if (paired.length < 2) {
        result[column] = 'n/a';
        return;
      }

      const leftSeries = paired.map(([left]) => left);
      const rightSeries = paired.map(([, right]) => right);
      result[column] = rowColumn === column ? 1 : round(ss.sampleCorrelation(leftSeries, rightSeries)) ?? 'n/a';
    });

    return result;
  });
};
