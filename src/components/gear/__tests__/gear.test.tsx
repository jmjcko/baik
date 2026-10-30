import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import HomePage from '@/app/page';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { GEAR_CATEGORIES, GEAR_GROUPS } from '@/types/gearTypes';
import { GearView } from '../GearView';

const research = vi.fn();
vi.mock('@/app/actions/researchGearParameters', () => ({ researchGearParameters: (...args: unknown[]) => research(...args) }));

const values = { ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } };
const ai = (id: string, name: string, over: Record<string, unknown> = {}) => ({ id, name, importance: 'recommended', rationale: `${name} matters.`, suggestedValues: [] as string[], multi: false, ...over });
const found = (category: string | null = 'barTape', extra: unknown[] = []) => ({
  success: true,
  result: {
    productTitle: 'Road bar tape',
    category,
    parameters: [
      ai('ai_thickness_0', 'Thickness', { importance: 'mandatory', rationale: 'Comfort and vibration damping.', suggestedValues: ['2 mm', '3 mm', '4 mm'], multi: true }),
      ai('ai_material_1', 'Material', { rationale: 'Grip when wet.' }),
      ...extra,
      ai('ai_grip_9', 'Grip pattern', { importance: 'optional' }),
      ai('brands', 'Brands and manufacturers', { rationale: 'Trust.' }),
    ],
  },
});
const next = () => fireEvent.click(screen.getByTestId('gear-next'));

describe.each(['en', 'cs'] as Locale[])('the bAIkgear advisor (%s)', (locale) => {
  const t = translations[locale];
  const g = t.gear;
  const view = () => render(<GearView t={t} locale={locale} values={values} />);
  const find = async (query = 'bar tape') => {
    fireEvent.change(screen.getByTestId('product-input'), { target: { value: query } });
    fireEvent.click(screen.getByTestId('product-find'));
    await screen.findByTestId('gear-parameters-step');
  };

  beforeEach(() => { research.mockReset(); research.mockResolvedValue(found()); });
  afterEach(() => vi.unstubAllGlobals());

  describe('step 1, the product and the explanation', () => {
    it('should explain how it works in three steps, say that it sells nothing, and show an example of the prompt on demand', () => {
      view();
      const how = screen.getByTestId('how-it-works');
      expect(within(how).getAllByRole('listitem')).toHaveLength(3);
      for (const item of g.howItWorks.items) expect(how).toHaveTextContent(item.title);
      expect(how).toHaveTextContent(g.howItWorks.notShop);
      expect(screen.queryByTestId('example-prompt')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('example-toggle'));
      expect(screen.getByTestId('example-prompt')).toHaveTextContent(g.howItWorks.example[0]);
      expect(screen.getByTestId('example-toggle')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('gear-step-help')).toHaveTextContent(g.stepHelp.product);
      expect(screen.getByTestId('gear-progress')).toHaveTextContent(fill(g.stepOf, { n: 1, total: 5 }));
    });

    it('should say that the product text is sent to an AI service and the body is not, and wait for at least two characters', () => {
      view();
      expect(screen.getByTestId('product-ai-note')).toHaveTextContent(g.product.aiNote);
      expect(screen.getByTestId('product-find')).toBeDisabled();
      fireEvent.change(screen.getByTestId('product-input'), { target: { value: 'a' } });
      expect(screen.getByTestId('product-find')).toBeDisabled();
      fireEvent.change(screen.getByTestId('product-input'), { target: { value: 'ab' } });
      expect(screen.getByTestId('product-find')).toBeEnabled();
    });

    it('should offer the popular choices and, on demand, all categories in seven groups', () => {
      view();
      expect(screen.getAllByTestId(/^popular-/)).toHaveLength(10);
      expect(screen.queryByTestId('all-categories')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('browse-toggle'));
      expect(within(screen.getByTestId('all-categories')).getAllByRole('group')).toHaveLength(GEAR_GROUPS.length);
      expect(screen.getAllByTestId(/^category-/)).toHaveLength(GEAR_CATEGORIES.length);
    });
  });

  describe('step 2, the parameters', () => {
    it('should research the typed product with only its text, the language, the discipline and no known questions, and show the parameters as cards', async () => {
      view();
      await find();
      expect(research).toHaveBeenCalledWith({ query: 'bar tape', locale, discipline: 'road', known: [] });
      expect(screen.getByTestId('picker-title')).toHaveTextContent(fill(g.picker.title, { product: 'Road bar tape' }));
      expect(screen.getByTestId('parameter-ai_thickness_0')).toHaveTextContent('Comfort and vibration damping.');
      expect(screen.queryByTestId('picker-fallback')).not.toBeInTheDocument();
    });

    it('should choose the important parameters, fold the optional ones away and show them on demand', async () => {
      view();
      await find();
      expect(screen.getByTestId('picker-count')).toHaveTextContent(fill(g.picker.selected, { n: 3, total: 4 }));
      expect(within(screen.getByTestId('group-suggested')).getByTestId('parameter-brands')).toBeInTheDocument();
      expect(screen.queryByTestId('parameter-ai_grip_9')).not.toBeInTheDocument();
      expect(screen.getByTestId('more-toggle')).toHaveTextContent(fill(g.picker.moreShow, { n: 1 }));
      fireEvent.click(screen.getByTestId('more-toggle'));
      const grip = within(screen.getByTestId('group-more')).getByTestId('parameter-ai_grip_9');
      expect(within(grip).getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(within(grip).getByRole('checkbox'));
      expect(screen.getByTestId('picker-count')).toHaveTextContent(fill(g.picker.selected, { n: 4, total: 4 }));
    });

    it('should have no question about the budget, the currency or limits among the cards', async () => {
      view();
      await find();
      expect(screen.queryByTestId('parameter-budget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parameter-currency')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parameter-constraints')).not.toBeInTheDocument();
    });

    it('should pin the questions of the knowledge base for a picked category, send their names so they are not asked twice, and not show a repeat', async () => {
      research.mockResolvedValue(found('tyres', [ai('ai_rim_5', g.params.rimWidth.label.toUpperCase()), ai('ai_tyre_6', 'Tubeless readiness', { importance: 'mandatory' })]));
      view();
      fireEvent.click(screen.getByTestId('popular-tyres'));
      await screen.findByTestId('gear-parameters-step');
      expect(research).toHaveBeenCalledWith({ query: g.categories.tyres, locale, discipline: 'road', known: [g.params.rimWidth.label, g.params.tyreWidth.label, g.params.system.label, g.params.priority.label] });
      expect(within(screen.getByTestId('group-kb')).getByTestId('kb-rimWidth')).toHaveTextContent(g.picker.fromKb);
      expect(screen.queryByTestId('parameter-ai_rim_5')).not.toBeInTheDocument();
      expect(screen.getByTestId('parameter-ai_tyre_6')).toBeInTheDocument();
    });

    it('should let the rider take a parameter off, remove it, add one of their own and reset the list', async () => {
      view();
      await find();
      const checkbox = (id: string) => within(screen.getByTestId(`parameter-${id}`)).getByRole('checkbox');
      fireEvent.click(checkbox('ai_material_1'));
      expect(checkbox('ai_material_1')).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(screen.getByTestId('remove-ai_thickness_0'));
      expect(screen.queryByTestId('parameter-ai_thickness_0')).not.toBeInTheDocument();
      fireEvent.change(screen.getByTestId('custom-name'), { target: { value: 'Tape width' } });
      fireEvent.click(screen.getByTestId('custom-add'));
      expect(within(screen.getByTestId('group-own')).getByText('Tape width')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('picker-reset'));
      expect(screen.getByTestId('parameter-ai_thickness_0')).toBeInTheDocument();
      expect(screen.queryByText('Tape width')).not.toBeInTheDocument();
      expect(screen.getByTestId('picker-count')).toHaveTextContent(fill(g.picker.selected, { n: 3, total: 4 }));
    });

    it('should not go on without a chosen parameter', async () => {
      view();
      await find();
      for (const card of screen.getAllByRole('checkbox')) if (card.getAttribute('aria-checked') === 'true') fireEvent.click(card);
      expect(screen.getByTestId('gear-next')).toBeDisabled();
    });

    it('should offer to try the AI preparation again when the service was unavailable, and show the research when it works', async () => {
      research.mockResolvedValue({ success: false, error: 'unavailable' });
      view();
      await find();
      expect(screen.getByTestId('picker-fallback')).toHaveTextContent(g.picker.fallback);
      research.mockResolvedValue(found());
      fireEvent.click(screen.getByTestId('picker-retry'));
      await screen.findByTestId('parameter-ai_thickness_0');
      expect(screen.queryByTestId('picker-fallback')).not.toBeInTheDocument();
      expect(research).toHaveBeenCalledTimes(2);
    });

    it('should not offer to try again when there is no key or the product is out of scope', async () => {
      research.mockResolvedValue({ success: false, error: 'not_configured' });
      view();
      await find();
      expect(screen.queryByTestId('picker-retry')).not.toBeInTheDocument();
    });

    it.each([['not_configured', 'fallback'], ['out_of_scope', 'outOfScope'], ['rate_limited', 'rateLimited']] as const)('should show the standard questions with a notice when the research says %s', async (error, key) => {
      research.mockResolvedValue({ success: false, error });
      view();
      await find();
      expect(screen.getByTestId('picker-fallback')).toHaveTextContent(g.picker[key]);
      expect(screen.getByTestId('parameter-usage')).toBeInTheDocument();
      expect(screen.queryByTestId('parameter-ai_thickness_0')).not.toBeInTheDocument();
    });
  });

  describe('step 3, the answers', () => {
    const toAnswers = async (category: string | null = 'tyres') => {
      research.mockResolvedValue(found(category));
      view();
      await find('tyres');
      next();
    };

    it('should ask each chosen question, fill in what the garage knows and take its answers, also an own one', async () => {
      await toAnswers();
      expect(screen.getByTestId('gear-step-help')).toHaveTextContent(g.stepHelp.answers);
      expect(screen.getByTestId('param-system-tubeless')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('garage-system')).toHaveTextContent(g.fromGarage);
      fireEvent.click(screen.getByTestId('param-system-tube'));
      expect(screen.queryByTestId('garage-system')).not.toBeInTheDocument();
      fireEvent.change(screen.getByTestId('param-ai_material_1'), { target: { value: 'cork' } });
      expect(screen.getByTestId('param-ai_material_1')).toHaveValue('cork');
      fireEvent.change(screen.getByTestId('param-rimWidth'), { target: { value: '21,5' } });
      expect(screen.getByTestId('param-rimWidth')).toHaveValue('21.5');
      fireEvent.change(screen.getByTestId('param-rimWidth'), { target: { value: 'wide' } });
      expect(screen.getByTestId('param-rimWidth')).toHaveValue('');
    });

    it('should let several values be chosen when the question allows it, and take an own answer instead', async () => {
      await toAnswers();
      fireEvent.click(screen.getByTestId('param-ai_thickness_0-2 mm'));
      fireEvent.click(screen.getByTestId('param-ai_thickness_0-3 mm'));
      expect(screen.getByTestId('param-ai_thickness_0-2 mm')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('param-ai_thickness_0-3 mm')).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByTestId('param-ai_thickness_0-2 mm'));
      expect(screen.getByTestId('param-ai_thickness_0-2 mm')).toHaveAttribute('aria-pressed', 'false');
      fireEvent.change(screen.getByTestId('param-ai_thickness_0-own'), { target: { value: '2.5 mm gel' } });
      expect(screen.getByTestId('param-ai_thickness_0-3 mm')).toHaveAttribute('aria-pressed', 'false');
    });

    it('should ask for the preferred brands and the brands to avoid in two fields', async () => {
      await toAnswers();
      fireEvent.change(screen.getByTestId('param-brands-preferred'), { target: { value: 'Supacaz; Lizard Skins' } });
      fireEvent.change(screen.getByTestId('param-brands-avoid'), { target: { value: 'Noname' } });
      expect(screen.getByTestId('param-brands-preferred')).toHaveValue('Supacaz, Lizard Skins');
      expect(screen.getByTestId('param-brands-avoid')).toHaveValue('Noname');
      fireEvent.change(screen.getByTestId('param-brands-preferred'), { target: { value: '' } });
      expect(screen.getByTestId('param-brands-avoid')).toHaveValue('Noname');
    });

    it('should show the budget as one card with its currency: the euro and the dollar in English, the crown and the euro in Czech', async () => {
      await toAnswers();
      const first = locale === 'en' ? 'eur' : 'czk';
      const second = locale === 'en' ? 'usd' : 'eur';
      expect(within(screen.getByTestId('budget-field')).getAllByRole('button')).toHaveLength(2);
      expect(screen.getByTestId(`budget-currency-${first}`)).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByTestId(`budget-currency-${second}`));
      expect(screen.getByTestId(`budget-currency-${second}`)).toHaveAttribute('aria-pressed', 'true');
      fireEvent.change(screen.getByTestId('budget-amount'), { target: { value: '1 5o0' } });
      expect(screen.getByTestId('budget-amount')).toHaveValue('150');
      expect(screen.queryByTestId('field-currency')).not.toBeInTheDocument();
    });

    it('should show only the chosen questions', async () => {
      research.mockResolvedValue(found());
      view();
      await find();
      fireEvent.click(screen.getByTestId('remove-ai_material_1'));
      next();
      expect(screen.queryByTestId('field-ai_material_1')).not.toBeInTheDocument();
      expect(screen.getByTestId('field-ai_thickness_0')).toBeInTheDocument();
    });
  });

  describe('step 4, the rules of the knowledge base', () => {
    it('should show the rules of the category with their sources, and say so when there is none', async () => {
      research.mockResolvedValue(found('tyres'));
      view();
      await find('tyres');
      next(); next();
      for (const id of ['roiTyres', 'pressure', 'tubeless']) expect(screen.getByTestId(`insight-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId('insight-pressure')).toHaveTextContent(fill(g.insight.source, { source: t.gearKb.insights.pressure.source }));
    });

    it('should say that the knowledge base has no rule for a product that matches no category', async () => {
      research.mockResolvedValue(found(null));
      view();
      await find('mirror');
      next(); next();
      expect(screen.getByTestId('insight-none')).toHaveTextContent(g.insight.none);
    });
  });

  describe('step 5 and the master prompt', () => {
    const toPrompt = async () => {
      view();
      await find();
      next();
      fireEvent.click(screen.getByTestId('param-ai_thickness_0-3 mm'));
      fireEvent.change(screen.getByTestId('budget-amount'), { target: { value: '800' } });
      next(); next();
    };
    const open = async () => { await toPrompt(); fireEvent.click(screen.getByTestId('prompt-open')); };
    const preview = () => (screen.getByTestId('prompt-preview') as HTMLTextAreaElement).value;
    const currency = locale === 'en' ? 'EUR' : 'CZK';

    it('should sum up the chosen parameters and the budget, with "help me decide" for what has no answer', async () => {
      await toPrompt();
      const list = screen.getByTestId('prompt-answers');
      expect(list).toHaveTextContent('Thickness: 3 mm');
      expect(list).toHaveTextContent(`${g.budget.label}: 800 ${currency}`);
      expect(list).toHaveTextContent(`Material: ${t.gearKb.prompt.undecided}`);
    });

    it('should open the dialog with the prompt, which names the product, does not name its author, and closes with Escape', async () => {
      await open();
      expect(screen.getByRole('dialog', { name: g.modal.title })).toBeInTheDocument();
      expect(preview()).toContain('# Road bar tape');
      expect(preview()).toContain(t.gearKb.prompt.role);
      expect(preview()).toContain(`- ${g.budget.label}: 800 ${currency}`);
      expect(preview()).not.toMatch(/luke/i);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should carry the notes of the rider in their own section, and none when there are none', async () => {
      await toPrompt();
      expect(screen.getByTestId('notes-input')).toHaveValue('');
      fireEvent.click(screen.getByTestId('prompt-open'));
      expect(preview()).not.toContain(t.gearKb.prompt.headings.notes);
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'Two year warranty, black only' } });
      fireEvent.click(screen.getByTestId('prompt-open'));
      expect(preview()).toContain(`## ${t.gearKb.prompt.headings.notes}\nTwo year warranty, black only`);
    });

    it('should let the rider keep the body and the bike out of the text, and show how long it is', async () => {
      await open();
      expect(preview()).toContain(`${values.riderWeightKg} kg`);
      const size = preview().length;
      expect(screen.getByTestId('prompt-size')).toHaveTextContent(fill(g.modal.size, { n: size }));
      fireEvent.click(screen.getByTestId('include-rider'));
      expect(preview()).not.toContain(`${values.riderWeightKg} kg`);
      expect(preview()).toContain(t.gearKb.prompt.riderHidden);
      fireEvent.click(screen.getByTestId('include-bike'));
      expect(preview()).toContain(t.gearKb.prompt.bikeHidden);
      expect(preview()).toContain('Thickness: 3 mm');
    });

    it('should copy the text to the clipboard and say so, or say that it could not be copied', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
      await open();
      fireEvent.click(screen.getByTestId('prompt-copy'));
      await waitFor(() => expect(screen.getByTestId('prompt-copy')).toHaveTextContent(g.modal.copied));
      expect(writeText).toHaveBeenCalledWith(preview());
      writeText.mockRejectedValue(new Error('denied'));
      fireEvent.click(screen.getByTestId('include-rider'));
      fireEvent.click(screen.getByTestId('prompt-copy'));
      expect(await screen.findByTestId('prompt-failed')).toHaveTextContent(g.modal.failed);
    });
  });

  describe('in the app', () => {
    beforeEach(() => localStorage.clear());

    it('should open from the tile of the dashboard and from the sidebar, with no Coming Soon left', () => {
      render(<HomePage />);
      if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
      fireEvent.click(within(screen.getByTestId('module-tiles')).getByRole('button', { name: new RegExp(t.shell.dashboard.modules.shop.title) }));
      expect(screen.getByTestId('gear-view')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: g.title })).toBeInTheDocument();
      const nav = within(screen.getByRole('navigation', { name: t.shell.sidebar.mainLabel }));
      expect(nav.getByRole('button', { name: t.navigation.baikshopAdvisory })).toHaveAttribute('aria-current', 'page');
      expect(nav.queryByText(t.navigation.comingSoon)).not.toBeInTheDocument();
    });
  });
});
