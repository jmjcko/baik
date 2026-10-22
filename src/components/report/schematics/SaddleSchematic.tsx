import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import { FigureFrame } from './FigureFrame';
import { Badge, FIG_BLUE, FIG_GREEN, FIG_INK, FIG_RED, Landmark } from './figureParts';

type Texts = Translations['diagnosticReport']['schematics'];

const IMAGE = '/assets/guides/saddle_side.jpg?v=1';
/** Top of the saddle on the seat post axis, and the bottom of the post axis (image pixels of the guide artwork). */
const SADDLE_TOP = { x: 486, y: 304 };
const POST_BOTTOM = { x: 592, y: 742 };
const LINE_X = { from: 110, to: 915 };
const PX_PER_MM = 3;
const GAP_PX = { min: 40, max: 110 };

interface SaddleSchematicProps {
  t: Texts;
  targetMm: number;
  currentMm: number | null;
}

/** Vertical distance between the current and the target line: proportional to the change, clamped so that it stays readable. */
function gapPx(deltaMm: number): number {
  return Math.min(GAP_PX.max, Math.max(GAP_PX.min, deltaMm * PX_PER_MM));
}

function saddleView({ t, targetMm, currentMm }: SaddleSchematicProps) {
  const adjustment = currentMm === null ? null : saddleAdjustment(currentMm, targetMm);
  const delta = adjustment?.deltaMm ?? 0;
  const captions = { raise: t.saddleCaptionRaise, lower: t.saddleCaptionLower, none: t.saddleCaptionOnTarget };
  return {
    adjustment,
    targetY: SADDLE_TOP.y + (adjustment?.direction === 'raise' ? -gapPx(delta) : adjustment?.direction === 'lower' ? gapPx(delta) : 0),
    ariaLabel: fill(currentMm === null ? t.saddleAriaTargetOnly : t.saddleAria, { current: currentMm ?? 0, target: targetMm, delta }),
    caption: fill(adjustment === null ? t.saddleCaptionTargetOnly : captions[adjustment.direction], { delta, tolerance: KB_RULES.saddleToleranceMm }),
  };
}

const Level: React.FC<{ y: number; color: string; dashed?: boolean; tip: string }> = ({ y, color, dashed, tip }) => (
  <g>
    <title>{tip}</title>
    <line x1={LINE_X.from} y1={y} x2={LINE_X.to} y2={y} stroke={color} strokeWidth="5" strokeDasharray={dashed ? '16 10' : undefined} />
  </g>
);

/** Seat post axis from the saddle top down toward the bottom bracket: the heights are measured along it. */
const PostAxis: React.FC<{ t: Texts }> = ({ t }) => (
  <g>
    <line x1={SADDLE_TOP.x} y1={SADDLE_TOP.y} x2={POST_BOTTOM.x} y2={POST_BOTTOM.y} stroke={FIG_BLUE} strokeWidth="4" strokeDasharray="14 9" />
    <polygon points={`${POST_BOTTOM.x - 16},${POST_BOTTOM.y - 26} ${POST_BOTTOM.x + 16},${POST_BOTTOM.y - 26} ${POST_BOTTOM.x},${POST_BOTTOM.y + 6}`} fill={FIG_BLUE} />
    <Landmark x={SADDLE_TOP.x} y={SADDLE_TOP.y} color={FIG_BLUE} />
    <Badge x={650} y={690} width={230} text={t.bbLabel} color={FIG_BLUE} />
  </g>
);

/** Side view of the saddle on its post: current saddle height (red) against the target (green), the gap drawn enlarged. */
export const SaddleSchematic: React.FC<SaddleSchematicProps> = (props) => {
  const { t, targetMm, currentMm } = props;
  const { adjustment, targetY, ariaLabel, caption } = saddleView(props);
  const onTarget = adjustment === null || adjustment.direction === 'none';
  const sign = adjustment?.direction === 'raise' ? '+' : '−';
  return (
    <FigureFrame testId="saddle-schematic" viewBox="100 40 840 760" label={ariaLabel} caption={caption}>
      <image href={IMAGE} x="0" y="0" width="1024" height="1024" />
      {!onTarget && <rect x={LINE_X.from} y={Math.min(SADDLE_TOP.y, targetY)} width={LINE_X.to - LINE_X.from} height={Math.abs(targetY - SADDLE_TOP.y)} fill={FIG_GREEN} fillOpacity="0.14" />}
      <PostAxis t={t} />
      {!onTarget && <Level y={SADDLE_TOP.y} color={FIG_RED} dashed tip={fill(t.tipCurrent, { value: currentMm ?? 0 })} />}
      <Level y={targetY} color={FIG_GREEN} tip={fill(t.tipTarget, { value: targetMm })} />
      {!onTarget && <Badge x={140} y={50} width={330} text={`${t.currentLabel} ${currentMm} mm`} color={FIG_RED} />}
      <Badge x={onTarget ? 140 : 520} y={50} width={330} text={`${onTarget && currentMm !== null ? t.onTargetLabel : t.targetLabel} ${targetMm} mm`} color={FIG_GREEN} />
      {adjustment && !onTarget && <Badge x={140} y={640} width={230} text={`${sign}${adjustment.deltaMm} mm`} color={FIG_INK} />}
    </FigureFrame>
  );
};
