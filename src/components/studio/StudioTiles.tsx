import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { MetricTile } from '@/components/primitives/MetricTile';
import { assessCrank } from '@/lib/engines/baikfit/advice';
import { formatCrankRange, recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';
import { formatDelta, studioDeltas, type StudioSnapshot } from './studioDeltas';

interface StudioTilesProps {
  t: Translations;
  now: StudioSnapshot;
  reference: StudioSnapshot;
}

/** Live targets of the simulator, from the same rules as the report, with the change against the report on every value that moved. */
export const StudioTiles: React.FC<StudioTilesProps> = ({ t, now, reference }) => {
  const { coordinates } = now;
  const deltas = studioDeltas(now, reference);
  const badge = (metric: keyof typeof deltas) => formatDelta(deltas[metric], t.studio.vsReport) ?? undefined;
  const hint = (key: keyof Translations['studio']['tips']) => ({ id: `tip-${key}`, text: t.studio.tips[key] });
  const targets = t.diagnosticReport.targets;
  const bar = recommendedBarWidthMm(now.acromionWidthMm);
  const barDelta = bar - recommendedBarWidthMm(reference.acromionWidthMm);
  const crank = assessCrank(now.crankLengthMm);
  const crankNote =
    crank.kneeHigherMm > 0
      ? fill(t.studio.crankKnee, { delta: crank.kneeHigherMm, max: crank.recommendedMm })
      : fill(targets.crankNote, { range: `${formatCrankRange()} mm` });
  return (
    <>
      <MetricTile label={t.studio.saddleY} hint={hint('saddleY')} value={coordinates.saddle.heightAlongTubeMm} unit="mm" statusVariant="cyan" badge={badge('saddle')} />
      <MetricTile label={targets.handlebarLabel} value={bar} unit="mm" statusVariant="cyan" subLabel={fill(targets.handlebarNote, { acromion: now.acromionWidthMm })} badge={formatDelta(barDelta, t.studio.vsReport) ?? undefined} />
      <MetricTile label={targets.crankLabel} value={now.crankLengthMm} unit="mm" statusVariant={crank.kneeHigherMm > 0 ? 'warning' : 'success'} subLabel={crankNote} badge={badge('crank')} />
      <MetricTile label={t.studio.saddleX} hint={hint('saddleX')} value={coordinates.saddle.setbackXMm} unit="mm" statusVariant="neutral" badge={badge('setback')} />
      <MetricTile label={t.studio.stack} hint={hint('stack')} value={coordinates.cockpit.stackYMm} unit="mm" statusVariant="neutral" badge={badge('stack')} />
      <MetricTile label={t.studio.reach} hint={hint('reach')} value={coordinates.cockpit.reachXMm} unit="mm" statusVariant="neutral" badge={badge('reach')} />
    </>
  );
};
