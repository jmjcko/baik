import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { FLAT_SCENARIOS } from '@/lib/engines/baikcare/flatRepair';
import type { RidingDiscipline } from '@/types/baikfit';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { MaintainView } from '../MaintainView';

const EMOJI = /\p{Extended_Pictographic}/u;

function Harness({ locale, discipline = 'road', weight = 75, today = '2026-10-29' }: { locale: Locale; discipline?: RidingDiscipline; weight?: number; today?: string }) {
  const [care, setCare] = React.useState<BikeCare>(DEFAULT_CARE);
  return <MaintainView t={translations[locale]} bikeId="current" bikeName="Road bike" kind="road" discipline={discipline} riderWeightKg={weight} care={care} onCareChange={(patch) => setCare({ ...care, ...patch })} today={today} />;
}

const next = () => fireEvent.click(screen.getByTestId('wizard-next'));

describe.each(['en', 'cs'] as Locale[])('the wheels and tyres card (%s)', (locale) => {
  const t = translations[locale];
  const w = t.wheels;

  describe('the sealant', () => {
    const goTubeless = () => fireEvent.click(screen.getByTestId('tyre-setup-tubeless'));
    const setDay = (day: string) => fireEvent.change(screen.getByTestId('sealant-date'), { target: { value: day } });

    it('should say that tubes need no sealant, and ask for the day when the tyres are tubeless', () => {
      render(<Harness locale={locale} />);
      expect(screen.getByTestId('sealant-off')).toHaveTextContent(w.sealant.off);
      expect(screen.queryByTestId('sealant-date')).not.toBeInTheDocument();
      goTubeless();
      expect(screen.getByTestId('tyre-setup-tubeless')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('sealant-unknown')).toHaveTextContent(w.sealant.unknown);
    });

    it('should stay calm before 3 months, ask for a top-up between 3 and 6 months, and warn after 6 months', () => {
      render(<Harness locale={locale} />);
      goTubeless();
      setDay('2026-09-01');
      expect(screen.getByTestId('sealant-fresh')).toHaveTextContent(w.sealant.fresh);
      expect(screen.getByTestId('sealant-window')).toHaveTextContent(fill(w.sealant.window, { from: '2026-12-01', until: '2027-03-01' }));
      setDay('2026-05-01');
      expect(screen.getByTestId('sealant-topup')).toHaveTextContent(w.sealant.topUp);
      setDay('2026-03-01');
      expect(screen.getByTestId('sealant-overdue')).toHaveTextContent(w.sealant.overdue);
    });
  });

  describe('the pressure', () => {
    it('should show the road range and the value for the weight of the rider', () => {
      render(<Harness locale={locale} />);
      expect(screen.getByTestId('pressure-range')).toHaveTextContent(fill(w.pressure.range, { min: '5.0', max: '6.5' }));
      expect(screen.getByTestId('pressure-yours')).toHaveTextContent(fill(w.pressure.yours, { kg: 75, bar: '5.6' }));
    });

    it('should use the range of a gravel bike and of a mountain bike, and follow a heavier rider', () => {
      const { unmount } = render(<Harness locale={locale} discipline="gravel" weight={100} />);
      expect(screen.getByTestId('pressure-range')).toHaveTextContent(fill(w.pressure.range, { min: '2.2', max: '3.2' }));
      expect(screen.getByTestId('pressure-yours')).toHaveTextContent(fill(w.pressure.yours, { kg: 100, bar: '3.2' }));
      unmount();
      render(<Harness locale={locale} discipline="xc_mtb" weight={60} />);
      expect(screen.getByTestId('pressure-range')).toHaveTextContent(fill(w.pressure.range, { min: '1.4', max: '1.8' }));
      expect(screen.getByTestId('pressure-yours')).toHaveTextContent(fill(w.pressure.yours, { kg: 60, bar: '1.4' }));
    });
  });

  it('should list the wear checks of the tread, the casing, the rim and the rim tape', () => {
    render(<Harness locale={locale} />);
    const list = screen.getByTestId('wear-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(list).toHaveTextContent('TWI');
  });

  describe('the flat repair guide', () => {
    const open = () => fireEvent.click(screen.getByTestId('flat-open'));

    it('should list the five jobs in order and come back to the card', () => {
      render(<Harness locale={locale} />);
      open();
      expect(screen.queryByTestId('wheels-card')).not.toBeInTheDocument();
      const buttons = FLAT_SCENARIOS.map((id) => screen.getByTestId(`flat-scenario-${id}`));
      buttons.forEach((button, index) => expect(button).toHaveTextContent(`${index + 1}. ${w.flat.scenarios[FLAT_SCENARIOS[index]].name}`));
      fireEvent.click(screen.getByTestId('flat-close'));
      expect(screen.getByTestId('wheels-card')).toBeInTheDocument();
    });

    it.each(FLAT_SCENARIOS)('should go through the four steps of "%s" with its drawing', (id) => {
      render(<Harness locale={locale} />);
      open();
      fireEvent.click(screen.getByTestId(`flat-scenario-${id}`));
      const job = w.flat.scenarios[id];
      for (const [index, step] of job.steps.entries()) {
        expect(screen.getByTestId('flat-wizard')).toHaveTextContent(step.title);
        expect(screen.getByTestId('flat-diagram')).toHaveAccessibleName(job.diagramLabel);
        expect(screen.getByTestId('wizard-progress')).toHaveTextContent(fill(t.workshop.stepOf, { n: index + 1, total: 4 }));
        if (index < 3) next();
      }
      next();
      expect(screen.getByTestId('flat-picker')).toBeInTheDocument();
    });

    it('should warn that a plug is only for the tread and that a bead must not be levered with the last bit', () => {
      render(<Harness locale={locale} />);
      open();
      fireEvent.click(screen.getByTestId('flat-scenario-plug'));
      expect(screen.getByTestId('wizard-warning')).toHaveTextContent(w.flat.scenarios.plug.steps[0].warning!);
      fireEvent.click(screen.getByTestId('wizard-back'));
      fireEvent.click(screen.getByTestId('flat-scenario-tube'));
      next(); next(); next();
      expect(screen.getByTestId('wizard-warning')).toHaveTextContent(w.flat.scenarios.tube.steps[3].warning!);
    });
  });

  describe('the tyre points on the drawing', () => {
    const point = (wheel: 'front' | 'rear') => screen.getByTestId(`tyre-point-${wheel}`);

    it('should show a point on each tyre, not checked at the start, with the name and the status for a screen reader', () => {
      render(<Harness locale={locale} />);
      for (const wheel of ['front', 'rear'] as const) {
        expect(point(wheel).getAttribute('data-status')).toBe('unchecked');
        expect(point(wheel)).toHaveAccessibleName(fill(w.points.hotspot, { name: w.points[wheel], status: t.care.status.unchecked }));
      }
      expect(point('front')).toHaveTextContent(w.points.frontShort);
      expect(point('rear')).toHaveTextContent(w.points.rearShort);
    });

    it('should open the card of a tyre with its drawing and the four checks, and close it with Escape', () => {
      render(<Harness locale={locale} />);
      fireEvent.click(point('rear'));
      const dialog = screen.getByRole('dialog', { name: w.points.rear });
      expect(within(dialog).getAllByRole('listitem')).toHaveLength(4);
      expect(within(dialog).getByTestId('tyre-diagram-rear')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should colour the point by the result, name the tyre in the summary when it needs a look, and keep the other tyre apart', () => {
      render(<Harness locale={locale} />);
      fireEvent.click(point('front'));
      fireEvent.click(screen.getByTestId('node-result-warn'));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(point('front').getAttribute('data-status')).toBe('warn');
      expect(point('rear').getAttribute('data-status')).toBe('unchecked');
      expect(screen.getByTestId('tyre-attention')).toHaveTextContent(fill(w.points.attention, { tyres: w.points.front }));
      expect(screen.getByTestId('mcheck-summary')).not.toHaveTextContent(t.care.mcheck.allClear);
      fireEvent.click(point('front'));
      fireEvent.click(screen.getByTestId('node-result-pass'));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('tyre-attention')).not.toBeInTheDocument();
    });

    it('should lead from the card of a tyre to the flat repair guide', () => {
      render(<Harness locale={locale} />);
      fireEvent.click(point('front'));
      fireEvent.click(screen.getByTestId('tyre-open-flat'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('flat-picker')).toBeInTheDocument();
    });
  });

  it('should have no emoji anywhere in the texts', () => {
    expect(JSON.stringify(w)).not.toMatch(EMOJI);
  });
});
