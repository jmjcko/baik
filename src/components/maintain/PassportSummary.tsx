import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { passportGaps, setupRows } from '@/lib/service/describe';
import type { BikeCare } from '@/types/maintain';
import type { BikeIdentity, FitSummary } from '@/types/service';

interface SummaryProps {
  t: Translations;
  bikeName: string;
  identity: BikeIdentity;
  fit: FitSummary;
  care: BikeCare;
  onCertificate: () => void;
}

const SHOWN = ['crank', 'saddleHeight', 'drivetrain', 'tyres'];

const Row: React.FC<{ label: string; value: string; mono?: boolean; testId: string }> = ({ label, value, mono, testId }) => (
  <div className="flex justify-between gap-3 py-2.5 border-t border-line text-sm" data-testid={testId}>
    <span className="text-ink-3">{label}</span>
    <span className={mono ? 'mono-chip text-xs font-bold text-ink break-all text-right' : 'font-bold text-ink text-right'}>{value}</span>
  </div>
);

const Completeness: React.FC<{ t: Translations; identity: BikeIdentity }> = ({ t, identity }) => {
  const gaps = passportGaps(t.service, identity);
  return (
    <div data-testid="passport-completeness">
      <div className="flex justify-between text-xs font-semibold text-ink-2"><span>{t.service.summary.completeness}</span><span className="mono-chip">{gaps.filled} / {gaps.total}</span></div>
      <div aria-hidden="true" className="h-1.5 rounded-full bg-sunken mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(gaps.filled / gaps.total) * 100}%`, background: 'var(--tone-info-ink)' }} /></div>
      <p className={gaps.missing.length === 0 ? 'text-xs text-tone-success-ink font-semibold mt-2' : 'text-xs text-tone-warning-ink font-semibold mt-2'}>{gaps.missing.length === 0 ? t.service.summary.complete : fill(t.service.summary.missing, { list: gaps.missing.join(', ').toLowerCase() })}</p>
    </div>
  );
};

/** The passport of the bike at a glance, in the left column: the photo, the name, how complete it is, the key numbers and the two buttons. */
export const PassportSummary: React.FC<SummaryProps> = ({ t, bikeName, identity, fit, care, onCertificate }) => {
  const s = t.service.summary;
  const rows = setupRows(t.service, fit, care).filter((row) => SHOWN.includes(row.key));
  const kicker = [identity.make, identity.year].filter((part) => part !== '' && part !== null).join(', ');
  return (
    <SurfaceCard as="section" className="space-y-4" testId="passport-summary">
      {identity.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- a small data URL kept in the browser: there is nothing for the image loader to optimise
        <img src={identity.photo} alt={t.service.passport.photo.alt} data-testid="summary-photo" className="w-full h-44 rounded-xl object-cover border border-line" />
      ) : <div className="h-44 rounded-xl border border-line bg-sunken flex items-center justify-center text-xs font-semibold text-ink-3">{s.noPhoto}</div>}
      <div>
        {kicker !== '' && <p className="text-xs font-semibold text-ink-3">{kicker}</p>}
        <p className="text-2xl font-extrabold tracking-tight text-ink" data-testid="summary-name">{identity.model !== '' ? identity.model : bikeName}</p>
      </div>
      <Completeness t={t} identity={identity} />
      <div>
        <Row testId="summary-serial" label={t.service.passport.serial} value={identity.serial === '' ? '-' : identity.serial} mono />
        <Row testId="summary-insurance" label={t.service.passport.insurance} value={identity.insurance === '' ? '-' : identity.insurance} mono />
        {rows.map((row) => <Row key={row.key} testId={`summary-${row.key}`} label={row.label} value={row.value} />)}
      </div>
      <button type="button" onClick={onCertificate} data-testid="certificate-open" className="h-12 w-full rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"><FileText aria-hidden="true" className="w-4 h-4" />{t.service.certificate.button}</button>
      <p className="flex gap-2 text-xs text-ink-3"><ShieldCheck aria-hidden="true" className="w-4 h-4 shrink-0" />{t.service.garage.storedHere}</p>
    </SurfaceCard>
  );
};
