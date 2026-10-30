'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useEscape } from '@/lib/hooks/useEscape';
import type { CertificateModel } from '@/lib/service/certificateModel';

interface ModalProps {
  t: Translations;
  model: CertificateModel;
  onPrint: () => void;
  onClose: () => void;
}

const Rows: React.FC<{ rows: CertificateModel['identity'] }> = ({ rows }) => (
  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
    {rows.map((row) => (
      <div key={row.key}>
        <dt className="text-xs text-ink-3">{row.label}</dt>
        <dd className="font-semibold text-ink break-words">{row.value}</dd>
      </div>
    ))}
  </dl>
);

const HistoryBlock: React.FC<{ t: Translations; model: CertificateModel }> = ({ t, model }) => {
  const c = t.service.certificate;
  return (
    <section className="space-y-2" data-testid="certificate-history">
      <h3 className="text-sm font-bold text-ink">{c.historyTitle}</h3>
      {model.history.length === 0 ? <p className="text-sm text-ink-2">{c.empty}</p> : (
        <ul className="space-y-1 text-sm text-ink">
          {model.history.map((row) => <li key={row.key}><span className="mono-chip text-xs text-ink-3">{row.day}</span> {row.work}{row.value && `, ${row.value}`}{row.price && `, ${row.price}`}</li>)}
        </ul>
      )}
      {model.totals.length > 0 && <p className="text-sm font-semibold text-ink">{c.totalLabel}: {model.totals.join(', ')}</p>}
    </section>
  );
};

/** The preview of the certificate with the honesty line, and the button that prints it (the browser offers "Save as PDF"). */
export const ServiceCertificateModal: React.FC<ModalProps> = ({ t, model, onPrint, onClose }) => {
  const c = t.service.certificate;
  useEscape(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="certificate-title" data-testid="certificate-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim print:hidden" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="certificate-title" className="text-lg font-bold text-ink tracking-tight">{c.title}</h2>
            <p className="text-sm text-ink-2 mt-1">{model.generatedOn}</p>
            <p className="text-sm font-semibold text-ink mt-1" data-testid="certificate-honesty">{model.honesty}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={c.close} className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center"><X aria-hidden="true" className="w-4 h-4" /></button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- a small data URL kept in the browser: there is nothing for the image loader to optimise */}
        {model.photo && <img src={model.photo} alt={c.photoAlt} className="max-w-xs rounded-xl border border-line" />}
        <section className="space-y-2"><h3 className="text-sm font-bold text-ink">{c.identityTitle}</h3><Rows rows={model.identity} /></section>
        <section className="space-y-2"><h3 className="text-sm font-bold text-ink">{c.specTitle}</h3><Rows rows={model.spec} /></section>
        <HistoryBlock t={t} model={model} />
        <button type="button" onClick={onPrint} data-testid="certificate-print" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"><Printer aria-hidden="true" className="w-4 h-4" />{c.print}</button>
      </div>
    </div>
  );
};
