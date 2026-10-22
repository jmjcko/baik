import type { GuideConfig } from './types';

export const barWidthGuide: GuideConfig = {
  type: 'barWidth',
  testId: 'bar-cad-vector',
  image: { src: '/assets/guides/bar_cad.svg?v=1', altKey: 'barGuideTitle' },
  markers: [{ id: 'arrowBar', color: '#be185d' }],
  elements: [
    { type: 'line', x1: 240, y1: 500, x2: 240, y2: 230, stroke: '#be185d', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'line', x1: 784, y1: 500, x2: 784, y2: 230, stroke: '#be185d', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'circle', cx: 240, cy: 500, r: 8, fill: '#be185d', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 240, cy: 500, r: 19, fill: 'none', stroke: '#be185d', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'circle', cx: 784, cy: 500, r: 8, fill: '#be185d', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 784, cy: 500, r: 19, fill: 'none', stroke: '#be185d', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'line', x1: 248, y1: 250, x2: 776, y2: 250, stroke: '#be185d', strokeWidth: 4, markerStart: 'url(#arrowBarRev)', markerEnd: 'url(#arrowBar)' },
    { type: 'rect', x: 212, y: 760, width: 600, height: 110, rx: 16, fill: '#ffffff', stroke: '#be185d', strokeWidth: 3 },
    { type: 'text', x: 512, y: 808, fill: '#9d174d', fontSize: 30, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramBarDimLabel' },
    { type: 'text', x: 512, y: 846, fill: '#475569', fontSize: 20, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramBarDimSub' },
  ],
};
