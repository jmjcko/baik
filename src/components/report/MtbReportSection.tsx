import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { MTB_RULES } from '@/lib/engines/baikfit/mtbRules';
import { dropperHeights, dynamicGeometry, flatBarTargetMm, forkSagMm, sagOf, stemAdvice, type MtbSetup } from '@/lib/engines/baikfit/mtb';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';

interface MtbReportProps {
  t: Translations;
  mtb: MtbSetup;
  acromionWidthMm: number;
  currentBarWidthMm: number | null;
  locale?: string;
  /** The saddle height for pedalling: the LeMond height along the seat tube (the dropper post fully extended). */
  saddleHeightMm: number;
}

const Card: React.FC<{ title: string; testId: string; children: React.ReactNode }> = ({ title, testId, children }) => (
  <SurfaceCard className="space-y-2">
    <div data-testid={testId} className="space-y-2">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {children}
    </div>
  </SurfaceCard>
);

const Line: React.FC<{ children: React.ReactNode; strong?: boolean }> = ({ children, strong }) => (
  <p className={strong ? 'text-base font-bold text-ink' : 'text-sm text-ink-2 leading-relaxed'}>{children}</p>
);

const EstimateChip: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line bg-sunken text-ink-3">{text}</span>
);

function barComparison(b: Translations['diagnosticReport']['mtb']['bar'], current: number | null, target: number): string {
  if (current === null) return b.none;
  const delta = current - target;
  const verdict = delta === 0 ? b.same : fill(delta > 0 ? b.wider : b.narrower, { delta: Math.abs(delta) });
  return `${fill(b.current, { current })} ${verdict}`;
}

const FlatBarCard: React.FC<MtbReportProps> = ({ t, mtb, acromionWidthMm, currentBarWidthMm }) => {
  const b = t.diagnosticReport.mtb.bar;
  const target = flatBarTargetMm(acromionWidthMm, mtb.style);
  const range = MTB_RULES.barRangeMm[mtb.style];
  const stem = stemAdvice(target, currentBarWidthMm);
  return (
    <Card title={b.title} testId="mtb-bar">
      <Line strong>{fill(b.target, { target })}</Line>
      <Line>{fill(b.formula, { acromion: acromionWidthMm, offset: MTB_RULES.barOffsetMm[mtb.style], min: range.min, max: range.max })}</Line>
      <Line>{barComparison(b, currentBarWidthMm, target)}</Line>
      <Line>{b.sweep}</Line>
      <Line>{stem ? fill(stem.changeMm < 0 ? b.stemShorter : b.stemLonger, { change: Math.abs(stem.changeMm) }) : currentBarWidthMm === null ? b.stemNone : ''}</Line>
      <Line>{b.stemRange}</Line>
    </Card>
  );
};

const SagCard: React.FC<MtbReportProps> = ({ t, mtb, locale }) => {
  const s = t.diagnosticReport.mtb.sag;
  const sag = forkSagMm(mtb);
  const dynamic = dynamicGeometry(mtb);
  const target = MTB_RULES.sagTargetPercent[mtb.style];
  return (
    <Card title={s.title} testId="mtb-sag">
      {sag === null || mtb.travelMm === null ? (
        <Line>{s.none}</Line>
      ) : (
        <>
          <Line strong>{fill(s.value, { sag, percent: sagOf(mtb), travel: mtb.travelMm })}</Line>
          <Line>{fill(s.target, { min: target.min, max: target.max })}</Line>
          {dynamic?.reachGainMm ? (
            <>
              <Line>{fill(s.hardtail, { angle: new Intl.NumberFormat(locale ?? 'en').format(dynamic.headAngleSteeperDeg), ...dynamic.reachGainMm })}</Line>
              <EstimateChip text={t.diagnosticReport.mtb.estimate} />
            </>
          ) : (
            <Line>{s.full}</Line>
          )}
        </>
      )}
    </Card>
  );
};

const DropperCard: React.FC<MtbReportProps> = ({ t, mtb, saddleHeightMm }) => {
  const d = t.diagnosticReport.mtb.dropper;
  const heights = dropperHeights(saddleHeightMm, mtb);
  return (
    <Card title={d.title} testId="mtb-dropper">
      <Line strong>{fill(d.extended, { height: heights.extendedMm })}</Line>
      <Line>{heights.loweredMm === null || mtb.dropperTravelMm === null ? d.none : fill(d.lowered, { travel: mtb.dropperTravelMm, height: heights.loweredMm })}</Line>
    </Card>
  );
};

/** The mountain bike part of the report (KB 11): flat bar and stem, sag, dropper post. */
export const MtbReportSection: React.FC<MtbReportProps> = (props) => {
  const m = props.t.diagnosticReport.mtb;
  return (
    <section id="report-mtb" data-testid="mtb-report" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{m.title}</h2>
        <p className="text-xs text-ink-3 mt-1">{fill(m.subtitle, { style: props.t.wizard.mtb.styles[props.mtb.style] })}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <FlatBarCard {...props} />
        <SagCard {...props} />
        <DropperCard {...props} />
      </div>
    </section>
  );
};
