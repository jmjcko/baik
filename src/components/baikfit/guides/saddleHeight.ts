import type { GuideConfig } from './types';

export const saddleHeightGuide: GuideConfig = {
  type: 'saddleHeight',
  testId: 'saddle-cad-vector',
  image: { src: '/assets/guides/saddle_cad.svg?v=1', altKey: 'saddleGuideTitle' },
  markers: [{ id: 'arrowSaddle', color: '#0891b2' }],
  elements: [
    { type: 'line', x1: 450, y1: 860, x2: 367, y2: 880, stroke: '#0891b2', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'line', x1: 300, y1: 252, x2: 217, y2: 272, stroke: '#0891b2', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'circle', cx: 450, cy: 860, r: 8, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 450, cy: 860, r: 19, fill: 'none', stroke: '#0891b2', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'circle', cx: 300, cy: 252, r: 8, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 300, cy: 252, r: 19, fill: 'none', stroke: '#0891b2', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'line', x1: 367, y1: 880, x2: 217, y2: 272, stroke: '#0891b2', strokeWidth: 4, markerStart: 'url(#arrowSaddleRev)', markerEnd: 'url(#arrowSaddle)' },
    { type: 'text', x: 450, y: 962, fill: '#155e75', fontSize: 28, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramSaddleBB' },
    { type: 'text', x: 300, y: 172, fill: '#155e75', fontSize: 26, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramSaddlePoint' },
    { type: 'rect', x: 590, y: 70, width: 410, height: 110, rx: 16, fill: '#ffffff', stroke: '#0891b2', strokeWidth: 3 },
    { type: 'text', x: 795, y: 118, fill: '#155e75', fontSize: 30, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramSaddleDimLabel' },
    { type: 'text', x: 795, y: 156, fill: '#475569', fontSize: 20, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramSaddleDimSub' },
  ],
};
