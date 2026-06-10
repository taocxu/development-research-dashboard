import { describe, expect, it } from 'vitest';
import { descriptiveStatisticsToCsv } from './exportUtils';

describe('statistics export', () => {
  it('serialises descriptive statistics as CSV with the expected fields', () => {
    const csv = descriptiveStatisticsToCsv([
      {
        column: 'gdp_per_capita',
        mean: 10,
        standardDeviation: 2,
        min: 5,
        median: 9,
        max: 15,
        missingCount: 1,
      },
    ]);

    expect(csv).toContain('column,mean,standard_deviation,min,median,max,missing_count');
    expect(csv).toContain('gdp_per_capita,10,2,5,9,15,1');
  });
});
