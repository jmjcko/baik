import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import HomePage from '@/app/page';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { GEAR_CATEGORIES } from '@/types/gearTypes';
import { GearView } from '../GearView';

const values = { ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } };
const next = () => fireEvent.click(screen.getByTestId('gear-next'));

describe.each(['en', 'cs'] as Locale[])('the bAIkgear advisor (%s)', (locale) => {
  const t = translations[locale];
  const g = t.gear;

  describe('step 1, the category', () => {
    it('should list the thirty categories in five groups and not go on before one is chosen', () => {
      render(<GearView t={t} values={values} />);
      expect(within(screen.getByTestId('gear-category-step')).getAllByRole('group')).toHaveLength(5);
      expect(screen.getAllByTestId(/^category-/)).toHaveLength(GEAR_CATEGORIES.length);
      expect(screen.getByTestId('gear-next')).toBeDisabled();
      expect(screen.getByTestId('gear-previous')).toBeDisabled();
      fireEvent.click(screen.getByTestId('category-tyres'));
      expect(screen.getByTestId('category-tyres')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('gear-next')).toBeEnabled();
    });
  });

  describe('step 2, the questions', () => {
    const open = (category: string) => {
      render(<GearView t={t} values={values} />);
      fireEvent.click(screen.getByTestId(`category-${category}`));
      next();
    };

    it('should ask the own questions of a category from the knowledge base and fill in what the garage knows', () => {
      open('tyres');
      expect(screen.getByTestId('survey-note')).toHaveTextContent(g.deepNote);
      for (const id of ['rimWidth', 'tyreWidth', 'system', 'priority', 'budget', 'brands', 'constraints']) expect(screen.getByTestId(`field-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId('param-system-tubeless')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('garage-system')).toHaveTextContent(g.fromGarage);
    });

    it('should take an answer by a card or a number, take it back, and drop the garage note when the rider changes it', () => {
      open('tyres');
      fireEvent.click(screen.getByTestId('param-system-tube'));
      expect(screen.getByTestId('param-system-tube')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByTestId('garage-system')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('param-system-tube'));
      expect(screen.getByTestId('param-system-tube')).toHaveAttribute('aria-pressed', 'false');
      fireEvent.change(screen.getByTestId('param-rimWidth'), { target: { value: '21,5' } });
      expect(screen.getByTestId('param-rimWidth')).toHaveValue('21.5');
      fireEvent.change(screen.getByTestId('param-rimWidth'), { target: { value: 'wide' } });
      expect(screen.getByTestId('param-rimWidth')).toHaveValue('');
    });

    it('should give a category without questions of its own the general form', () => {
      open('barTape');
      expect(screen.getByTestId('survey-note')).toHaveTextContent(g.generalNote);
      expect(screen.queryByTestId('field-rimWidth')).not.toBeInTheDocument();
      expect(screen.getByTestId('field-budget')).toBeInTheDocument();
    });
  });

  describe('step 3, the rules of the knowledge base', () => {
    it('should show the rules of the category with their sources, and say so when there is none', () => {
      render(<GearView t={t} values={values} />);
      fireEvent.click(screen.getByTestId('category-tyres'));
      next(); next();
      for (const id of ['roiTyres', 'pressure', 'tubeless']) expect(screen.getByTestId(`insight-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId('insight-pressure')).toHaveTextContent(fill(g.insight.source, { source: t.gearKb.insights.pressure.source }));
      fireEvent.click(screen.getByTestId('gear-previous'));
      fireEvent.click(screen.getByTestId('gear-previous'));
      fireEvent.click(screen.getByTestId('category-pedals'));
      next(); next();
      expect(screen.getByTestId('insight-none')).toHaveTextContent(g.insight.none);
    });
  });

  describe('step 4 and the master prompt', () => {
    const toPrompt = () => {
      render(<GearView t={t} values={values} />);
      fireEvent.click(screen.getByTestId('category-tyres'));
      next();
      fireEvent.change(screen.getByTestId('param-rimWidth'), { target: { value: '21' } });
      fireEvent.change(screen.getByTestId('param-budget'), { target: { value: '3000' } });
      fireEvent.click(screen.getByTestId('param-currency-czk'));
      next(); next();
    };
    const open = () => { toPrompt(); fireEvent.click(screen.getByTestId('prompt-open')); };

    afterEach(() => vi.unstubAllGlobals());

    it('should sum up the answers and open the dialog with the prompt, which can be closed with Escape', () => {
      toPrompt();
      expect(screen.getByTestId('prompt-answers')).toHaveTextContent(`${t.gear.params.rimWidth.label}: 21 mm`);
      expect(screen.getByTestId('prompt-answers')).toHaveTextContent(`${t.gear.params.budget.label}: 3000 ${t.gear.options.currency.czk}`);
      fireEvent.click(screen.getByTestId('prompt-open'));
      const dialog = screen.getByRole('dialog', { name: g.modal.title });
      expect((within(dialog).getByTestId('prompt-preview') as HTMLTextAreaElement).value).toContain(t.gearKb.prompt.role);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should let the rider keep the body and the bike out of the text, and show how long it is', () => {
      open();
      const preview = () => (screen.getByTestId('prompt-preview') as HTMLTextAreaElement).value;
      expect(preview()).toContain(`${values.riderWeightKg} kg`);
      expect(preview()).toContain(`${t.gearKb.prompt.labels.crank}: ${values.crankLengthMm} mm`);
      const size = preview().length;
      expect(screen.getByTestId('prompt-size')).toHaveTextContent(fill(g.modal.size, { n: size }));
      fireEvent.click(screen.getByTestId('include-rider'));
      expect(preview()).not.toContain(`${values.riderWeightKg} kg`);
      expect(preview()).toContain(t.gearKb.prompt.riderHidden);
      fireEvent.click(screen.getByTestId('include-bike'));
      expect(preview()).not.toContain(`${t.gearKb.prompt.labels.crank}:`);
      expect(preview()).toContain(t.gearKb.prompt.bikeHidden);
      expect(preview()).toContain(`${t.gear.params.rimWidth.label}: 21 mm`);
      expect(preview().length).toBeLessThan(size);
    });

    it('should copy the text to the clipboard and say so, or say that it could not be copied', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
      open();
      fireEvent.click(screen.getByTestId('prompt-copy'));
      await waitFor(() => expect(screen.getByTestId('prompt-copy')).toHaveTextContent(g.modal.copied));
      expect(writeText).toHaveBeenCalledWith((screen.getByTestId('prompt-preview') as HTMLTextAreaElement).value);
      writeText.mockRejectedValue(new Error('denied'));
      fireEvent.click(screen.getByTestId('include-rider'));
      fireEvent.click(screen.getByTestId('prompt-copy'));
      expect(await screen.findByTestId('prompt-failed')).toHaveTextContent(g.modal.failed);
    });
  });

  describe('in the app', () => {
    beforeEach(() => localStorage.clear());

    it('should open from the sidebar item and from the tile of the dashboard, with no Coming Soon left', () => {
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
