import type { GuideConfig } from './types';

export const acromionGuide: GuideConfig = {
  type: 'acromion',
  testId: 'acromion-cad-vector',
  image: { src: '/assets/guides/acromion_cad.jpg?v=1', altKey: 'acromionGuideTitle' },
  markers: [
    { id: 'arrowAcroBlue', color: '#2563eb' },
  ],
  elements: [
    { type: 'line', x1: 312, y1: 172, x2: 312, y2: 108, stroke: '#2563eb', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'line', x1: 712, y1: 172, x2: 712, y2: 108, stroke: '#2563eb', strokeWidth: 2.5, strokeDasharray: '6 5' },
    { type: 'circle', cx: 312, cy: 172, r: 8, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 312, cy: 172, r: 19, fill: 'none', stroke: '#2563eb', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'text', x: 312, y: 68, fill: '#1d4ed8', fontSize: 29, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramAcromionLeft' },
    { type: 'circle', cx: 712, cy: 172, r: 8, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 712, cy: 172, r: 19, fill: 'none', stroke: '#2563eb', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'text', x: 712, y: 68, fill: '#1d4ed8', fontSize: 29, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', stroke: '#ffffff', strokeWidth: 7, paintOrder: 'stroke', textKey: 'diagramAcromionRight' },
    { type: 'line', x1: 320, y1: 100, x2: 704, y2: 100, stroke: '#2563eb', strokeWidth: 4, markerStart: 'url(#arrowAcroBlueRev)', markerEnd: 'url(#arrowAcroBlue)' },
    { type: 'rect', x: 292, y: 530, width: 440, height: 110, rx: 16, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 3 },
    { type: 'text', x: 512, y: 576, fill: '#1e3a8a', fontSize: 32, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramAcromionDimLabel' },
    { type: 'text', x: 512, y: 617, fill: '#475569', fontSize: 22, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramAcromionDimSub' },
    { type: 'rect', x: 212, y: 896, width: 600, height: 112, rx: 16, fill: '#ffffff', stroke: '#94a3b8', strokeWidth: 3 },
    { type: 'text', x: 512, y: 942, fill: '#0f172a', fontSize: 29, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramHandlebarMatch' },
    { type: 'text', x: 512, y: 985, fill: '#475569', fontSize: 22, fontFamily: 'monospace', textAnchor: 'middle', textKey: 'diagramHandlebarTolerance' },
  ],
};
