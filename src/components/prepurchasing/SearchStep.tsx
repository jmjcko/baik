import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { CurrentSetup, IntakeValues } from './auditState';

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors';
const FIELD_LABEL = 'text-xs font-mono font-semibold text-slate-700 uppercase tracking-wide block mb-1.5';

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
    <div data-testid="summary-current-setup" className="text-slate-700 pt-1">
      {a.summaryCurrentSetup}: <span className="text-blue-600 font-bold">{parts.join(' | ')}</span>
    </div>
  );
};

const RiderSummary: React.FC<{ t: Translations; values: IntakeValues; setup: CurrentSetup; onEdit: () => void }> = ({ t, values, setup, onEdit }) => (
  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
    <div>
      <div className="text-slate-700">
        {t.prePurchaseAudit.summaryInseam}: <span className="text-blue-600 font-bold">{values.inseamMm}mm</span> | {t.prePurchaseAudit.summaryHeight}: <span className="text-blue-600 font-bold">{values.heightCm}cm</span> | {t.prePurchaseAudit.summaryTorso}: <span className="text-blue-600 font-bold">{values.torsoLengthMm}mm</span> | {t.prePurchaseAudit.summaryShoulder}: <span className="text-teal-600 font-bold">{values.acromionWidthMm}mm</span>
      </div>
      <SetupSummary t={t} setup={setup} />
    </div>
    <button type="button" onClick={onEdit} className="text-blue-600 hover:underline text-[11px] font-semibold">
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
      className="h-12 px-6 rounded-full font-mono text-xs text-slate-700 border border-slate-200 hover:bg-slate-50 bg-white transition-colors shadow-sm"
    >
      {t.prePurchaseAudit.backStepButton}
    </button>
    <button
      type="submit"
      disabled={isAnalyzing || !canRun}
      className="h-12 px-8 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-md transition-all"
    >
      {isAnalyzing ? t.prePurchaseAudit.runningAuditButton : t.prePurchaseAudit.runAuditButton}
    </button>
  </div>
);

export const SearchStep: React.FC<SearchStepProps> = (props) => {
  const { t, values, error, onBack } = props;
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-6">
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-blue-600">{t.prePurchaseAudit.step2Heading}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.prePurchaseAudit.step2Subtitle}</p>
        </div>
        <RiderSummary t={t} values={values} setup={props.setup} onEdit={onBack} />
        <form onSubmit={props.onSubmit} className="space-y-5">
          <TextField id="bike-model-input" label={t.prePurchaseAudit.bikeModelLabel} type="text" value={props.bikeModel} placeholder={t.prePurchaseAudit.bikeModelPlaceholder} onChange={props.setBikeModel} required />
          <TextField id="bike-url-input" label={t.prePurchaseAudit.bikeUrlLabel} type="url" value={props.shopUrl} placeholder={t.prePurchaseAudit.bikeUrlPlaceholder} onChange={props.setShopUrl} />
          {error && <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-mono text-xs">{error}</div>}
          <SearchActions t={t} isAnalyzing={props.isAnalyzing} onBack={onBack} canRun={Boolean(props.bikeModel.trim())} />
        </form>
      </div>
    </div>
  );
};
