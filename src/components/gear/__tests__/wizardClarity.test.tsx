import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { GearView } from '../GearView';

const research = vi.fn();
vi.mock('@/app/actions/researchGearParameters', () => ({ researchGearParameters: (...args: unknown[]) => research(...args) }));

const values = { ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } };
const ai = (id: string, name: string, importance: string, suggestedValues: string[] = []) => ({ id, name, importance, rationale: `${name} matters.`, suggestedValues, multi: false });
const found = { success: true, result: { productTitle: 'Road bar tape', category: 'barTape', parameters: [ai('ai_thickness_0', 'Thickness', 'mandatory', ['2 mm', '3 mm']), ai('ai_material_1', 'Material', 'recommended'), ai('brands', 'Brands', 'optional')] } };
const next = () => fireEvent.click(screen.getByTestId('gear-next'));

describe.each(['en', 'cs'] as Locale[])('the clarity of the bAIkgear wizard (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => { research.mockReset(); research.mockResolvedValue(found); window.localStorage.clear(); });

  /** Researches a product (step 2 of the wizard) and presses on `steps` times. */
  const toStep = async (steps: number) => {
    render(<GearView t={t} locale={locale} values={values} />);
    fireEvent.change(screen.getByTestId('product-input'), { target: { value: 'bar tape' } });
    fireEvent.click(screen.getByTestId('product-find'));
    await screen.findByTestId('gear-parameters-step');
    for (let i = 0; i < steps; i += 1) next();
  };

  it('should open with the field of the product first and the explanation folded below it', () => {
    render(<GearView t={t} locale={locale} values={values} />);
    const input = screen.getByTestId('product-input');
    expect(within(screen.getByTestId('gear-turn-action')).getByTestId('product-input')).toBe(input);
    expect(screen.getByTestId('gear-turn')).toContainElement(screen.getByTestId('product-find'));
    const how = screen.getByTestId('how-it-works');
    expect(input.compareDocumentPosition(how) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('gear-turn-title')).toHaveTextContent(t.gear.turn.product);
    expect(screen.getByTestId('gear-turn')).toHaveTextContent(t.gear.turn.label);
    expect(screen.getByText(t.gear.product.orPick)).toBeInTheDocument();
  });

  it('should take the field out of the box after the first step', async () => {
    await toStep(0);
    expect(screen.queryByTestId('gear-turn-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-input')).not.toBeInTheDocument();
  });

  it('should make the field visible: its own field tokens, never the surface of the card', () => {
    render(<GearView t={t} locale={locale} values={values} />);
    const classes = screen.getByTestId('product-input').className;
    expect(classes).toContain('bg-field');
    expect(classes).toContain('border-field-line');
    expect(classes).not.toMatch(/\bbg-surface\b|\bborder-line\b/);
  });

  it.each([[0, 'parameters'], [1, 'answers'], [2, 'insight']] as const)('should say in one command what to do now (after %d next)', async (steps, id) => {
    await toStep(steps);
    expect(screen.getByTestId('gear-turn-title')).toHaveTextContent(t.gear.turn[id]);
  });

  it('should mark every question as required, recommended or optional and show which are answered', async () => {
    await toStep(1);
    expect(screen.getByTestId('importance-ai_thickness_0')).toHaveTextContent(t.gear.importance.mandatory);
    expect(screen.getByTestId('importance-ai_material_1')).toHaveTextContent(t.gear.importance.recommended);
    const total = within(screen.getByTestId('gear-answers-step')).getAllByTestId(/^field-/).length;
    expect(screen.getByTestId('answered-count')).toHaveTextContent(fill(t.gear.answeredOf, { n: 0, total }));
    expect(screen.getByTestId('field-ai_thickness_0')).toHaveAttribute('data-answered', 'false');
    fireEvent.click(screen.getByTestId('param-ai_thickness_0-2 mm'));
    expect(screen.getByTestId('field-ai_thickness_0')).toHaveAttribute('data-answered', 'true');
    expect(screen.getByTestId('answered-count')).toHaveTextContent(fill(t.gear.answeredOf, { n: 1, total }));
  });

  it('should keep every step reachable without a required answer', async () => {
    await toStep(2);
    expect(screen.getByTestId('gear-insight-step')).toBeInTheDocument();
  });
});
