import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { RidingStyle } from '@/types/baikfit';
import { ChoiceCard } from './fields/ChoiceCard';
import { PostureSilhouette } from './PostureSilhouette';

const STYLE_OPTIONS = [
  { value: 'endurance', title: 'ridingStyleEnduranceTitle', description: 'ridingStyleEnduranceDesc' },
  { value: 'balanced', title: 'ridingStyleBalancedTitle', description: 'ridingStyleBalancedDesc' },
  { value: 'race', title: 'ridingStyleRaceTitle', description: 'ridingStyleRaceDesc' },
] as const;

interface RidingStylePickerProps {
  t: Translations;
  value: RidingStyle;
  onChange: (style: RidingStyle) => void;
}

/** Riding posture selector: one card per style with its rider silhouette and back angle. */
export const RidingStylePicker: React.FC<RidingStylePickerProps> = ({ t, value, onChange }) => (
  <div className="space-y-3">
    <label className="text-xs font-mono font-semibold text-ink-2 uppercase tracking-wide block">
      {t.studio.ridingStyleLabel}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {STYLE_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          selected={value === option.value}
          title={t.wizard[option.title]}
          description={t.wizard[option.description]}
          visual={<PostureSilhouette style={option.value} />}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </div>
  </div>
);
