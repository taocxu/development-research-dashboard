export type PrimitiveValue = string | number | null;
export type DataRow = Record<string, PrimitiveValue>;

export type ColumnKind = 'numeric' | 'categorical' | 'year';

export interface ColumnMeta {
  name: string;
  kind: ColumnKind;
}

export interface Dataset {
  rows: DataRow[];
  columns: string[];
  meta: ColumnMeta[];
  sourceLabel: string;
}

export interface SummaryMetrics {
  observations: number;
  variables: number;
  numericVariables: number;
  categoricalVariables: number;
  missingCells: number;
  yearRange: string;
}

export interface DescriptiveStatistic {
  column: string;
  mean: number | null;
  standardDeviation: number | null;
  min: number | null;
  median: number | null;
  max: number | null;
  missingCount: number;
}

export interface CorrelationRow {
  variable: string;
  [key: string]: string | number;
}

export type ChartType = 'line' | 'bar' | 'scatter';
