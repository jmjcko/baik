import React from 'react';
import type { WireframeGeometry } from './geometry';

const BOLT_ANGLES = [0, 72, 144, 216, 288];

const Chainline: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <line x1={g.bbX} y1={g.bbY + 22} x2={g.rearAxleX} y2={g.axleY + 13} stroke="#475569" strokeWidth="2" strokeDasharray="2 1" />
    <line x1={g.bbX} y1={g.bbY - 22} x2={g.rearAxleX} y2={g.axleY - 13} stroke="#475569" strokeWidth="2" strokeDasharray="2 1" />
  </>
);

const Chainring: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <circle cx={g.bbX} cy={g.bbY} r="25" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
    <circle cx={g.bbX} cy={g.bbY} r="23" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
    {BOLT_ANGLES.map((deg) => (
      <circle
        key={`spider-bolt-${deg}`}
        cx={g.bbX + 16 * Math.cos((deg * Math.PI) / 180)}
        cy={g.bbY + 16 * Math.sin((deg * Math.PI) / 180)}
        r="1.8"
        fill="#00b4d8"
      />
    ))}
  </>
);

const Crank: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <line x1={g.bbX} y1={g.bbY} x2={g.bbX + 38} y2={g.bbY + 22} stroke="var(--cad-crank)" strokeWidth="5.5" strokeLinecap="round" />
    <rect x={g.bbX + 34} y={g.bbY + 19} width="14" height="6" rx="1.5" fill="#0f172a" stroke="#00b4d8" strokeWidth="1.2" />
  </>
);

const RearDerailleur: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <polygon
      points={`
                ${g.rearAxleX},${g.axleY + 8}
                ${g.rearAxleX - 4},${g.axleY + 26}
                ${g.rearAxleX + 8},${g.axleY + 28}
                ${g.rearAxleX + 10},${g.axleY + 12}
              `}
      fill="#1e293b"
      stroke="#64748b"
      strokeWidth="1"
    />
    <circle cx={g.rearAxleX} cy={g.axleY + 16} r="3" fill="#64748b" />
    <circle cx={g.rearAxleX + 4} cy={g.axleY + 26} r="3" fill="#64748b" />
  </>
);

/** Chainline, 54T chainring, crank arm with pedal and rear derailleur. */
export const DrivetrainLayer: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <g id="drivetrain">
    <Chainline g={g} />
    <Chainring g={g} />
    <Crank g={g} />
    <RearDerailleur g={g} />
  </g>
);
