import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { StockBikeSpec } from '@/lib/bikes/types';
import type { CurrentSetup, IntakeValues } from './auditState';
import { BikeNameField } from './BikeNameField';

const Chip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-line bg-surface text-xs text-ink-2">
    {label} <span className="font-semibold text-ink">{value}</span>
  </span>
);

const SetupSummary: React.FC<{ t: Translations; setup: CurrentSetup }> = ({ t, setup }) => {
  const a = t.prePurchaseAudit;
  const parts: Array<[string, number | null | undefined]> = [
    [a.summaryCrank, setup.currentCrankLengthMm],
    [a.summarySaddle, setup.currentSaddleHeightMm],
    [a.summaryBars, setup.currentBarWidthMm],
  ];
  const shown = parts.filter(([, value]) => value);
  if (shown.length === 0) return null;
  return (
    <div data-testid="summary-current-setup" className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-ink-3">{a.summaryCurrentSetup}:</span>
      {shown.map(([label, value]) => <Chip key={label} label={label} value={`${value} mm`} />)}
    </div>
  );
};

/** What the audit knows about the rider, as quiet chips: the rider only needs to see that it is there, and where to change it. */
const RiderSummary: React.FC<{ t: Translations; values: IntakeValues; setup: CurrentSetup; onEdit: () => void }> = ({ t, values, setup, onEdit }) => {
  const a = t.prePurchaseAudit;
  return (
    <div className="p-4 rounded-2xl border border-line bg-sunken flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-2">{a.summaryTitle}</p>
        <div className="flex flex-wrap gap-2">
          <Chip label={a.summaryInseam} value={`${values.inseamMm} mm`} />
          <Chip label={a.summaryHeight} value={`${values.heightCm} cm`} />
          <Chip label={a.summaryTorso} value={`${values.torsoLengthMm} mm`} />
          <Chip label={a.summaryShoulder} value={`${values.acromionWidthMm} mm`} />
        </div>
        <SetupSummary t={t} setup={setup} />
      </div>
      <button type="button" onClick={onEdit} className="h-10 px-4 rounded-full text-sm font-semibold text-accent-ink hover:bg-surface transition-colors">
        {a.editMorphologyButton}
      </button>
    </div>
  );
};

interface SearchStepProps {
  t: Translations;
  values: IntakeValues;
  setup: CurrentSetup;
  bikeModel: string;
  setBikeModel: (value: string) => void;
  /** The bikes of the catalog that the name box suggests from. */
  bikes: readonly StockBikeSpec[];
  /** The geometry of the typed bike: the catalog, a table of the rider, or the request for the pictures of the table. */
  geometrySlot: React.ReactNode;
  /** The audit may run only when the typed bike has geometry. */
  hasGeometry: boolean;
  error: string | null;
  isAnalyzing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const SearchActions: React.FC<Pick<SearchStepProps, 't' | 'isAnalyzing' | 'onBack'> & { canRun: boolean }> = ({ t, isAnalyzing, onBack, canRun }) => (
  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
    <button
      type="button"
      onClick={onBack}
      className="h-12 px-6 rounded-full text-sm font-semibold text-ink-2 border border-line hover:bg-sunken bg-surface transition-colors"
    >
      {t.prePurchaseAudit.backStepButton}
    </button>
    <div className="flex flex-wrap items-center justify-end gap-3">
      {!canRun && !isAnalyzing && <p id="audit-needs" className="text-sm text-ink-3">{t.prePurchaseAudit.chooseToContinue}</p>}
      <button
        type="submit"
        disabled={isAnalyzing || !canRun}
        aria-describedby={canRun ? undefined : 'audit-needs'}
        className="h-12 px-8 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-sunken disabled:text-ink-3 text-slate-50 shadow-md transition-all"
      >
        {isAnalyzing ? t.prePurchaseAudit.runningAuditButton : t.prePurchaseAudit.runAuditButton}
      </button>
    </div>
  </div>
);

export const SearchStep: React.FC<SearchStepProps> = (props) => {
  const { t, values, error, onBack } = props;
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-line bg-surface shadow-sm space-y-6">
        <RiderSummary t={t} values={values} setup={props.setup} onEdit={onBack} />
        <form onSubmit={props.onSubmit} className="space-y-5">
          <BikeNameField t={t} id="bike-model-input" value={props.bikeModel} onChange={props.setBikeModel} bikes={props.bikes} />
          {props.geometrySlot}
          {error && <div className="p-4 rounded-xl border border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink text-sm">{error}</div>}
          <SearchActions t={t} isAnalyzing={props.isAnalyzing} onBack={onBack} canRun={Boolean(props.bikeModel.trim()) && props.hasGeometry} />
        </form>
      </div>
    </div>
  );
};
