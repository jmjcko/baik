/**
 * The technical illustrations of the product owner (Epic 26), stored in `public/`. The labels are drawn into the pictures in
 * English, so every caption says so in Czech; the alt text and the caption come from the dictionaries of the page.
 */
export type IllustrationId = 'hamstring' | 'release' | 'drop' | 'acromion';

/** The two that explain a rule of the report and of the capabilities page (the others belong to the mini-tests). */
export type ReportIllustrationId = Extract<IllustrationId, 'drop' | 'acromion'>;

export interface Illustration {
  src: string;
  width: number;
  height: number;
}

export const ILLUSTRATIONS: Record<IllustrationId, Illustration> = {
  hamstring: { src: '/hamstring_slr_test_illustration_v2.png', width: 1200, height: 896 },
  release: { src: '/core_release_test_illustration_v2.png', width: 1200, height: 896 },
  drop: { src: '/saddle_to_bar_drop_schematic_v2.png', width: 1376, height: 768 },
  acromion: { src: '/acromion_shoulder_width_illustration_v2.png', width: 1200, height: 896 },
};
