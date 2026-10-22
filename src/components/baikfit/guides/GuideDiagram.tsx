import React from 'react';
import Image from 'next/image';
import type { Translations } from '@/lib/i18n/translations';
import type { GuideConfig, GuideElement, GuideMarker } from './types';

const MARKER_PATH = 'M 0 0 L 8 4 L 0 8 z';

const ArrowMarker: React.FC<{ id: string; color: string; reverse?: boolean }> = ({ id, color, reverse }) => (
  <marker
    id={id}
    markerWidth="8"
    markerHeight="8"
    refX="4"
    refY="4"
    orient={reverse ? 'auto-start-reverse' : 'auto'}
  >
    <path d={MARKER_PATH} fill={color} />
  </marker>
);

const MarkerDefs: React.FC<{ markers: GuideMarker[] }> = ({ markers }) => (
  <defs>
    {markers.map((marker) => (
      <React.Fragment key={marker.id}>
        <ArrowMarker id={marker.id} color={marker.color} />
        <ArrowMarker id={`${marker.id}Rev`} color={marker.color} reverse />
      </React.Fragment>
    ))}
  </defs>
);

/** SVG attributes of an element: everything except the config-only keys. */
function svgAttributes(element: GuideElement): Record<string, string | number> {
  const attributes: Record<string, string | number> = { ...element };
  delete attributes.type;
  delete attributes.textKey;
  return attributes;
}

const OverlayElement: React.FC<{ element: GuideElement; wizard: Translations['wizard'] }> = ({ element, wizard }) => {
  const attributes = svgAttributes(element);
  if (element.type === 'text') return <text {...attributes}>{wizard[element.textKey]}</text>;
  if (element.type === 'line') return <line {...attributes} />;
  return element.type === 'circle' ? <circle {...attributes} /> : <rect {...attributes} />;
};

/** Renders the guide image with its SVG overlay; all texts come from the translation dictionary. */
export const GuideDiagram: React.FC<{ guide: GuideConfig; t: Translations }> = ({ guide, t }) => (
  <div className="relative w-full max-w-[420px] aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-sm flex items-center justify-center">
    <Image
      width={1024}
      height={1024}
      unoptimized
      src={guide.image.src}
      alt={t.wizard[guide.image.altKey]}
      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
    />
    <svg
      data-testid={guide.testId}
      viewBox="0 0 1024 1024"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <MarkerDefs markers={guide.markers} />
      {guide.elements.map((element, index) => (
        <OverlayElement key={index} element={element} wizard={t.wizard} />
      ))}
    </svg>
  </div>
);
