import type { SummaryMetrics } from '../types';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

const SummaryCards = ({ metrics }: SummaryCardsProps) => {
  const cards = [
    ['Observations', metrics.observations],
    ['Variables', metrics.variables],
    ['Numeric variables', metrics.numericVariables],
    ['Categorical variables', metrics.categoricalVariables],
    ['Missing cells', metrics.missingCells],
    ['Year range', metrics.yearRange],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-4"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
