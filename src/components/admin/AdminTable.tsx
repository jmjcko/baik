import React from 'react';

/** The plain table of the admin page: a rounded container that scrolls sideways on a narrow screen, with a header row. */
/** Columns listed in `wideOnly` (by position) are hidden on a narrow screen; the rows show their content in another place. */
export const AdminTable: React.FC<{ heads: string[]; wideOnly?: number[]; testId?: string; children: React.ReactNode }> = ({ heads, wideOnly = [], testId, children }) => (
  <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
    <table className="w-full text-sm" data-testid={testId}>
      <thead className="bg-sunken">
        <tr>{heads.map((head, index) => <th key={head} scope="col" className={`${wideOnly.includes(index) ? 'hidden md:table-cell ' : ''}px-4 py-3 text-left text-xs font-semibold text-ink-3`}>{head}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/** A folded block: the heading with a count is always seen, the table opens with a click. */
export const Fold: React.FC<{ title: string; count: number; hint: string; children: React.ReactNode }> = ({ title, count, hint, children }) => (
  <details className="group rounded-2xl border border-line bg-surface shadow-sm" open={false}>
    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none">
      <span className="text-base font-bold text-ink">{title} ({count})</span>
      <span aria-hidden="true" className="text-ink-3 group-open:hidden">▾</span>
      <span aria-hidden="true" className="text-ink-3 hidden group-open:inline">▴</span>
    </summary>
    <div className="px-5 pb-5 space-y-3">
      <p className="text-sm text-ink-2">{hint}</p>
      {children}
    </div>
  </details>
);
