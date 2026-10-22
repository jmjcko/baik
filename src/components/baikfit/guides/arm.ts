import type { GuideConfig } from './types';

export const armGuide: GuideConfig = {
  type: 'arm',
  testId: 'arm-cad-vector',
  image: { src: '/assets/guides/arm_cad.jpg?v=1', altKey: 'armGuideTitle' },
  markers: [
    { id: 'arrowVioletArm', color: '#7c3aed' },
  ],
  elements: [
    { type: 'line', x1: 312, y1: 172, x2: 205, y2: 172, stroke: '#7c3aed', strokeWidth: 2, strokeDasharray: '6 5' },
    { type: 'line', x1: 299, y1: 705, x2: 205, y2: 705, stroke: '#7c3aed', strokeWidth: 2, strokeDasharray: '6 5' },
    { type: 'circle', cx: 312, cy: 172, r: 8, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 312, cy: 172, r: 19, fill: 'none', stroke: '#7c3aed', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'text', x: 312, y: 124, fill: '#6d28d9', fontSize: 29, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramAcromionTip' },
    { type: 'circle', cx: 299, cy: 705, r: 8, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 299, cy: 705, r: 19, fill: 'none', stroke: '#7c3aed', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'text', x: 299, y: 796, fill: '#6d28d9', fontSize: 29, fontFamily: 'monospace', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramFist' },
    { type: 'line', x1: 205, y1: 182, x2: 205, y2: 695, stroke: '#7c3aed', strokeWidth: 4, markerStart: 'url(#arrowVioletArmRev)', markerEnd: 'url(#arrowVioletArm)' },
    { type: 'rect', x: 14, y: 815, width: 344, height: 104, rx: 16, fill: '#ffffff', stroke: '#7c3aed', strokeWidth: 3 },
    { type: 'text', x: 186, y: 860, fill: '#5b21b6', fontSize: 30, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramArmDimLabel' },
    { type: 'text', x: 186, y: 897, fill: '#475569', fontSize: 19, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramArmDimSub' },
  ],
};
