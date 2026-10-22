import type { Translations } from '@/lib/i18n/translations';

export type GuideType = 'inseam' | 'torso' | 'acromion' | 'arm' | 'crank' | 'saddleHeight' | 'barWidth';

type WizardTexts = Translations['wizard'];
type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];

/** Key of a plain string entry in the `wizard` translation block. */
export type GuideTextKey = StringKeys<WizardTexts>;

type SvgAttributes = { [attribute: string]: string | number };

/** One SVG primitive of the overlay; attributes use the React prop names (strokeWidth, textAnchor...). */
export type GuideElement =
  | ({ type: 'line' | 'circle' | 'rect' } & SvgAttributes)
  | ({ type: 'text'; textKey: GuideTextKey } & SvgAttributes);

/** Arrow marker; the reverse marker is derived as `${id}Rev`. */
export interface GuideMarker {
  id: string;
  color: string;
}

/**
 * Configuration of one measurement guide: the base image and the SVG overlay in 1024 x 1024 pixel
 * coordinates (see docs/design/measurement-guide-diagrams.md).
 */
export interface GuideConfig {
  type: GuideType;
  testId: string;
  image: { src: string; altKey: GuideTextKey };
  markers: GuideMarker[];
  elements: GuideElement[];
}

/** Translation keys of the texts that accompany a guide. */
export interface GuideTextKeys {
  title: GuideTextKey;
  clinicalNote: GuideTextKey;
  intro?: GuideTextKey;
}
