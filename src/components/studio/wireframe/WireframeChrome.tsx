import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';

export const BlueprintGrid: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="cadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00b4d8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cadGrid)" />
  </svg>
);

export const WireframeHeader: React.FC<{ t: Translations['studio'] }> = ({ t }) => (
  <div className="relative z-10 flex items-center justify-between pointer-events-none">
    <div className="flex items-center gap-2">
      <span className="mono-chip text-[11px] text-cyan-400 font-semibold tracking-wider">{t.wireframeDatumTag}</span>
      <span className="mono-chip text-[11px] text-slate-500 hidden sm:inline-flex">{t.wireframeGeometryTag}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="mono-chip text-[11px] text-teal-400">{t.wireframeRatio}</span>
      <span className="mono-chip text-[11px] text-slate-400 font-bold">{t.wireframeLemond}</span>
    </div>
  </div>
);

export const WireframeFooter: React.FC<{ t: Translations['studio']; coordinates: BikeFitCoordinates }> = ({ t, coordinates }) => {
  const { saddle, cockpit } = coordinates;
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs mono-chip text-slate-400">
      <div>
        <span className="text-slate-500">{t.wireframeOrigin}</span> [0.00, 0.00]
      </div>
      <div>
        <span className="text-slate-500">{t.wireframeSaddleXY}</span> [{saddle.setbackXMm}, {saddle.verticalYMm}] mm
      </div>
      <div>
        <span className="text-slate-500">{t.wireframeCockpitXY}</span> [{cockpit.reachXMm}, {cockpit.stackYMm}] mm
      </div>
    </div>
  );
};
