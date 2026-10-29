import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_CARE } from '@/types/maintain';
import { MaintainView } from '../MaintainView';

const EMOJI = /\p{Extended_Pictographic}/u;
const page = (locale: Locale) => render(<MaintainView t={translations[locale]} bikeId="current" bikeName="Road bike" kind="road" care={DEFAULT_CARE} onCareChange={() => undefined} today="2026-10-29" />);
const next = () => fireEvent.click(screen.getByTestId('wizard-next'));

describe.each(['en', 'cs'] as Locale[])('the workshop of bAIkcare (%s)', (locale) => {
  const t = translations[locale];
  const w = t.workshop;

  describe('the troubleshooter', () => {
    it('should list the eight symptoms in three groups and show the cause and the checks of the chosen one', () => {
      page(locale);
      const tree = screen.getByTestId('troubleshooter');
      expect(within(tree).getAllByRole('group')).toHaveLength(3);
      expect(within(tree).getAllByTestId(/^symptom-[a-zA-Z]+$/)).toHaveLength(8);
      fireEvent.click(screen.getByTestId('symptom-spongyLever'));
      const advice = screen.getByTestId('symptom-advice');
      expect(advice).toHaveTextContent(w.troubleshooter.symptoms.spongyLever.cause);
      expect(within(advice).getAllByRole('listitem')).toHaveLength(w.troubleshooter.symptoms.spongyLever.checks.length);
    });

    it('should open the guide that the symptom points to and come back to the workshop', () => {
      page(locale);
      fireEvent.click(screen.getByTestId('symptom-chainDrops'));
      fireEvent.click(screen.getByRole('button', { name: w.troubleshooter.wizardNames.derailleur }));
      expect(screen.getByTestId('derailleur-wizard')).toBeInTheDocument();
      expect(screen.queryByTestId('troubleshooter')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('wizard-back'));
      expect(screen.getByTestId('troubleshooter')).toBeInTheDocument();
    });

    it('should open the node of the M-Check for a symptom about play, and scroll to the chain gauge for a skipping chain', () => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      page(locale);
      fireEvent.click(screen.getByTestId('symptom-playLooseness'));
      fireEvent.click(screen.getByRole('button', { name: fill(w.troubleshooter.openNode, { n: 2 }) }));
      expect(screen.getByRole('dialog', { name: t.care.nodes['2'].name })).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.click(screen.getByTestId('symptom-chainSkips'));
      fireEvent.click(screen.getByRole('button', { name: w.troubleshooter.goToChain }));
      expect(scroll).toHaveBeenCalled();
    });
  });

  describe('the brake bleed guide', () => {
    const open = () => {
      page(locale);
      fireEvent.click(screen.getByTestId('symptom-spongyLever'));
      fireEvent.click(screen.getByRole('button', { name: w.troubleshooter.wizardNames.bleed }));
    };

    it('should ask for the fluid first, forbid mixing, and not go on until the fluid is chosen', () => {
      open();
      expect(screen.getByTestId('fluid-rule')).toHaveTextContent(w.bleed.fluidRule);
      expect(screen.getByTestId('bleed-wizard')).toHaveTextContent(w.bleed.steps[0].warning!);
      expect(screen.getByTestId('wizard-next')).toBeDisabled();
      expect(screen.getByTestId('wizard-blocker')).toHaveTextContent(w.bleed.needFluid);
      expect(screen.getByTestId('fluid-mineral')).toHaveTextContent(w.bleed.fluids.mineral.brands);
      fireEvent.click(screen.getByTestId('fluid-dot'));
      expect(screen.getByTestId('fluid-dot')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('wizard-next')).toBeEnabled();
    });

    it('should go through the five steps with the fluid, the mixing ban, the spacer and the isopropyl alcohol', () => {
      open();
      fireEvent.click(screen.getByTestId('fluid-mineral'));
      next();
      expect(screen.getByTestId('wizard-progress')).toHaveTextContent(fill(w.stepOf, { n: 2, total: 5 }));
      expect(screen.getByTestId('fluid-reminder')).toHaveTextContent(fill(w.bleed.chosen, { fluid: w.bleed.fluids.mineral.name }));
      expect(screen.getByTestId('fluid-reminder')).toHaveTextContent(w.bleed.mixWarning);
      expect(screen.getByTestId('bleed-wizard')).toHaveTextContent(w.bleed.steps[1].points[0]);
      next();
      expect(screen.getByTestId('bleed-wizard')).toHaveTextContent(w.bleed.steps[2].points[2]);
      expect(screen.getByTestId('wizard-warning')).toHaveTextContent(w.bleed.steps[2].warning!);
      next();
      next();
      expect(screen.getByTestId('bleed-wizard')).toHaveTextContent('99 %');
      expect(screen.getByTestId('wizard-next')).toHaveTextContent(w.finish);
      expect(screen.getByTestId('bleed-diagram')).toHaveAccessibleName(w.bleed.diagramLabel);
      next();
      expect(screen.getByTestId('troubleshooter')).toBeInTheDocument();
    });
  });

  describe('the derailleur guide', () => {
    it('should go through the four steps in order with the diagram of each, and go back', () => {
      page(locale);
      fireEvent.click(screen.getByTestId('symptom-noisyDrive'));
      fireEvent.click(screen.getByRole('button', { name: w.troubleshooter.wizardNames.derailleur }));
      expect(screen.getByTestId('wizard-previous')).toBeDisabled();
      for (const [index, step] of w.derailleur.steps.entries()) {
        expect(screen.getByTestId('wizard-progress')).toHaveTextContent(fill(w.stepOf, { n: index + 1, total: 4 }));
        expect(screen.getByTestId('derailleur-wizard')).toHaveTextContent(step.title);
        expect(screen.getByTestId('derailleur-diagram')).toHaveAccessibleName(w.derailleur.diagramLabel);
        if (index < 3) next();
      }
      expect(screen.getByTestId('derailleur-wizard')).toHaveTextContent(w.derailleur.steps[3].points[1]);
      fireEvent.click(screen.getByTestId('wizard-previous'));
      expect(screen.getByTestId('derailleur-wizard')).toHaveTextContent(w.derailleur.steps[2].title);
      expect(screen.getByTestId('derailleur-wizard')).toHaveTextContent(/1\/4|čtvrt|quarter/);
    });
  });

  describe('the rotor guide', () => {
    it('should tighten the caliper to 6 Nm with the lever held and then straighten a local bend with the fork', () => {
      page(locale);
      fireEvent.click(screen.getByTestId('symptom-rotorRub'));
      fireEvent.click(screen.getByRole('button', { name: w.troubleshooter.wizardNames.rotor }));
      next();
      expect(screen.getByTestId('rotor-wizard')).toHaveTextContent(w.rotor.steps[1].title);
      next();
      expect(screen.getByTestId('rotor-wizard')).toHaveTextContent('6 Nm');
      expect(screen.getByTestId('rotor-diagram')).toHaveTextContent('6 Nm');
      next();
      expect(screen.getByTestId('rotor-wizard')).toHaveTextContent(w.rotor.steps[3].points[1]);
      expect(screen.getByTestId('wizard-warning')).toHaveTextContent(w.rotor.steps[3].warning!);
    });
  });

  it('should have no emoji anywhere in the texts', () => {
    expect(JSON.stringify(w)).not.toMatch(EMOJI);
  });
});
