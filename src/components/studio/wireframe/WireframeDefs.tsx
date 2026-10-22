import React from 'react';

const ARROW_END = 'M 0 0 L 6 3 L 0 6 z';
const ARROW_START = 'M 6 0 L 0 3 L 6 6 z';

const Glows: React.FC = () => (
  <>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00b4d8" floodOpacity="0.8" />
    </filter>
    <filter id="tealGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#14b8a6" floodOpacity="0.75" />
    </filter>
  </>
);

const Gradients: React.FC = () => (
  <>
    <linearGradient id="carbonRim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="50%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#1e293b" />
    </linearGradient>
    <linearGradient id="aeroFrame" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0%" stopColor="#334155" />
      <stop offset="50%" stopColor="#475569" />
      <stop offset="100%" stopColor="#1e293b" />
    </linearGradient>
  </>
);

const Markers: React.FC = () => (
  <>
    <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d={ARROW_END} fill="#14b8a6" />
    </marker>
    <marker id="arrowTealStart" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
      <path d={ARROW_START} fill="#14b8a6" />
    </marker>
    <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d={ARROW_END} fill="#00b4d8" />
    </marker>
  </>
);

/** Glow filters, carbon and frame gradients and the dimension arrowheads used by the wireframe. */
export const WireframeDefs: React.FC = () => (
  <defs>
    <Glows />
    <Gradients />
    <Markers />
  </defs>
);
