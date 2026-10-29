import React from 'react';
import { cx } from '@/lib/classNames';
import type { SetupMode } from '@/lib/engines/baikfit/customSetup';
import type { CustomSetupTexts } from '@/lib/i18n/types/customSetup';

interface SetupModeSwitchProps {
  texts: CustomSetupTexts;
  mode: SetupMode;
  onChange: (mode: SetupMode) => void;
}

const MODES: SetupMode[] = ['stock', 'custom'];

/** The segmented switch of step 4: a series bike (the catalog gives the numbers) or a modified bike (the rider measured them). */
export const SetupModeSwitch: React.FC<SetupModeSwitchProps> = ({ texts, mode, onChange }) => {
  const label: Record<SetupMode, string> = { stock: texts.modeStock, custom: texts.modeCustom };
  return (
    <div className="space-y-2" data-testid="setup-mode-switch">
      <span className="text-sm font-semibold text-ink block" id="setup-mode-label">{texts.modeLabel}</span>
      <div role="group" aria-labelledby="setup-mode-label" className="inline-flex p-1 rounded-full bg-sunken border border-line">
        {MODES.map((one) => (
          <button
            key={one}
            type="button"
            aria-pressed={mode === one}
            data-testid={`setup-mode-${one}`}
            onClick={() => mode !== one && onChange(one)}
            className={cx('h-10 px-5 rounded-full text-sm font-semibold transition-colors', mode === one ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink')}
          >
            {label[one]}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-2">{mode === 'stock' ? texts.modeStockHint : texts.modeCustomHint}</p>
    </div>
  );
};
