import React from 'react';
import type { WireframeGeometry } from './geometry';
import { MtbBars } from './MtbBars';

const StemParts: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <polygon
      points={`
                ${g.headtubeTopX - 4},${g.headtubeTopY}
                ${g.headtubeTopX + 6},${g.headtubeTopY}
                ${g.headtubeTopX + 5},${g.headtubeTopY - 10}
                ${g.headtubeTopX - 3},${g.headtubeTopY - 10}
              `}
      fill="#1e293b"
      stroke="#475569"
    />
    <polygon
      points={`
                ${g.headtubeTopX - 2},${g.headtubeTopY - 10}
                ${g.barSvgX - 4},${g.barSvgY + 3}
                ${g.barSvgX + 4},${g.barSvgY - 3}
                ${g.headtubeTopX + 4},${g.headtubeTopY - 16}
              `}
      fill="#1e293b"
      stroke="#14b8a6"
      strokeWidth="1.2"
    />
    <circle cx={g.barSvgX} cy={g.barSvgY} r="5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
  </>
);

const HandlebarCurve: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <path
    d={`
                M ${g.barSvgX - 3} ${g.barSvgY}
                L ${g.barSvgX + 16} ${g.barSvgY - 1}
                C ${g.barSvgX + 26} ${g.barSvgY - 1}, ${g.barSvgX + 32} ${g.barSvgY + 8}, ${g.barSvgX + 28} ${g.barSvgY + 24}
                C ${g.barSvgX + 24} ${g.barSvgY + 36}, ${g.barSvgX + 10} ${g.barSvgY + 44}, ${g.barSvgX - 12} ${g.barSvgY + 42}
              `}
    fill="none"
    stroke="#00b4d8"
    strokeWidth="3.2"
    strokeLinecap="round"
  />
);

const HoodAndLever: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <path
      d={`
                M ${g.barSvgX + 22} ${g.barSvgY + 2}
                C ${g.barSvgX + 30} ${g.barSvgY - 4}, ${g.barSvgX + 38} ${g.barSvgY - 2}, ${g.barSvgX + 34} ${g.barSvgY + 8}
                L ${g.barSvgX + 28} ${g.barSvgY + 18}
              `}
      fill="#0f172a"
      stroke="var(--cad-ink)"
      strokeWidth="1.8"
    />
    <path
      d={`
                M ${g.barSvgX + 33} ${g.barSvgY + 6}
                C ${g.barSvgX + 35} ${g.barSvgY + 18}, ${g.barSvgX + 31} ${g.barSvgY + 28}, ${g.barSvgX + 26} ${g.barSvgY + 34}
              `}
      fill="none"
      stroke="#94a3b8"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
);

const DropBars: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <HandlebarCurve g={g} />
    <HoodAndLever g={g} />
  </>
);

/** Spacers, stem, clamp and handlebar (drop bars, or a flat bar on a mountain bike) positioned from the cockpit reach and stack. */
export const CockpitLayer: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <g id="dynamic-cockpit">
    <StemParts g={g} />
    {g.kind === 'mtb' ? <MtbBars g={g} /> : <DropBars g={g} />}
    <circle cx={g.barSvgX} cy={g.barSvgY} r="2.5" fill="#14b8a6" filter="url(#tealGlow)" />
  </g>
);

/** Bottom bracket datum marker (0,0). */
export const DatumMarker: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <g id="bb-datum">
    <circle cx={g.bbX} cy={g.bbY} r="9" fill="#0f172a" stroke="#00b4d8" strokeWidth="2.5" filter="url(#cyanGlow)" />
    <circle cx={g.bbX} cy={g.bbY} r="3" fill="var(--cad-ink)" />
    <line x1={g.bbX - 14} y1={g.bbY} x2={g.bbX + 14} y2={g.bbY} stroke="#00b4d8" strokeWidth="1" />
    <line x1={g.bbX} y1={g.bbY - 14} x2={g.bbX} y2={g.bbY + 14} stroke="#00b4d8" strokeWidth="1" />
  </g>
);

/** Ground line and the BB horizontal and vertical datum lines. */
export const GroundAndDatumLines: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <line x1="50" y1={g.groundY} x2="750" y2={g.groundY} stroke="#1e293b" strokeWidth="2" strokeDasharray="6 4" />
    <line x1="60" y1={g.bbY} x2="740" y2={g.bbY} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
    <line x1={g.bbX} y1="50" x2={g.bbX} y2={g.groundY + 15} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
  </>
);
