import { describe, expect, it } from 'vitest';
import { parseCsvTextToDataset } from './csvUtils';

describe('csv parsing', () => {
  it('parses uploaded CSV text into a dataset with inferred numeric and year columns', () => {
    const csv = [
      'country,year,region,gdp_per_capita,industrial_share',
      'Ghana,2018,West Africa,2200,24.1',
      'Kenya,2020,East Africa,1838,17.8',
    ].join('\n');

    const result = parseCsvTextToDataset(csv, 'Uploaded CSV: test.csv');

    expect(result.error).toBeNull();
    expect(result.dataset?.rows).toHaveLength(2);
    expect(result.dataset?.meta.find((column) => column.name === 'year')?.kind).toBe('year');
    expect(result.dataset?.meta.find((column) => column.name === 'gdp_per_capita')?.kind).toBe('numeric');
  });
});
