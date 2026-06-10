import { useEffect, useMemo, useState } from 'react';
import ChartBuilder from './components/ChartBuilder';
import CorrelationMatrix from './components/CorrelationMatrix';
import DataPreviewTable from './components/DataPreviewTable';
import DescriptiveStatsTable from './components/DescriptiveStatsTable';
import SectionCard from './components/SectionCard';
import SummaryCards from './components/SummaryCards';
import { parseCsvTextToDataset } from './lib/csvUtils';
import { descriptiveStatisticsToCsv } from './lib/exportUtils';
import {
  buildCorrelationMatrix,
  buildDescriptiveStatistics,
  buildSummaryMetrics,
  createSampleDataset,
  getCategoricalColumns,
  getNumericColumns,
  getYearColumns,
} from './lib/dataUtils';
import type { ChartType, Dataset } from './types';

const STORAGE_KEY = 'development-research-dashboard-latest-dataset';

const loadInitialDataset = (): Dataset => {
  const fallback = createSampleDataset();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(saved) as Dataset;
    if (Array.isArray(parsed?.rows) && Array.isArray(parsed?.columns) && Array.isArray(parsed?.meta)) {
      return parsed;
    }
  } catch {
    return fallback;
  }

  return fallback;
};

const findDefaultXVariable = (dataset: Dataset, chartType: ChartType): string => {
  const yearColumns = getYearColumns(dataset.meta);
  const numericColumns = getNumericColumns(dataset.meta);

  if (chartType === 'scatter') {
    return numericColumns[0] ?? yearColumns[0] ?? dataset.columns[0] ?? '';
  }

  return yearColumns[0] ?? dataset.columns[0] ?? '';
};

const App = () => {
  const [dataset, setDataset] = useState<Dataset>(() => loadInitialDataset());
  const [errorMessage, setErrorMessage] = useState('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [xVariable, setXVariable] = useState(() => findDefaultXVariable(loadInitialDataset(), 'line'));
  const [yVariable, setYVariable] = useState(() => getNumericColumns(loadInitialDataset().meta)[0] ?? '');
  const [groupVariable, setGroupVariable] = useState(() => getCategoricalColumns(loadInitialDataset().meta)[0] ?? '');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  }, [dataset]);

  useEffect(() => {
    const numericColumns = getNumericColumns(dataset.meta);
    const categoricalColumns = getCategoricalColumns(dataset.meta);
    const yearColumns = getYearColumns(dataset.meta);

    const allowedX =
      chartType === 'scatter'
        ? [...numericColumns, ...yearColumns]
        : dataset.columns;

    if (!allowedX.includes(xVariable)) {
      setXVariable(findDefaultXVariable(dataset, chartType));
    }

    if (!numericColumns.includes(yVariable)) {
      setYVariable(numericColumns[0] ?? '');
    }

    if (groupVariable && !categoricalColumns.includes(groupVariable)) {
      setGroupVariable('');
    }

    if (!groupVariable && categoricalColumns.length > 0) {
      setGroupVariable(categoricalColumns[0]);
    }
  }, [chartType, dataset, groupVariable, xVariable, yVariable]);

  const summaryMetrics = useMemo(() => buildSummaryMetrics(dataset.rows, dataset.meta), [dataset]);
  const descriptiveStatistics = useMemo(
    () => buildDescriptiveStatistics(dataset.rows, dataset.meta),
    [dataset],
  );
  const numericColumns = useMemo(() => getNumericColumns(dataset.meta), [dataset.meta]);
  const correlationMatrix = useMemo(
    () => buildCorrelationMatrix(dataset.rows, dataset.meta),
    [dataset],
  );

  const handleFileUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    setErrorMessage('');
    file
      .text()
      .then((csvText) => {
        const result = parseCsvTextToDataset(csvText, `Uploaded CSV: ${file.name}`);
        if (result.error || !result.dataset) {
          setErrorMessage(result.error ?? 'The CSV could not be parsed.');
          return;
        }

        setDataset(result.dataset);
      })
      .catch((error: Error) => {
        setErrorMessage(`The CSV could not be read: ${error.message}`);
      });
  };

  const exportStatistics = () => {
    const csv = descriptiveStatisticsToCsv(descriptiveStatistics);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'descriptive-statistics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleDataset = () => {
    setDataset(createSampleDataset());
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-card backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-copper">Static research MVP</p>
              <h1 className="mt-3 font-serif text-4xl text-ink">Development Research Dashboard</h1>
              <p className="mt-3 text-base text-slate-700">
                Explore development, industrial policy, and institutional change datasets.
              </p>
            </div>
            <div className="rounded-2xl border border-sand bg-mist px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-ink">Current dataset</p>
              <p>{dataset.sourceLabel}</p>
            </div>
          </div>
        </header>

        <SectionCard
          title="Dataset source"
          subtitle="Load the built-in synthetic panel or replace it with a local CSV file."
          actions={
            <>
              <button
                type="button"
                onClick={loadSampleDataset}
                className="rounded-xl border border-olive bg-olive px-4 py-2 text-sm font-medium text-white transition hover:bg-[#55613f]"
              >
                Load sample data
              </button>
              <label className="cursor-pointer rounded-xl border border-copper bg-white px-4 py-2 text-sm font-medium text-copper transition hover:bg-stone-50">
                Upload CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)}
                />
              </label>
            </>
          }
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              This dashboard is designed for compact exploratory work on country-year, city-year, firm-year, and policy-coding datasets.
            </p>
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{errorMessage}</div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Summary" subtitle="Quick diagnostics for the currently loaded dataset.">
          <SummaryCards metrics={summaryMetrics} />
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <SectionCard title="Data preview" subtitle="First 20 rows of the current dataset.">
            <DataPreviewTable columns={dataset.columns} rows={dataset.rows} />
          </SectionCard>

          <SectionCard title="Chart builder" subtitle="Switch chart type and variables for a simple visual comparison.">
            <ChartBuilder
              rows={dataset.rows}
              meta={dataset.meta}
              chartType={chartType}
              xVariable={xVariable}
              yVariable={yVariable}
              groupVariable={groupVariable}
              onChartTypeChange={setChartType}
              onXVariableChange={setXVariable}
              onYVariableChange={setYVariable}
              onGroupVariableChange={setGroupVariable}
            />
          </SectionCard>
        </div>

        <SectionCard
          title="Descriptive statistics"
          subtitle="Statistics are computed only for inferred numeric columns."
          actions={
            <button
              type="button"
              onClick={exportStatistics}
              className="rounded-xl border border-copper bg-copper px-4 py-2 text-sm font-medium text-white transition hover:bg-[#80482f]"
            >
              Export statistics as CSV
            </button>
          }
        >
          <DescriptiveStatsTable rows={descriptiveStatistics} />
        </SectionCard>

        <SectionCard
          title="Correlation matrix"
          subtitle="Pairwise correlations are restricted to inferred numeric columns."
        >
          <CorrelationMatrix rows={correlationMatrix} columns={numericColumns} />
        </SectionCard>
      </div>
    </div>
  );
};

export default App;
