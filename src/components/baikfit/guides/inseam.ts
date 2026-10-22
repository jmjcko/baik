import type { GuideConfig } from './types';

export const inseamGuide: GuideConfig = {
  type: 'inseam',
  testId: 'inseam-cad-vector',
  image: { src: '/assets/guides/inseam_cad.jpg?v=2', altKey: 'inseamGuideTitle' },
  markers: [
    { id: 'arrowBlueInseam', color: '#2563eb' },
  ],
  elements: [
    { type: 'line', x1: 490, y1: 280, x2: 765, y2: 280, stroke: '#2563eb', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'line', x1: 300, y1: 880, x2: 780, y2: 880, stroke: '#0284c7', strokeWidth: 3.5 },
    { type: 'line', x1: 760, y1: 870, x2: 760, y2: 290, stroke: '#2563eb', strokeWidth: 4, markerStart: 'url(#arrowBlueInseamRev)', markerEnd: 'url(#arrowBlueInseam)' },
    { type: 'rect', x: 610, y: 520, width: 395, height: 110, rx: 16, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 3 },
    { type: 'text', x: 807, y: 566, fill: '#1e3a8a', fontSize: 31, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramInseamDimLabel' },
    { type: 'text', x: 807, y: 607, fill: '#475569', fontSize: 22, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramInseamDimSub' },
  ],
};
