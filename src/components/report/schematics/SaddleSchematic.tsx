import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { KB_RULES, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import { BAD, GOOD, LABEL_FONT, LINE, MUTED, type Pt } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const BB: Pt = { x: 100, y: 144 };
const TUBE = 124;
const ANGLE = (ESTIMATES.seatTubeAngleDeg.value * Math.PI) / 180;
const MARK_LENGTH = 56;
const LABEL_GAP = 13;

const onTube = (s: number): Pt => ({ x: BB.x - s * Math.cos(ANGLE), y: BB.y - s * Math.sin(ANGLE) });

/** Maps a saddle height to a position along the drawn seat tube (padding keeps small deltas readable). */
function heightToTube(heights: number[]): (height: number) => number {
  const lo = Math.min(...heights) - 30;
  const hi = Math.max(...heights) + 30;
  return (height) => 24 + ((height - lo) / (hi - lo)) * (TUBE - 48);
}

interface MarkProps {
  at: Pt;
  color: string;
  dashed?: boolean;
  triangle?: boolean;
  label: string;
  tip: string;
  labelY: number;
}

const HeightMark: React.FC<MarkProps> = ({ at, color, dashed, triangle, label, tip, labelY }) => (
  <g>
    <title>{tip}</title>
    <line x1={at.x} y1={at.y} x2={at.x + MARK_LENGTH} y2={at.y} stroke={color} strokeWidth="2" strokeDasharray={dashed ? '4 3' : undefined} />
    {triangle ? (
      <polygon points={`${at.x - 5},${at.y + 4} ${at.x + 5},${at.y + 4} ${at.x},${at.y - 5}`} fill="none" stroke={color} strokeWidth="1.8" />
    ) : (
      <circle cx={at.x} cy={at.y} r="4" fill={color} />
    )}
    <text x={at.x + MARK_LENGTH + 4} y={labelY} fill={color} {...LABEL_FONT}>
      {label}
    </text>
  </g>
);

const Frame: React.FC<{ saddleAt: Pt }> = ({ saddleAt }) => (
  <g stroke={LINE} strokeLinecap="round" fill="none">
    <line x1={BB.x} y1={BB.y} x2={onTube(TUBE - 40).x} y2={onTube(TUBE - 40).y} strokeWidth="5" />
    <line x1={onTube(TUBE - 60).x} y1={onTube(TUBE - 60).y} x2={saddleAt.x} y2={saddleAt.y} strokeWidth="2.5" />
    <circle cx={BB.x} cy={BB.y} r="6" strokeWidth="2" />
    <rect x={saddleAt.x - 18} y={saddleAt.y - 8} width="32" height="6" rx="3" fill={MUTED} stroke="none" />
  </g>
);

const DeltaArrow: React.FC<{ fromY: number; toY: number; text: string }> = ({ fromY, toY, text }) => {
  const dir = toY < fromY ? -1 : 1;
  return (
    <g stroke={LINE} fill={LINE}>
      <line x1="46" y1={fromY} x2="46" y2={toY - dir * 4} strokeWidth="1.6" />
      <polygon points={`46,${toY} 42,${toY - dir * 7} 50,${toY - dir * 7}`} stroke="none" />
      <text x="4" y={(fromY + toY) / 2 + 3} stroke="none" {...LABEL_FONT}>
        {text}
      </text>
    </g>
  );
};

/** Pushes two labels apart when their marks are too close to read. */
function labelYs(targetY: number, currentY: number): { target: number; current: number } {
  const gap = Math.abs(targetY - currentY);
  const spread = gap < LABEL_GAP ? (LABEL_GAP - gap) / 2 : 0;
  const targetUp = targetY < currentY ? -1 : 1;
  return { target: targetY + 3.5 + targetUp * spread, current: currentY + 3.5 - targetUp * spread };
}

interface SaddleSchematicProps {
  t: Texts;
  targetMm: number;
  currentMm: number | null;
}

function saddleView({ t, targetMm, currentMm }: SaddleSchematicProps) {
  const toTube = heightToTube(currentMm === null ? [targetMm] : [targetMm, currentMm]);
  const target = onTube(toTube(targetMm));
  const current = currentMm === null ? null : onTube(toTube(currentMm));
  const adjustment = currentMm === null ? null : saddleAdjustment(currentMm, targetMm);
  const delta = adjustment?.deltaMm ?? 0;
  const captions = { raise: t.saddleCaptionRaise, lower: t.saddleCaptionLower, none: t.saddleCaptionOnTarget };
  return {
    target,
    current,
    adjustment,
    ys: labelYs(target.y, current?.y ?? target.y),
    ariaLabel: fill(currentMm === null ? t.saddleAriaTargetOnly : t.saddleAria, { current: currentMm ?? 0, target: targetMm, delta }),
    caption: fill(adjustment === null ? t.saddleCaptionTargetOnly : captions[adjustment.direction], { delta, tolerance: KB_RULES.saddleToleranceMm }),
  };
}

/** Side view of the seat tube: current saddle height (red) against the target (green) with the change in mm. */
export const SaddleSchematic: React.FC<SaddleSchematicProps> = (props) => {
  const { t, targetMm, currentMm } = props;
  const view = saddleView(props);
  const { target, current, adjustment } = view;
  const onTarget = adjustment === null || adjustment.direction === 'none';
  return (
    <SchematicFrame testId="saddle-schematic" label={view.ariaLabel} caption={view.caption}>
      <Frame saddleAt={current ?? target} />
      <HeightMark
        at={target}
        color={GOOD}
        triangle
        label={`${onTarget && current ? t.onTargetLabel : t.targetLabel} ${targetMm} mm`}
        tip={fill(t.tipTarget, { value: targetMm })}
        labelY={view.ys.target}
      />
      {current && adjustment && !onTarget && (
        <>
          <HeightMark at={current} color={BAD} dashed label={`${t.currentLabel} ${currentMm} mm`} tip={fill(t.tipCurrent, { value: currentMm ?? 0 })} labelY={view.ys.current} />
          <DeltaArrow fromY={current.y} toY={target.y} text={`${adjustment.direction === 'raise' ? '+' : '−'}${adjustment.deltaMm} mm`} />
        </>
      )}
    </SchematicFrame>
  );
};
