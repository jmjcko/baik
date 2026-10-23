import React from 'react';

interface PageHeaderProps {
  /** The small monospace line above the title (where the page belongs). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Under the subtitle: chips, a jump navigation. */
  children?: React.ReactNode;
  /** On the right (under the text on a narrow screen): the main buttons of the page. */
  actions?: React.ReactNode;
}

/** The heading of a page in the Aurora design: eyebrow, title, one sentence, and the main actions. The same on every page. */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, subtitle, children, actions }) => (
  <div data-testid="page-header" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    <div className="max-w-3xl">
      {eyebrow && <p className="font-mono text-xs uppercase tracking-wider text-accent-ink">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink mt-1">{title}</h1>
      {subtitle && <p className="text-sm text-ink-2 leading-relaxed mt-2">{subtitle}</p>}
      {children}
    </div>
    {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
  </div>
);
