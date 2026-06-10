import { useEffect, useMemo, useState } from 'react';
import ChartBuilder from './components/ChartBuilder';
import ChartDisplay from './components/ChartDisplay';
import CorrelationMatrix from './components/CorrelationMatrix';
import DataPreviewTable from './components/DataPreviewTable';
import DescriptiveStatsTable from './components/DescriptiveStatsTable';
import SectionCard from './components/SectionCard';
import SummaryCards from './components/SummaryCards';
import { worldBankMetadata } from './data/worldBankMetadata';
import { parseCsvTextToDataset } from './lib/csvUtils';
import { datasetToCsv, descriptiveStatisticsToCsv } from './lib/exportUtils';
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
const badges = ['Static Vite app', 'CSV-ready', 'GitHub Pages', 'Exploratory analysis'];
const limitationNoteZh =
  '本工具用于探索性分析，不用于估计因果效应。正式识别策略、稳健性检验和计量建模应在 Stata、R 或 Python 中完成。';
const correlationNoteZh = '相关系数仅用于描述性展示，并不能识别因果效应。';
const exportNoteZh = '导出在浏览器本地完成，不会把文件传输到任何后端服务。';

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

    const allowedX = chartType === 'scatter' ? [...numericColumns, ...yearColumns] : dataset.columns;

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
  const descriptiveStatistics = useMemo(() => buildDescriptiveStatistics(dataset.rows, dataset.meta), [dataset]);
  const numericColumns = useMemo(() => getNumericColumns(dataset.meta), [dataset.meta]);
  const displayedCorrelationColumns = useMemo(() => numericColumns.slice(0, 10), [numericColumns]);
  const correlationMatrix = useMemo(
    () =>
      buildCorrelationMatrix(dataset.rows, dataset.meta).map((row) => ({
        variable: row.variable,
        ...Object.fromEntries(displayedCorrelationColumns.map((column) => [column, row[column] ?? 'n/a'])),
      })),
    [dataset, displayedCorrelationColumns],
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
    anchor.download = 'descriptive_statistics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentDataset = () => {
    const csv = datasetToCsv(dataset.columns, dataset.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'current_dataset.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleDataset = () => {
    setDataset(createSampleDataset());
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.22em] text-blue-700">Development research dashboard</p>
              <h1 className="mt-3 font-serif text-4xl text-ink">Development Research Dashboard</h1>
              <p className="mt-3 text-lg text-slate-700">
                Explore development, industrial policy, and institutional change datasets.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Upload a CSV file or use the World Bank WDI demo dataset to inspect structure, produce descriptive statistics, build exploratory charts, and export summary outputs.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 lg:max-w-sm">
              <p className="font-medium text-ink">Current dataset</p>
              <p className="mt-1">{dataset.sourceLabel}</p>
              <p className="mt-3 text-xs text-slate-500">Last refreshed</p>
              <p>{worldBankMetadata.lastRefreshed}</p>
            </div>
          </div>
        </header>

        <SectionCard
          title="Dataset controls"
          subtitle="Load the committed World Bank demo data or replace them with a local CSV file."
          actions={
            <>
              <button
                type="button"
                onClick={loadSampleDataset}
                className="rounded-xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Reset to World Bank demo dataset
              </button>
              <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-200">
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
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-800">{worldBankMetadata.sourceNote}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{worldBankMetadata.sourceNoteZh}</p>
                {!worldBankMetadata.institutionalQualityIncluded ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    `GE.EST` could not be fetched reliably from the World Bank endpoint, so `institutional_quality`
                    is omitted from the built-in panel and `policy_intensity` uses `manufacturing_share` plus
                    `export_share` only.
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Rows', summaryMetrics.observations],
                  ['Columns', summaryMetrics.variables],
                  ['Numeric', summaryMetrics.numericVariables],
                  ['Categorical', summaryMetrics.categoricalVariables],
                  ['Missing cells', summaryMetrics.missingCells],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <h3 className="font-serif text-lg text-ink">Source metadata</h3>
              <p className="mt-2 text-sm">{worldBankMetadata.source}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Countries</dt>
                  <dd className="mt-1">{worldBankMetadata.countries.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Years</dt>
                  <dd className="mt-1">
                    {Math.min(...worldBankMetadata.years)} to {Math.max(...worldBankMetadata.years)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Indicator codes</dt>
                  <dd className="mt-1 break-words">{worldBankMetadata.indicatorCodes.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Policy intensity formula</dt>
                  <dd className="mt-1 break-words">{worldBankMetadata.policyIntensityFormula ?? 'Unavailable'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Last refreshed</dt>
                  <dd className="mt-1">{worldBankMetadata.lastRefreshed}</dd>
                </div>
              </dl>
            </div>
          </div>
          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{errorMessage}</div>
          ) : null}
        </SectionCard>

        <SectionCard title="Summary cards" subtitle="Quick structural diagnostics for the currently loaded dataset.">
          <SummaryCards metrics={summaryMetrics} />
        </SectionCard>

        <SectionCard
          title="Chart builder"
          subtitle="Configure the visual mapping first, then inspect the chart in a separate full-width display area."
        >
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

        <SectionCard
          title="Chart display"
          subtitle="Exploratory chart output with a readable legend and enough horizontal space."
        >
          <ChartDisplay
            rows={dataset.rows}
            meta={dataset.meta}
            chartType={chartType}
            xVariable={xVariable}
            yVariable={yVariable}
            groupVariable={groupVariable}
          />
        </SectionCard>

        <SectionCard
          title="Data preview"
          subtitle="First 20 rows of the current dataset. The table scrolls horizontally instead of squeezing other modules."
        >
          <DataPreviewTable columns={dataset.columns} rows={dataset.rows} />
        </SectionCard>

        <SectionCard
          title="Descriptive statistics"
          subtitle="Statistics are computed only for inferred numeric columns."
        >
          <DescriptiveStatsTable rows={descriptiveStatistics} />
        </SectionCard>

        <SectionCard
          title="Correlation matrix"
          subtitle="Pairwise correlations are restricted to inferred numeric columns and displayed for the first 10 numeric variables."
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Correlations are descriptive summaries only. They do not identify causal effects.
            </p>
            <p className="text-xs text-slate-500">{correlationNoteZh}</p>
            <CorrelationMatrix rows={correlationMatrix} columns={displayedCorrelationColumns} />
          </div>
        </SectionCard>

        <SectionCard
          title="Export"
          subtitle="Export the current browser-side summaries and dataset without sending data to a server."
          actions={
            <>
              <button
                type="button"
                onClick={exportStatistics}
                className="rounded-xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Export descriptive_statistics.csv
              </button>
              <button
                type="button"
                onClick={exportCurrentDataset}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Export current_dataset.csv
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Exports are created locally in the browser. No file is transmitted to a backend service.
          </p>
          <p className="mt-2 text-xs text-slate-500">{exportNoteZh}</p>
        </SectionCard>

        <SectionCard
          title="Limitations"
          subtitle="Keep this dashboard for preliminary diagnosis rather than formal identification."
        >
          <p className="text-sm leading-6 text-slate-700">
            This dashboard supports exploratory analysis. It does not estimate causal effects. Formal identification,
            robustness checks, and econometric modelling should be conducted in Stata, R, or Python.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{limitationNoteZh}</p>
        </SectionCard>

        <footer className="pb-6 text-center text-xs text-slate-500">
          Development Research Dashboard | static Vite + React + TypeScript application | GitHub Pages compatible
        </footer>
      </div>
    </div>
  );
};

export default App;
