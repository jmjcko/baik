import React from 'react';
import type { FieldAccent } from './SliderField';

const LINK_STYLES: Record<FieldAccent, { button: string; arrow: string }> = {
  blue: { button: 'text-blue-600 hover:text-blue-700', arrow: 'text-blue-500' },
  teal: { button: 'text-teal-700 hover:text-teal-800', arrow: 'text-teal-600' },
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
