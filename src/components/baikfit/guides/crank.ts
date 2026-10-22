import type { GuideConfig } from './types';

export const crankGuide: GuideConfig = {
  type: 'crank',
  testId: 'crank-cad-vector',
  image: { src: '/assets/guides/crank_cad.svg?v=1', altKey: 'crankGuideTitle' },
  markers: [{ id: 'arrowCrank', color: '#b45309' }],
  elements: [
    { type: 'line', x1: 512, y1: 260, x2: 930, y2: 260, stroke: '#b45309', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'line', x1: 512, y1: 780, x2: 930, y2: 780, stroke: '#b45309', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'circle', cx: 512, cy: 260, r: 8, fill: '#b45309', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 512, cy: 260, r: 19, fill: 'none', stroke: '#b45309', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'circle', cx: 512, cy: 780, r: 8, fill: '#b45309', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 512, cy: 780, r: 19, fill: 'none', stroke: '#b45309', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'text', x: 512, y: 180, fill: '#92400e', fontSize: 28, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramCrankSpindle' },
    { type: 'text', x: 512, y: 862, fill: '#92400e', fontSize: 28, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramCrankPedal' },
    { type: 'line', x1: 930, y1: 272, x2: 930, y2: 768, stroke: '#b45309', strokeWidth: 4, markerStart: 'url(#arrowCrankRev)', markerEnd: 'url(#arrowCrank)' },
    { type: 'line', x1: 575, y1: 628, x2: 640, y2: 560, stroke: '#b45309', strokeWidth: 3 },
    { type: 'rect', x: 610, y: 430, width: 300, height: 130, rx: 16, fill: '#ffffff', stroke: '#b45309', strokeWidth: 3 },
    { type: 'text', x: 760, y: 480, fill: '#92400e', fontSize: 30, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramCrankStamp' },
    { type: 'text', x: 760, y: 520, fill: '#475569', fontSize: 20, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramCrankStampSub' },
    { type: 'rect', x: 14, y: 430, width: 340, height: 100, rx: 16, fill: '#ffffff', stroke: '#b45309', strokeWidth: 3 },
    { type: 'text', x: 184, y: 478, fill: '#92400e', fontSize: 30, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramCrankDimLabel' },
    { type: 'text', x: 184, y: 515, fill: '#475569', fontSize: 20, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramCrankDimSub' },
  ],
};
