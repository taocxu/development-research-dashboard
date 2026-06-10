import { describe, expect, it } from 'vitest';
import { sampleDatasetRows } from '../data/sampleDataset';
import {
  buildCorrelationMatrix,
  buildDataset,
  buildDescriptiveStatistics,
  countMissingCells,
  inferColumnMeta,
  normaliseRows,
} from './dataUtils';

describe('data utilities', () => {
  it('infers numeric, categorical, and year-like columns from the sample dataset', () => {
    const rows = normaliseRows(sampleDatasetRows);
    const columns = Object.keys(rows[0] ?? {});
    const meta = inferColumnMeta(rows, columns);

    expect(meta.find((item) => item.name === 'year')?.kind).toBe('year');
    expect(meta.find((item) => item.name === 'country')?.kind).toBe('categorical');
    expect(meta.find((item) => item.name === 'gdp_per_capita')?.kind).toBe('numeric');
  });

  it('limits descriptive statistics and correlations to numeric columns', () => {
    const dataset = buildDataset(sampleDatasetRows, 'Sample');
    const statistics = buildDescriptiveStatistics(dataset.rows, dataset.meta);
    const correlations = buildCorrelationMatrix(dataset.rows, dataset.meta);

    expect(statistics.every((row) => row.column !== 'country' && row.column !== 'region')).toBe(true);
    expect(correlations.every((row) => row.variable !== 'country')).toBe(true);
    expect(correlations[0]).toHaveProperty('gdp_per_capita');
  });

  it('counts missing cells across the dataset', () => {
    const rows = normaliseRows([
      { year: 2020, country: 'A', gdp_per_capita: 10 },
      { year: 2021, country: '', gdp_per_capita: null },
    ]);

    expect(countMissingCells(rows)).toBe(2);
  });
});
