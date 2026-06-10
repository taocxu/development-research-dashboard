import type { SummaryMetrics } from '../types';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

const SummaryCards = ({ metrics }: SummaryCardsProps) => {
  const cards = [
    ['Observations', metrics.observations, 'Rows currently loaded'],
    ['Variables', metrics.variables, 'Distinct dataset columns'],
    ['Numeric variables', metrics.numericVariables, 'Used for charts and statistics'],
    ['Categorical variables', metrics.categoricalVariables, 'Available for grouping'],
    ['Missing cells', metrics.missingCells, 'Null or empty values across the grid'],
    ['Year range', metrics.yearRange, 'Detected from inferred year fields'],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(([label, value, note]) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
