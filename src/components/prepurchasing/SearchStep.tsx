import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { CurrentSetup, IntakeValues } from './auditState';

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-line bg-sunken text-ink font-mono text-sm focus:outline-none focus:border-blue-600 focus:bg-surface transition-colors';
const FIELD_LABEL = 'text-xs font-mono font-semibold text-ink-2 uppercase tracking-wide block mb-1.5';

interface TextFieldProps {
  id: string;
  label: string;
  type: 'text' | 'url';
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ id, label, type, value, placeholder, onChange, required }) => (
  <div>
    <label htmlFor={id} className={FIELD_LABEL}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
      required={required}
    />
  </div>
);

const SetupSummary: React.FC<{ t: Translations; setup: CurrentSetup }> = ({ t, setup }) => {
  const a = t.prePurchaseAudit;
  const parts = [
    setup.currentCrankLengthMm ? `${a.summaryCrank} ${setup.currentCrankLengthMm}mm` : null,
    setup.currentSaddleHeightMm ? `${a.summarySaddle} ${setup.currentSaddleHeightMm}mm` : null,
    setup.currentBarWidthMm ? `${a.summaryBars} ${setup.currentBarWidthMm}mm` : null,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div data-testid="summary-current-setup" className="text-ink-2 pt-1">
      {a.summaryCurrentSetup}: <span className="text-accent-ink font-bold">{parts.join(' | ')}</span>
    </div>
  );
};

const RiderSummary: React.FC<{ t: Translations; values: IntakeValues; setup: CurrentSetup; onEdit: () => void }> = ({ t, values, setup, onEdit }) => (
  <div className="p-3.5 rounded-xl border border-line bg-sunken flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
    <div>
      <div className="text-ink-2">
        {t.prePurchaseAudit.summaryInseam}: <span className="text-accent-ink font-bold">{values.inseamMm}mm</span> | {t.prePurchaseAudit.summaryHeight}: <span className="text-accent-ink font-bold">{values.heightCm}cm</span> | {t.prePurchaseAudit.summaryTorso}: <span className="text-accent-ink font-bold">{values.torsoLengthMm}mm</span> | {t.prePurchaseAudit.summaryShoulder}: <span className="text-teal-ink font-bold">{values.acromionWidthMm}mm</span>
      </div>
      <SetupSummary t={t} setup={setup} />
    </div>
    <button type="button" onClick={onEdit} className="text-accent-ink hover:underline text-[11px] font-semibold">
      {t.prePurchaseAudit.editMorphologyButton}
    </button>
  </div>
);

interface SearchStepProps {
  t: Translations;
  values: IntakeValues;
  setup: CurrentSetup;
  bikeModel: string;
  setBikeModel: (value: string) => void;
  shopUrl: string;
  setShopUrl: (value: string) => void;
  error: string | null;
  isAnalyzing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const SearchActions: React.FC<Pick<SearchStepProps, 't' | 'isAnalyzing' | 'onBack'> & { canRun: boolean }> = ({ t, isAnalyzing, onBack, canRun }) => (
  <div className="pt-2 flex items-center justify-between">
    <button
      type="button"
      onClick={onBack}
      className="h-12 px-6 rounded-full font-mono text-xs text-ink-2 border border-line hover:bg-sunken bg-surface transition-colors shadow-sm"
    >
      {t.prePurchaseAudit.backStepButton}
    </button>
    <button
      type="submit"
      disabled={isAnalyzing || !canRun}
      className="h-12 px-8 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-sunken disabled:text-ink-3 text-slate-50 shadow-md transition-all"
    >
      {isAnalyzing ? t.prePurchaseAudit.runningAuditButton : t.prePurchaseAudit.runAuditButton}
    </button>
  </div>
);

export const SearchStep: React.FC<SearchStepProps> = (props) => {
  const { t, values, error, onBack } = props;
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-line bg-surface shadow-sm space-y-6">
        <div className="border-b border-line pb-3">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-accent-ink">{t.prePurchaseAudit.step2Heading}</h2>
          <p className="text-xs text-ink-3 mt-0.5">{t.prePurchaseAudit.step2Subtitle}</p>
        </div>
        <RiderSummary t={t} values={values} setup={props.setup} onEdit={onBack} />
        <form onSubmit={props.onSubmit} className="space-y-5">
          <TextField id="bike-model-input" label={t.prePurchaseAudit.bikeModelLabel} type="text" value={props.bikeModel} placeholder={t.prePurchaseAudit.bikeModelPlaceholder} onChange={props.setBikeModel} required />
          <TextField id="bike-url-input" label={t.prePurchaseAudit.bikeUrlLabel} type="url" value={props.shopUrl} placeholder={t.prePurchaseAudit.bikeUrlPlaceholder} onChange={props.setShopUrl} />
          {error && <div className="p-4 rounded-xl border border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink font-mono text-xs">{error}</div>}
          <SearchActions t={t} isAnalyzing={props.isAnalyzing} onBack={onBack} canRun={Boolean(props.bikeModel.trim())} />
        </form>
      </div>
    </div>
  );
};
