import type { PropsWithChildren, ReactNode } from 'react';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const SectionCard = ({ title, subtitle, actions, children }: SectionCardProps) => (
  <section className="rounded-2xl border border-stone-200 bg-white/90 p-5 shadow-card backdrop-blur">
    <div className="mb-4 flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
    {children}
  </section>
);

export default SectionCard;
