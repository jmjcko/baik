import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { WireframeGeometry } from './geometry';

interface DimensionProps {
  g: WireframeGeometry;
  t: Translations['studio'];
  coordinates: BikeFitCoordinates;
}

const PILL_FILL = { fill: '#090d16', fillOpacity: '0.92' };

const TealVector: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = (p) => (
  <line {...p} stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 3" markerStart="url(#arrowTealStart)" markerEnd="url(#arrowTeal)" />
);

const StackDimension: React.FC<DimensionProps> = ({ g, t, coordinates }) => (
  <>
    <TealVector x1={g.barSvgX} y1={g.bbY} x2={g.barSvgX} y2={g.barSvgY + 8} />
    <g transform={`translate(${g.barSvgX + 8}, ${(g.bbY + g.barSvgY) / 2 - 12})`}>
      <rect x="0" y="0" width="104" height="24" rx="6" {...PILL_FILL} stroke="#14b8a6" strokeWidth="1" />
      <text x="8" y="16" fill="#14b8a6" fontSize="11" fontFamily="monospace" fontWeight="bold">
        {fill(t.wireframeStack, { value: coordinates.cockpit.stackYMm })}
      </text>
    </g>
  </>
);

const ReachDimension: React.FC<DimensionProps> = ({ g, t, coordinates }) => (
  <>
    <TealVector x1={g.bbX} y1={g.barSvgY} x2={g.barSvgX - 8} y2={g.barSvgY} />
    <g transform={`translate(${(g.bbX + g.barSvgX) / 2 - 55}, ${g.barSvgY - 30})`}>
      <rect x="0" y="0" width="110" height="24" rx="6" {...PILL_FILL} stroke="#14b8a6" strokeWidth="1" />
      <text x="10" y="16" fill="#14b8a6" fontSize="11" fontFamily="monospace" fontWeight="bold">
        {fill(t.wireframeReach, { value: coordinates.cockpit.reachXMm })}
      </text>
    </g>
  </>
);

const SaddleDimension: React.FC<DimensionProps> = ({ g, t, coordinates }) => (
  <>
    <line x1={g.bbX} y1={g.bbY} x2={g.saddleSvgX} y2={g.saddleSvgY} stroke="#00b4d8" strokeWidth="1.8" strokeDasharray="3 3" filter="url(#cyanGlow)" />
    <g transform={`translate(${g.saddleSvgX - 185}, ${Math.max(25, g.saddleSvgY - 42)})`}>
      <rect x="0" y="0" width="180" height="38" rx="6" fill="#090d16" fillOpacity="0.94" stroke="#00b4d8" strokeWidth="1.2" />
      <text x="10" y="17" fill="#f8fafc" fontSize="12" fontFamily="monospace" fontWeight="bold">
        {fill(t.wireframeSaddle, { value: coordinates.saddle.heightAlongTubeMm })}
      </text>
      <text x="10" y="30" fill="#00b4d8" fontSize="9.5" fontFamily="monospace" fontWeight="medium">
        {fill(t.wireframeSetback, { value: coordinates.saddle.setbackXMm })}
      </text>
    </g>
  </>
);

const DatumBadge: React.FC<{ g: WireframeGeometry; label: string }> = ({ g, label }) => (
  <g transform={`translate(${g.bbX - 95}, ${g.bbY + 40})`}>
    <rect x="0" y="0" width="190" height="24" rx="6" {...PILL_FILL} stroke="#334155" strokeWidth="1" />
    <text x="14" y="16" fill="#00b4d8" fontSize="10" fontFamily="monospace" fontWeight="bold">
      {label}
    </text>
  </g>
);

/** Stack, reach, saddle height/setback vectors with their value badges, and the datum badge. */
export const DimensionLayer: React.FC<DimensionProps> = (props) => (
  <>
    <StackDimension {...props} />
    <ReachDimension {...props} />
    <SaddleDimension {...props} />
    <DatumBadge g={props.g} label={props.t.wireframeDatum} />
  </>
);
