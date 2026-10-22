import type { GuideConfig } from './types';

export const torsoGuide: GuideConfig = {
  type: 'torso',
  testId: 'torso-cad-vector',
  image: { src: '/assets/guides/torso_cad.jpg?v=4', altKey: 'torsoAccordionTitle' },
  markers: [
    { id: 'arrowTealM3', color: '#0d9488' },
  ],
  elements: [
    { type: 'circle', cx: 512, cy: 160, r: 7, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 },
    { type: 'circle', cx: 512, cy: 160, r: 16, fill: 'none', stroke: '#0d9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
    { type: 'line', x1: 512, y1: 138, x2: 512, y2: 182, stroke: '#0d9488', strokeWidth: 2 },
    { type: 'line', x1: 490, y1: 160, x2: 534, y2: 160, stroke: '#0d9488', strokeWidth: 2 },
    { type: 'line', x1: 380, y1: 160, x2: 644, y2: 160, stroke: '#0d9488', strokeWidth: 2, strokeDasharray: '6 4' },
    { type: 'line', x1: 380, y1: 648, x2: 644, y2: 648, stroke: '#0d9488', strokeWidth: 2, strokeDasharray: '6 4' },
    { type: 'line', x1: 620, y1: 638, x2: 620, y2: 170, stroke: '#0d9488', strokeWidth: 4, markerStart: 'url(#arrowTealM3Rev)', markerEnd: 'url(#arrowTealM3)' },
    { type: 'rect', x: 620, y: 350, width: 390, height: 110, rx: 16, fill: '#ffffff', stroke: '#0d9488', strokeWidth: 3 },
    { type: 'text', x: 815, y: 396, fill: '#0f766e', fontSize: 31, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 'bold', textKey: 'diagramTorsoDimLabel' },
    { type: 'text', x: 815, y: 437, fill: '#475569', fontSize: 22, fontFamily: 'sans-serif', textAnchor: 'middle', fontWeight: 600, textKey: 'diagramTorsoDimSub' },
  ],
};
