import { describe, expect, it } from 'vitest';
import { sampleDatasetRows } from '../data/sampleDataset';
import { buildDataset } from './dataUtils';
import { buildScatterGroups, buildSeriesData, getAllowedXColumns, getAllowedYColumns } from './chartUtils';

describe('chart utilities', () => {
  it('updates available selector columns by chart type', () => {
    const dataset = buildDataset(sampleDatasetRows, 'Sample');

    const lineXColumns = getAllowedXColumns(dataset.meta, 'line');
    const scatterXColumns = getAllowedXColumns(dataset.meta, 'scatter');
    const yColumns = getAllowedYColumns(dataset.meta);

    expect(lineXColumns).toContain('country');
    expect(scatterXColumns).not.toContain('country');
    expect(yColumns).toContain('gdp_per_capita');
    expect(yColumns).not.toContain('year');
  });

  it('changes aggregated chart data when selectors change', () => {
    const dataset = buildDataset(sampleDatasetRows, 'Sample');
    const yearMeta = dataset.meta.find((column) => column.name === 'year');

    const firstSeries = buildSeriesData(dataset.rows, 'year', 'gdp_per_capita', 'region', yearMeta);
    const secondSeries = buildSeriesData(dataset.rows, 'year', 'export_share', 'region', yearMeta);

    expect(firstSeries).not.toEqual(secondSeries);
  });

  it('creates grouped scatter data only from numeric axes', () => {
    const dataset = buildDataset(sampleDatasetRows, 'Sample');
    const groups = buildScatterGroups(dataset.rows, 'gdp_per_capita', 'export_share', 'region');

    expect(groups.length).toBeGreaterThan(1);
    expect(groups[0]?.[1][0]).toHaveProperty('x');
    expect(groups[0]?.[1][0]).toHaveProperty('y');
  });
});
