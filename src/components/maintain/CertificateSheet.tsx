import React from 'react';
import type { CertificateModel } from '@/lib/service/certificateModel';
import type { Translations } from '@/lib/i18n/translations';

const Rows: React.FC<{ rows: CertificateModel['identity'] }> = ({ rows }) => (
  <dl className="print-measures">
    {rows.map((row) => (
      <div key={row.key}>
        <dt>{row.label}</dt>
        <dd>{row.value}</dd>
      </div>
    ))}
  </dl>
);

const History: React.FC<{ t: Translations; model: CertificateModel }> = ({ t, model }) => {
  const c = t.service.certificate;
  if (model.history.length === 0) return <p>{c.empty}</p>;
  return (
    <table className="print-table">
      <thead>
        <tr><th>{c.columns.day}</th><th>{c.columns.work}</th><th>{c.columns.value}</th><th>{c.columns.price}</th><th>{c.columns.warranty}</th></tr>
      </thead>
      <tbody>
        {model.history.map((row) => (
          <tr key={row.key}><td>{row.day}</td><td>{row.work}</td><td>{row.value}</td><td>{row.price}</td><td>{row.warranty}</td></tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * The certificate on paper. It exists in the page but is visible only when printing, and the paper is always light (see `.print-sheet` in globals.css).
 * The same model fills the preview in the dialog.
 */
export const CertificateSheet: React.FC<{ t: Translations; model: CertificateModel }> = ({ t, model }) => {
  const c = t.service.certificate;
  return (
    <section data-testid="certificate-sheet" aria-hidden="true" className="print-sheet">
      <header className="print-head">
        <h1>{model.title}</h1>
        <p>{model.generatedOn}</p>
        <p><strong>{model.honesty}</strong></p>
      </header>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small data URL kept in the browser: there is nothing for the image loader to optimise */}
      {model.photo && <img src={model.photo} alt={c.photoAlt} style={{ maxWidth: '70mm', maxHeight: '50mm', marginTop: '10pt' }} />}
      <h2>{c.identityTitle}</h2>
      <Rows rows={model.identity} />
      <h2>{c.specTitle}</h2>
      <Rows rows={model.spec} />
      <h2>{c.historyTitle}</h2>
      <History t={t} model={model} />
      {model.totals.length > 0 && <p className="print-note">{c.totalLabel}: {model.totals.join(', ')}</p>}
    </section>
  );
};
