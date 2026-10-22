import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { CrankAssessment } from '@/lib/engines/baikfit/advice';
import { FigureFrame } from './FigureFrame';
import { Badge, FIG_BLUE, FIG_GREEN, FIG_INK, FIG_RED, Landmark } from './figureParts';

type Texts = Translations['diagnosticReport']['schematics'];

/** Landmarks of the crank figure at top dead center, in image pixels (public/assets/guides/crank_tdc.jpg). */
const FIGURE = { bb: { x: 515, y: 735 }, pedal: { x: 546, y: 626 }, knee: { x: 704, y: 268 } };
const IMAGE = '/assets/guides/crank_tdc.jpg?v=1';
const OFFSET = { x: 84, y: 25 };
/** The knee height difference is only a few pixels at true scale, so it is drawn enlarged (the caption says so). */
const KNEE_GAP_PX = 26;

const along = (fraction: number) => ({
  x: FIGURE.bb.x + (FIGURE.pedal.x - FIGURE.bb.x) * fraction,
  y: FIGURE.bb.y + (FIGURE.pedal.y - FIGURE.bb.y) * fraction,
});

/** Crank length: dimension line parallel to the crank with the rider's length, and a tick at the recommended length. */
const CrankDimension: React.FC<{ crank: CrankAssessment; color: string; tip: string }> = ({ crank, color, tip }) => {
  const start = { x: FIGURE.bb.x + OFFSET.x, y: FIGURE.bb.y + OFFSET.y };
  const end = { x: FIGURE.pedal.x + OFFSET.x, y: FIGURE.pedal.y + OFFSET.y };
  const rec = along(crank.recommendedMm / crank.currentMm);
  const recTick = { x: rec.x + OFFSET.x, y: rec.y + OFFSET.y };
  return (
    <g>
      <title>{tip}</title>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth="4" />
      {[start, end].map((p) => (
        <line key={p.y} x1={p.x - 14} y1={p.y - 4} x2={p.x + 14} y2={p.y + 4} stroke={color} strokeWidth="4" />
      ))}
      {crank.kneeHigherMm > 0 && <line x1={recTick.x - 16} y1={recTick.y - 5} x2={recTick.x + 16} y2={recTick.y + 5} stroke={FIG_GREEN} strokeWidth="5" />}
    </g>
  );
};

/** The knee height at the top of the stroke: a red line for the rider's crank, a green one for the recommended crank (enlarged gap). */
const KneeLines: React.FC = () => {
  const y = FIGURE.knee.y;
  const lower = y + KNEE_GAP_PX;
  return (
    <g>
      <g strokeWidth="3" strokeDasharray="9 6">
        <line x1={FIGURE.knee.x} y1={y} x2="930" y2={y} stroke={FIG_RED} />
        <line x1={FIGURE.knee.x} y1={lower} x2="930" y2={lower} stroke={FIG_GREEN} />
      </g>
      <line x1="905" y1={y} x2="905" y2={lower} stroke={FIG_INK} strokeWidth="4" />
    </g>
  );
};

interface CrankSchematicProps {
  t: Texts;
  crank: CrankAssessment;
}

/** Top dead center on the guide figure: the rider's crank (red) against the recommended 165 mm (green) and the real knee height difference. */
export const CrankSchematic: React.FC<CrankSchematicProps> = ({ t, crank }) => {
  const values = { current: crank.currentMm, recommended: crank.recommendedMm, delta: crank.kneeHigherMm };
  const longer = crank.kneeHigherMm > 0;
  const color = longer ? FIG_RED : FIG_GREEN;
  return (
    <FigureFrame testId="crank-schematic" viewBox="240 0 720 1010" label={fill(t.crankAria, values)} caption={fill(t.crankCaption, values)}>
      <image href={IMAGE} x="0" y="0" width="1024" height="1024" />
      <Landmark x={FIGURE.knee.x} y={FIGURE.knee.y} color={FIG_BLUE} />
      <Badge x={730} y={168} width={140} text={t.kneeLabel} color={FIG_BLUE} />
      <Landmark x={FIGURE.bb.x} y={FIGURE.bb.y} color={FIG_BLUE} />
      <Badge x={590} y={826} width={230} text={t.bbLabel} color={FIG_BLUE} />
      {longer && <KneeLines />}
      <CrankDimension crank={crank} color={color} tip={fill(t.tipCrank, { value: crank.currentMm })} />
      <Badge x={680} y={668} width={230} text={`${crank.currentMm} mm`} color={color} />
      {longer && <Badge x={680} y={738} width={230} text={`${crank.recommendedMm} mm`} color={FIG_GREEN} />}
      {longer && <Badge x={760} y={FIGURE.knee.y + 44} width={150} text={`${crank.kneeHigherMm} mm`} color={FIG_INK} />}
    </FigureFrame>
  );
};

