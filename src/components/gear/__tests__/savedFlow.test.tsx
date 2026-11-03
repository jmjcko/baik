import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { readPurchases } from '@/lib/gear/purchaseStore';
import { GearView } from '../GearView';

const research = vi.fn();
vi.mock('@/app/actions/researchGearParameters', () => ({ researchGearParameters: (...args: unknown[]) => research(...args) }));

const ai = (id: string, name: string, suggestedValues: string[], over: Record<string, unknown> = {}) => ({ id, name, importance: 'mandatory', rationale: `${name} matters.`, suggestedValues, multi: false, ...over });
const found = { success: true, result: { productTitle: 'Radar light', category: null, parameters: [ai('ai_battery_0', 'Battery', ['5-8 h', '8-12 h', '12+ h']), ai('brands', 'Brands', [], { importance: 'recommended' })] } };

describe.each(['en', 'cs'] as Locale[])('saving a purchase of bAIkgear (%s)', (locale) => {
  const t = translations[locale];
  const s = t.gear.saved;
  const view = () => render(<GearView t={t} locale={locale} values={DEFAULT_PROFILE} />);
  const startRadar = async () => {
    fireEvent.change(screen.getByTestId('product-input'), { target: { value: 'radar light' } });
    fireEvent.click(screen.getByTestId('product-find'));
    await screen.findByTestId('gear-parameters-step');
  };
  const saveAndClose = () => fireEvent.click(screen.getByTestId('gear-save'));

  beforeEach(() => { research.mockReset(); research.mockResolvedValue(found); });

  it('should offer "Save and close" from the second step on, not on the first', async () => {
    view();
    expect(screen.queryByTestId('gear-save')).toBeNull();
    expect(screen.queryByTestId('saved-purchases')).toBeNull();
    await startRadar();
    expect(screen.getByTestId('gear-save')).toHaveTextContent(s.saveClose);
  });

  it('should keep the purchase, go back to the start with a notice and list it in progress with its step and answers', async () => {
    view();
    await startRadar();
    fireEvent.click(screen.getByTestId('gear-next'));
    fireEvent.click(screen.getByTestId('param-ai_battery_0-8-12 h'));
    fireEvent.click(screen.getByTestId('param-ai_battery_0-12+ h'));
    saveAndClose();
    expect(screen.getByTestId('gear-product-step')).toBeInTheDocument();
    expect(screen.getByTestId('saved-notice')).toHaveTextContent(fill(s.savedNotice, { title: 'Radar light' }));
    const open = within(screen.getByTestId('purchases-open'));
    expect(open.getByText('Radar light')).toBeInTheDocument();
    expect(screen.getByTestId('saved-purchases')).toHaveTextContent(fill(s.stepOf, { n: 3, total: 5 }));
    expect(screen.getByTestId('saved-purchases')).toHaveTextContent(fill(s.answered, { n: 1 }));
    expect(readPurchases()).toHaveLength(1);
    expect(readPurchases()[0].answers.ai_battery_0.value).toBe('8-12 h, 12+ h');
  });

  it('should continue where the rider stopped, with the questions and answers back and no new research, and save over the same purchase', async () => {
    view();
    await startRadar();
    fireEvent.click(screen.getByTestId('gear-next'));
    fireEvent.click(screen.getByTestId('param-ai_battery_0-8-12 h'));
    saveAndClose();
    research.mockClear();
    fireEvent.click(screen.getByTestId('purchase-open'));
    expect(research).not.toHaveBeenCalled();
    expect(screen.getByTestId('param-ai_battery_0-8-12 h')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('param-ai_battery_0-12+ h'));
    saveAndClose();
    expect(readPurchases()).toHaveLength(1);
    expect(readPurchases()[0].answers.ai_battery_0.value).toBe('8-12 h, 12+ h');
  });

  it('should ask before deleting, delete only after "yes", and move a finished purchase to the finished list where it can be opened again', async () => {
    view();
    await startRadar();
    saveAndClose();
    fireEvent.click(screen.getByTestId('purchase-delete'));
    expect(screen.getByRole('alertdialog')).toHaveTextContent(s.confirmDelete);
    fireEvent.click(screen.getByRole('button', { name: s.no }));
    expect(readPurchases()).toHaveLength(1);
    fireEvent.click(screen.getByTestId('purchase-done'));
    expect(within(screen.getByTestId('purchases-done')).getByText('Radar light')).toBeInTheDocument();
    expect(screen.queryByTestId('purchases-open')).toBeNull();
    expect(readPurchases()[0].status).toBe('done');
    expect(within(screen.getByTestId('purchases-done')).getByTestId('purchase-open')).toHaveTextContent(s.reopen);
    fireEvent.click(screen.getByTestId('purchase-delete'));
    fireEvent.click(screen.getByTestId('purchase-delete-yes'));
    expect(readPurchases()).toHaveLength(0);
    expect(screen.queryByTestId('saved-purchases')).toBeNull();
  });

  it('should refuse an eleventh purchase with a notice and stay in the wizard, and accept it again after one is deleted', async () => {
    view();
    for (let i = 0; i < 10; i++) {
      await startRadar();
      saveAndClose();
    }
    expect(readPurchases()).toHaveLength(10);
    await startRadar();
    saveAndClose();
    expect(screen.getByTestId('saved-notice')).toHaveTextContent(s.full);
    expect(screen.getByTestId('gear-parameters-step')).toBeInTheDocument();
    expect(readPurchases()).toHaveLength(10);
    fireEvent.click(screen.getByTestId('gear-previous'));
    fireEvent.click(within(screen.getAllByTestId('purchases-open')[0]).getAllByTestId('purchase-delete')[0]);
    fireEvent.click(screen.getByTestId('purchase-delete-yes'));
    expect(readPurchases()).toHaveLength(9);
  });

  it('should carry no emoji and no hard-coded colour', async () => {
    view();
    await startRadar();
    saveAndClose();
    const section = screen.getByTestId('saved-purchases');
    expect(section.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(section.innerHTML).not.toMatch(/\b(bg|text|border)-(slate-(?!50\b)|white|black|gray|zinc|red|rose)/);
  });
});
