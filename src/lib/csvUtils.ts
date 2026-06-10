import Papa from 'papaparse';
import { buildDataset } from './dataUtils';
import type { Dataset } from '../types';

interface ParseResult {
  dataset: Dataset | null;
  error: string | null;
}

export const parseCsvTextToDataset = (csvText: string, sourceLabel: string): ParseResult => {
  const result = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: 'greedy',
  });

  if (result.errors.length > 0) {
    return {
      dataset: null,
      error: `The CSV could not be parsed: ${result.errors[0]?.message ?? 'Unknown error.'}`,
    };
  }

  const rows = result.data.filter((row) => Object.values(row).some((value) => value !== null && value !== ''));
  if (rows.length === 0) {
    return {
      dataset: null,
      error: 'The uploaded CSV contains no usable rows.',
    };
  }

  return {
    dataset: buildDataset(rows, sourceLabel),
    error: null,
  };
};
