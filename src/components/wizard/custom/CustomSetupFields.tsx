import React from 'react';
import { cx } from '@/lib/classNames';
import { CUSTOM_LIMITS, type CustomSetup } from '@/lib/engines/baikfit/customSetup';
import type { Translations } from '@/lib/i18n/translations';
import type { CustomFieldId } from '@/lib/i18n/types/customSetup';
import { MicroGuide } from './MicroGuide';
import { NumberField } from './NumberField';

const CRANK_PRESETS = [165, 170, 172.5, 175];
const LIMITS = { saddleHeight: [600, 900], barRoad: [340, 460], barFlat: [680, 840], crank: [140, 185] } as const;

export interface CustomSetupFieldsProps {
  t: Translations;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  crankLengthMm: number;
  custom: CustomSetup;
  setCurrentSaddleHeightMm: (value: number | null) => void;
  setCurrentBarWidthMm: (value: number | null) => void;
  setCrankLengthMm: (value: number) => void;
  setCustom: (patch: Partial<CustomSetup>) => void;
  /** A mountain bike: the bar is a flat bar with its own range. */
  flatBar?: boolean;
}

type Common = Pick<React.ComponentProps<typeof NumberField>, 'clearLabel' | 'errorText'>;

const Preset: React.FC<{ length: number; selected: boolean; onClick: () => void }> = ({ length, selected, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cx('h-9 px-4 rounded-full text-xs font-semibold border transition-all', selected ? 'bg-blue-600 text-slate-50 border-blue-600' : 'bg-sunken text-ink-2 border-line hover:text-ink')}
  >
    {length} mm
  </button>
);

/** Step 4 of a modified bike: the numbers measured on the real bike, each with its home measuring guide. */
export const CustomSetupFields: React.FC<CustomSetupFieldsProps> = (props) => {
  const texts = props.t.customSetup;
  const common: Common = { clearLabel: texts.clear, errorText: texts.outOfRange };
  const field = (id: CustomFieldId) => ({ id: `custom-${id}`, label: texts.fields[id].label, hint: texts.fields[id].hint, ...common, children: <MicroGuide field={id} texts={texts} /> });
  const custom = (key: keyof CustomSetup) => ({ value: props.custom[key], limits: CUSTOM_LIMITS[key], onChange: (value: number | null) => props.setCustom({ [key]: value }) });
  return (
    <div className="p-5 rounded-2xl border border-line bg-sunken space-y-6" data-testid="custom-setup">
      <div>
        <h3 className="text-lg font-bold text-ink">{texts.title}</h3>
        <p className="text-sm text-ink-2 leading-relaxed">{texts.subtitle}</p>
      </div>
      <NumberField {...field('saddleHeight')} value={props.currentSaddleHeightMm} limits={LIMITS.saddleHeight} onChange={props.setCurrentSaddleHeightMm} />
      <NumberField {...field('saddleSetback')} {...custom('saddleSetbackMm')} />
      <NumberField {...field('barWidth')} value={props.currentBarWidthMm} limits={props.flatBar ? LIMITS.barFlat : LIMITS.barRoad} onChange={props.setCurrentBarWidthMm} />
      <NumberField {...field('stemLength')} {...custom('stemLengthMm')} />
      <NumberField {...field('spacers')} {...custom('spacerStackMm')} />
      <NumberField {...field('drop')} {...custom('saddleToBarDropMm')} />
      <NumberField {...field('crank')} value={props.crankLengthMm} limits={LIMITS.crank} step={2.5} clearable={false} onChange={(value) => value !== null && props.setCrankLengthMm(value)}>
        <div className="flex flex-wrap gap-2">
          {CRANK_PRESETS.map((length) => <Preset key={length} length={length} selected={props.crankLengthMm === length} onClick={() => props.setCrankLengthMm(length)} />)}
        </div>
        <MicroGuide field="crank" texts={texts} />
      </NumberField>
    </div>
  );
};
