import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { BOOK_STORAGE_KEY } from '@/lib/service/bookStore';
import { DEFAULT_BOOK } from '@/types/service';
import { todayOf } from '@/lib/engines/baikcare/barTape';
import { buildMasterPrompt, type LukeInput } from '@/lib/agents/lukeCykloAgent';
import { lukeContext } from '@/lib/agents/gearPrefill';
import { buildUpgradeMatrix } from '@/lib/engines/baikgear/upgradeMatrix';
import { UPGRADE_IDS } from '@/lib/engines/baikgear/types';
import { rangeText } from '@/lib/engines/baikgear/format';
import { GearView } from '../GearView';
import { UpgradeMatrixCard } from '../UpgradeMatrixCard';

const research = vi.fn();
vi.mock('@/app/actions/researchGearParameters', () => ({ researchGearParameters: (...args: unknown[]) => research(...args) }));

const EMOJI = /\p{Extended_Pictographic}/u;
const care = { ...DEFAULT_CARE, tubeless: false };
const values = { ...DEFAULT_PROFILE, currentBarWidthMm: 440, acromionWidthMm: 380, currentPains: ['numb_hands', 'front_knee'] as typeof DEFAULT_PROFILE.currentPains, care };
const found = { success: true, result: { productTitle: 'Tyres', category: 'tyres', parameters: [{ id: 'ai_w_0', name: 'Width', importance: 'mandatory', rationale: 'Comfort.', suggestedValues: [], multi: false }, { id: 'brands', name: 'Brands', importance: 'recommended', rationale: 'Trust.', suggestedValues: [], multi: false }] } };

describe.each(['en', 'cs'] as Locale[])('the Upgrade Matrix in bAIkgear (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => { research.mockReset(); research.mockResolvedValue(found); window.localStorage.clear(); });
  afterEach(() => window.localStorage.clear());

  const toInsight = async () => {
    render(<GearView t={t} locale={locale} values={values} bikeId="bike-1" />);
    fireEvent.change(screen.getByTestId('product-input'), { target: { value: 'tyres' } });
    fireEvent.click(screen.getByTestId('product-find'));
    await screen.findByTestId('gear-parameters-step');
    fireEvent.click(screen.getByTestId('gear-next'));
    fireEvent.click(screen.getByTestId('gear-next'));
  };

  it('should show the high tier before the low tier in step 3, with ranges and sources and without a product', async () => {
    await toInsight();
    const card = screen.getByTestId('upgrade-matrix');
    expect(card).toHaveTextContent(t.upgrade.card.title);
    const high = within(card).getByTestId('upgrade-tier-high');
    const low = within(card).getByTestId('upgrade-tier-low');
    expect(high.compareDocumentPosition(low) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const id of ['tyreWidth', 'pressure', 'tubeless', 'handlebarWidth', 'leverAngle', 'archInsoles']) expect(within(high).getByTestId(`upgrade-${id}`)).toBeInTheDocument();
    expect(within(low).getByTestId('upgrade-ceramic')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-range-handlebarWidth')).toHaveTextContent(fill(t.upgrade.card.range, { range: '380 mm' }));
    expect(screen.getByTestId('upgrade-range-leverAngle')).toHaveTextContent(fill(t.upgrade.card.range, { range: '8–15°' }));
    expect(card.textContent).not.toMatch(EMOJI);
  });

  it('should put the worn parts of the book of the active bike first', async () => {
    const rides = [{ id: 'r1', date: todayOf(), km: 900, elevationM: 0, terrain: 'road', rain: false }];
    window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { 'bike-1': { ...DEFAULT_BOOK, rides } } }));
    await toInsight();
    expect(await screen.findByTestId('upgrade-padsWorn')).toBeInTheDocument();
    const order = within(screen.getByTestId('upgrade-tier-high')).getAllByRole('listitem').map((item) => item.getAttribute('data-testid'));
    expect(order.indexOf('upgrade-padsWorn')).toBeLessThan(order.indexOf('upgrade-tyreWidth'));
    expect(order.indexOf('upgrade-padsWorn')).toBeLessThan(order.indexOf('upgrade-pressure'));
  });

  it('should say so when there is nothing to flag', () => {
    render(<UpgradeMatrixCard t={t} matrix={[]} />);
    expect(screen.getByTestId('upgrade-empty')).toHaveTextContent(t.upgrade.card.empty);
    expect(screen.queryByTestId('upgrade-tier-high')).not.toBeInTheDocument();
  });

  describe('the master prompt', () => {
    const { rider, bike } = lukeContext(values);
    const upgrades = buildUpgradeMatrix({ discipline: 'road', pains: ['numb_hands'], tubeless: false, barWidthMm: 440, acromionMm: 380, wear: [] });
    const input = (over: Partial<LukeInput> = {}): LukeInput => ({ productTitle: 'Tyres', category: 'tyres', parameters: [], notes: '', rider, bike, upgrades, include: { rider: true, bike: true }, ...over });

    it('should carry the matrix as numbered parameters with their ranges when the rider shares the body and the bike', () => {
      const text = buildMasterPrompt(t, input());
      expect(text).toContain(`## ${t.upgrade.prompt.heading}`);
      expect(text).toContain(t.upgrade.prompt.intro);
      for (const item of upgrades) expect(text).toContain(t.upgrade.items[item.id].title);
      expect(text).toContain(`(${rangeText({ min: 380, max: 380, unit: 'mm' })})`);
      expect(text.indexOf(t.upgrade.items.tyreWidth.title)).toBeLessThan(text.indexOf(t.upgrade.items.ceramic.title));
    });

    it.each([[{ rider: false, bike: true }], [{ rider: true, bike: false }], [{ rider: false, bike: false }]])('should leave the matrix out when the rider shares %j', (include) => {
      const text = buildMasterPrompt(t, input({ include }));
      expect(text).toContain(t.upgrade.prompt.hidden);
      expect(text).not.toContain(t.upgrade.items.handlebarWidth.title);
    });

    it('should not add a section without a matrix', () => {
      expect(buildMasterPrompt(t, input({ upgrades: undefined }))).not.toContain(t.upgrade.prompt.heading);
      expect(buildMasterPrompt(t, input({ upgrades: [] }))).not.toContain(t.upgrade.prompt.heading);
    });
  });

  it('should have every upgrade in the texts of the card', () => {
    for (const id of UPGRADE_IDS) expect(t.upgrade.items[id].title).toBeTruthy();
  });
});
