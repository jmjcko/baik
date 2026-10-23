import React from 'react';
import type { FieldAccent } from './SliderField';

const LINK_STYLES: Record<FieldAccent, { button: string; arrow: string }> = {
  blue: { button: 'text-accent-ink hover:text-tone-info-ink', arrow: 'text-accent-ink' },
  teal: { button: 'text-teal-ink hover:text-teal-ink', arrow: 'text-teal-ink' },
};

interface GuideTriggerProps {
  testId: string;
  label: string;
  onClick: () => void;
  accent?: FieldAccent;
}

/** Link-style button that opens a measurement guide modal. */
export const GuideTrigger: React.FC<GuideTriggerProps> = ({ testId, label, onClick, accent = 'blue' }) => (
  <div className="pt-2">
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors py-1 focus:outline-none ${LINK_STYLES[accent].button}`}
    >
      <span>{label}</span>
      <span className={`font-mono text-xs ${LINK_STYLES[accent].arrow}`}>↗</span>
    </button>
  </div>
);
