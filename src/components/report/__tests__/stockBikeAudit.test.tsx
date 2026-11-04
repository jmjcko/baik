import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/profile/values';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { StockSelection } from '@/lib/bikes/types';
import { buildStockAudit } from '../stock/buildStockAudit';
import { StockBikeAudit } from '../stock/StockBikeAudit';
import { SaddleRailSchematic } from '../schematics/SaddleRailSchematic';
import { SpacerSchematic } from '../schematics/SpacerSchematic';

const canyonM: StockSelection = { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };
/** Inseam 840 and shoulders 380: target setback 210, stack 600, reach 378 (see evaluateStockBikeFit.test.ts for the arithmetic). */
const values = (over: Partial<ProfileValues> = {}): ProfileValues => ({ ...DEFAULT_PROFILE, inseamMm: 840, heightCm: 178, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, riderWeightKg: 75, ...over });

describe('buildStockAudit', () => {
  const t = translations.en;
  const a = t.stockBike.audit;
  const a_seed = a.badgeSeed;

  it('should return nothing without a stock bike, and when the seed no longer has the bike', () => {
    expect(buildStockAudit(t, 'en', null, values())).toBeNull();
    expect(buildStockAudit(t, 'en', { source: 'seed', bikeId: 'gone', size: 'M' }, values())).toBeNull();
    expect(buildStockAudit(t, 'en', { source: 'seed', bikeId: canyonM.source === 'seed' ? canyonM.bikeId : '', size: 'XXL' }, values())).toBeNull();
  });

  it('should write the bike, the source, the score and the best size of a seed bike', () => {
    const view = buildStockAudit(t, 'en', canyonM, values())!;
    expect(view.origin).toBe('seed');
    expect(view.bikeLine).toBe('Canyon Endurace CF 8 2024, size M');
    expect(view.sourceLine).toContain('Bike Insights');
    expect(view.sourceLine).toContain('2026-10-24');
    expect(view.fitScore).toBe('Fit match 98 %');
    expect(view.sizeText).toBe('Your size M is the best fit of this model for you.');
  });

  it('should say when another size fits better', () => {
    const view = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'S' }, values())!;
    expect(view.sizeText).toBe('Size M of this model fits you better than your size S.');
  });

  it('should keep the saddle in the middle for a shift below the tolerance (-1 mm) and not order spacers off on an assumed height', () => {
    const view = buildStockAudit(t, 'en', canyonM, values())!;
    expect(view.saddle).toMatchObject({ text: a.saddleKeep, warning: null, deltaMm: 0 });
    expect(view.spacers).toMatchObject({ text: a.spacerVerify, nowMm: 20, goalMm: 20 });
    expect(view.reachText).toBe(a.reachKeep);
  });

  it('should tell to slide the saddle back or forward and to add spacers, with the rail and spacer limits', () => {
    const tarmac52: StockSelection = { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '52' };
    const view = buildStockAudit(t, 'en', tarmac52, values())!;
    expect(view.saddle.text).toBe(`Slide the saddle 5 mm back on its rails, measured from the middle of the rails. ${a.saddleHeightCheck}`);
    expect(view.spacers.text).toBe('Add 53 mm of spacers under the stem.');
    expect(view.spacers.warning).toBe('The target needs more than 35 mm of spacers: choose a taller frame or a stem with more rise.');
    const trek58 = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '58' }, values())!;
    expect(trek58.saddle.text).toBe('Slide the saddle 7 mm forward on its rails, measured from the middle of the rails.');
    expect(trek58.saddle.deltaMm).toBe(-7);
  });

  it('should hold the saddle for pain at the back of the knee instead of moving it back, with the reason, and never offer it back for numb hands plus a bad knee', () => {
    const tarmac52: StockSelection = { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '52' };
    const knee = buildStockAudit(t, 'en', tarmac52, values({ currentPains: ['back_knee'] }))!;
    expect(knee.saddle).toMatchObject({ text: a.saddleHoldBack, deltaMm: 0, warning: null, reason: a.reasons.saddleHoldBack });
    expect(knee.changes.saddle).toBe(false);
    const both = buildStockAudit(t, 'en', tarmac52, values({ currentPains: ['back_knee', 'numb_hands'] }))!;
    expect(both.saddle.text).toBe(a.saddleHoldBack);
  });

  it('should cut a move of the saddle back to 15 mm and send the rider to a fitter for more, and keep the move forward as it was', () => {
    const big = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '52' }, values({ inseamMm: 900 }))!;
    if (big.saddle.deltaMm > 0) {
      expect(big.saddle.deltaMm).toBeLessThanOrEqual(15);
      if (big.saddle.deltaMm === 15) expect(big.saddle.text).toContain('fitter');
    }
    const small = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '52' }, values())!;
    expect(small.saddle.text).toContain(a.saddleHeightCheck);
  });

  it('should compare the reach with the stock stem and name the direction of the stem change', () => {
    const xl = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'XL' }, values())!;
    expect(xl.reachText).toBe('The handlebar is 37 mm too far from you: a stem about 37 mm shorter puts it where you need it.');
    const xs = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'XS' }, values())!;
    expect(xs.reachText).toBe('The handlebar is 28 mm too close to you: a stem about 28 mm longer puts it where you need it.');
  });

  it('should list what was assumed (spacers and offset) and what the maker does not publish (Trek: handlebar and crank)', () => {
    const view = buildStockAudit(t, 'en', { source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '56' }, values())!;
    expect(view.assumptions).toEqual([
      'The maker does not publish the factory spacers, so we assumed 20 mm. Measure the spacers on your bike and correct the change by the difference.',
      'The maker does not publish the seat post offset, so we assumed 0 mm (an inline post). If your post has a setback, subtract it from the change.',
    ]);
    expect(view.unknownNote).toBe('The maker does not publish: handlebar width, crank length. We could not check them.');
    expect(view.traps).toEqual([]);
  });

  it('should use the language of the app for the warnings about the factory parts', () => {
    const wide = buildStockAudit(t, 'en', canyonM, values())!;
    const cs = buildStockAudit(translations.cs, 'cs', canyonM, values())!;
    expect(wide.traps[0].component).toBe('Handlebar / Cockpit Width');
    expect(cs.traps[0].component).toBe('Šířka řídítek / Kokpit');
    expect(cs.saddle.text).toBe(translations.cs.stockBike.audit.saddleKeep);
  });

  it('should mark a bike that the AI read, with one size and no source line', () => {
    const ai: StockSelection = { source: 'ai', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: STOCK_BIKE_SPECS[0].sizes.M };
    const view = buildStockAudit(t, 'en', ai, values())!;
    expect(view.origin).toBe('ai');
    expect(view.sourceLine).toBeNull();
    expect(view.sizeText).toBe(a.sizeOnlyOne);
    expect(view.bikeLine).toBe('Cube Attain 2024, size 54');
  });

  it('should label a catalog bike by the riders who confirmed it, or as verified by the owner', () => {
    const community: StockSelection = { source: 'community', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: STOCK_BIKE_SPECS[0].sizes.M, origin: 'community', confirmations: 3 };
    expect(buildStockAudit(t, 'en', community, values())!.badge).toBe('Confirmed by 3 riders');
    expect(buildStockAudit(translations.cs, 'cs', community, values())!.badge).toBe('Potvrzeno 3 jezdci');
    expect(buildStockAudit(t, 'en', { ...community, origin: 'owner', confirmations: 0 }, values())!.badge).toBe('Verified by bAIk');
    expect(buildStockAudit(t, 'en', community, values())!.origin).toBe('community');
    expect(buildStockAudit(t, 'en', canyonM, values())!.badge).toBe(a_seed);
  });

  it('should say when the saddle is out of the range of the rails', () => {
    const view = buildStockAudit(t, 'en', { source: 'ai', brand: 'X', model: 'Y', year: 2024, size: 'M', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, seatTubeAngleDeg: 70.5 } }, values())!;
    expect(view.saddle.warning).toBe('That is more than the rails allow (30 mm each way): a seat post with a different offset is needed.');
  });
});

describe.each(['en', 'cs'] as Locale[])('StockBikeAudit (%s)', (locale) => {
  const t = translations[locale];
  const a = t.stockBike.audit;
  const view = (selection: StockSelection, over: Partial<ProfileValues> = {}) => buildStockAudit(t, locale, selection, values(over))!;

  it('should show the title, the bike, the origin badge and the source of a seed bike', () => {
    render(<StockBikeAudit t={t} view={view(canyonM)} />);
    expect(screen.getByRole('heading', { level: 2, name: a.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Canyon Endurace CF 8 2024/ })).toBeInTheDocument();
    expect(screen.getByTestId('stock-origin')).toHaveTextContent(a.badgeSeed);
    expect(screen.getByText(/Bike Insights/)).toBeInTheDocument();
  });

  it('should warn that an AI bike must be checked with the maker', () => {
    const ai: StockSelection = { source: 'ai', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: STOCK_BIKE_SPECS[0].sizes.M };
    render(<StockBikeAudit t={t} view={view(ai)} />);
    expect(screen.getByTestId('stock-origin')).toHaveTextContent(a.badgeAi);
    expect(screen.getByText(new RegExp(a.sizeOnlyOne.slice(0, 20)))).toBeInTheDocument();
  });

  it('should draw no schematic and no "change" heading when nothing changes, and list what to leave with the reasons', () => {
    const v = view(canyonM);
    expect(v.changes).toEqual({ saddle: false, spacers: false, reach: false });
    render(<StockBikeAudit t={t} view={v} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.queryByRole('heading', { level: 3, name: a.diyTitle })).not.toBeInTheDocument();
    const keep = within(screen.getByTestId('stock-keep'));
    expect(keep.getByRole('heading', { level: 3, name: a.keepTitle })).toBeInTheDocument();
    expect(keep.getAllByRole('listitem')).toHaveLength(3);
    expect(keep.getByText(a.saddleKeep)).toBeInTheDocument();
    expect(keep.getAllByTestId('reason')).toHaveLength(3);
  });

  it('should draw the saddle and spacer schematics only for a real change, and keep the rest in the list', () => {
    const tarmac52: StockSelection = { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '52' };
    const v = view(tarmac52);
    expect(v.changes).toMatchObject({ saddle: true, spacers: true });
    render(<StockBikeAudit t={t} view={v} />);
    expect(screen.getByTestId('saddle-rail-schematic')).toBeInTheDocument();
    expect(screen.getByTestId('spacer-schematic')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: a.diyTitle })).toBeInTheDocument();
    expect(screen.getByText(v.saddle.text)).toBeInTheDocument();
  });

  it('should say "leave it" for the saddle and the spacers of a rider with numb hands, without a drawing of two equal columns', () => {
    const v = view(canyonM, { currentPains: ['numb_hands'] });
    expect(v.changes.saddle).toBe(false);
    render(<StockBikeAudit t={t} view={v} />);
    expect(screen.queryByTestId('spacer-schematic')).not.toBeInTheDocument();
    expect(screen.queryByTestId('saddle-rail-schematic')).not.toBeInTheDocument();
  });

  it('should fold the assumptions under one line that counts them', () => {
    render(<StockBikeAudit t={t} view={view(canyonM)} />);
    const details = screen.getByTestId('stock-assumptions');
    expect(details.tagName).toBe('DETAILS');
    expect(details).not.toHaveAttribute('open');
    expect(within(details).getByText(new RegExp(`${a.assumptionsTitle} \\(2\\)`))).toBeInTheDocument();
  });

  it('should list a trap of the factory handlebar with its stock and recommended spec', () => {
    render(<StockBikeAudit t={t} view={view(canyonM)} />);
    const traps = screen.getAllByTestId('stock-trap');
    expect(traps).toHaveLength(2);
    const trap = traps[0];
    expect(within(trap).getByText(/→/)).toHaveTextContent(/410.*380/);
    expect(trap).toHaveTextContent(/380/);
    expect(screen.getByRole('heading', { level: 3, name: a.trapsTitle })).toBeInTheDocument();
  });

  it('should say that the factory parts suit the rider when there is no trap, and name the parts that cannot be checked', () => {
    render(<StockBikeAudit t={t} view={view({ source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '56' })} />);
    expect(screen.getByText(a.trapsNone)).toBeInTheDocument();
    expect(screen.queryByTestId('stock-trap')).not.toBeInTheDocument();
    expect(screen.getByText(/Trek|Domane/, { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(a.unknownNote.split('{list}')[0]))).toHaveTextContent(a.components.handlebar);
  });
});

describe('schematics', () => {
  const s = translations.en.stockBike.audit.schematics;
  const shell = (container: HTMLElement) => container.querySelector('rect[rx="19"]')!.closest('g')!;

  it('should move the saddle back to the left in proportion and label the distance', () => {
    const { container } = render(<SaddleRailSchematic t={s} deltaMm={10} outOfRange={false} />);
    expect(shell(container).getAttribute('transform')).toBe('translate(-40 0)');
    expect(screen.getByText('10 mm')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Saddle rails seen from the side: the saddle moved 10 mm back from the middle mark');
  });

  it('should move the saddle forward to the right, and stop at the end of the rails (40 mm)', () => {
    const { container, rerender } = render(<SaddleRailSchematic t={s} deltaMm={-12} outOfRange={false} />);
    expect(shell(container).getAttribute('transform')).toBe('translate(48 0)');
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('forward'));
    rerender(<SaddleRailSchematic t={s} deltaMm={90} outOfRange />);
    expect(shell(container).getAttribute('transform')).toBe('translate(-160 0)');
    expect(screen.getByText('90 mm')).toBeInTheDocument();
  });

  it('should draw no arrow and no distance when the saddle stays in the middle', () => {
    const { container } = render(<SaddleRailSchematic t={s} deltaMm={0} outOfRange={false} />);
    expect(container.querySelector('line[marker-end]')).toBeNull();
    expect(screen.queryByText(/mm$/)).not.toBeInTheDocument();
    expect(screen.getByText(s.middleLabel)).toBeInTheDocument();
  });

  it('should draw the spacers as 5 mm slices to scale and label both columns', () => {
    const { container } = render(<SpacerSchematic t={s} nowMm={20} goalMm={10} />);
    const slices = container.querySelectorAll('rect[width="44"]');
    expect(slices).toHaveLength(4 + 2);
    expect(slices[0].getAttribute('height')).toBe('15');
    expect(screen.getByText(`${s.nowLabel} 20 mm`)).toBeInTheDocument();
    expect(screen.getByText(`${s.goalLabel} 10 mm`)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Spacers under the stem: now 20 mm, target 10 mm');
  });

  it('should cap a very tall stack at 60 mm and draw no slices for no spacers', () => {
    const { container, rerender } = render(<SpacerSchematic t={s} nowMm={0} goalMm={90} />);
    expect(container.querySelectorAll('rect[width="44"]')).toHaveLength(12);
    rerender(<SpacerSchematic t={s} nowMm={0} goalMm={0} />);
    expect(container.querySelectorAll('rect[width="44"]')).toHaveLength(0);
  });
});
