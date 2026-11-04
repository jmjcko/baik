import { NO_FIT } from '@/test/noFit';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import HomePage from '@/app/page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { MaintainView } from '../MaintainView';
import { addBikeFromSidebar, pickLanguage } from '@/test/accountMenu';
import { openCare, pickStep } from '@/test/careNav';

const EMOJI = /\p{Extended_Pictographic}/u;

function Harness({ locale, initial = DEFAULT_CARE, today = '2026-10-29' }: { locale: Locale; initial?: BikeCare; today?: string }) {
  const [care, setCare] = React.useState(initial);
  return <MaintainView locale={locale} fit={NO_FIT} t={translations[locale]} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={care} onCareChange={(patch) => setCare({ ...care, ...patch })} today={today} />;
}

describe.each(['en', 'cs'] as Locale[])('the bAIkcare page (%s)', (locale) => {
  const t = translations[locale];

  describe('the M-Check', () => {
    it('should show five nodes on the bike, all grey and not checked at the start', () => {
      render(<Harness locale={locale} />);
      const nodes = [1, 2, 3, 4, 5].map((n) => screen.getByTestId(`mcheck-node-${n}`));
      expect(nodes.every((node) => node.getAttribute('data-status') === 'unchecked')).toBe(true);
      expect(nodes[2]).toHaveAccessibleName(fill(t.care.mcheck.hotspot, { n: 3, name: t.care.nodes['3'].name, status: t.care.status.unchecked }));
      expect(screen.getByTestId('mcheck-summary')).toHaveTextContent(fill(t.care.mcheck.summary, { n: 0 }));
      expect(screen.getByTestId('mcheck-summary')).toHaveTextContent(t.care.mcheck.neverInspected);
    });

    it('should start on the first place that was not checked and show its step, with the node of the drawing marked', () => {
      render(<Harness locale={locale} />);
      expect(screen.getByTestId('step-panel')).toHaveAttribute('data-step', '0');
      expect(screen.getByTestId('mcheck-node-1')).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByTestId('mcheck-node-4'));
      expect(screen.getByTestId('step-panel')).toHaveAttribute('data-step', '3');
      expect(screen.getByRole('heading', { name: t.care.nodes['4'].name })).toBeInTheDocument();
      expect(screen.getByTestId('mcheck-node-4')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('mcheck-node-1')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should list what to do as lines to tick, the numbered checks of the node, and keep the ticks per step', () => {
      render(<Harness locale={locale} />);
      pickStep(4);
      const todo = within(screen.getByTestId('step-todo'));
      expect(todo.getAllByRole('checkbox')).toHaveLength(t.care.nodes['4'].steps.length);
      fireEvent.click(todo.getAllByRole('checkbox')[0]);
      expect(todo.getAllByRole('checkbox')[0]).toBeChecked();
      pickStep(1);
      expect(within(screen.getByTestId('step-todo')).getAllByRole('checkbox')[0]).not.toBeChecked();
      pickStep(4);
      expect(within(screen.getByTestId('step-todo')).getAllByRole('checkbox')[0]).toBeChecked();
    });

    it('should choose a step from the list of steps with the status of each place, the five places first and the two tyres after them', () => {
      render(<Harness locale={locale} />);
      const rows = screen.getAllByTestId(/^check-step-/);
      expect(rows).toHaveLength(7);
      expect(rows.map((row) => row.getAttribute('data-status'))).toEqual(Array(7).fill('unchecked'));
      expect(rows[1]).toHaveTextContent(t.care.nodes['2'].name);
      expect(rows[5]).toHaveTextContent(t.wheels.points.front);
      expect(rows[0]).toHaveAttribute('aria-current', 'step');
      pickStep(2);
      expect(rows[1]).toHaveAttribute('aria-current', 'step');
      fireEvent.click(screen.getByTestId('node-result-warn'));
      expect(rows[1]).toHaveAttribute('data-status', 'warn');
      expect(rows[1]).toHaveTextContent(t.care.status.warn);
      expect(screen.getByTestId('mcheck-node-2')).toHaveAttribute('data-status', 'warn');
    });

    it('should say what is saved, and show the day on the bike and in the list once the place was marked', () => {
      render(<Harness locale={locale} />);
      expect(screen.getByTestId('step-saved')).toHaveTextContent(t.care.guide.savedNone);
      fireEvent.click(screen.getByTestId('node-result-pass'));
      expect(screen.getByTestId('step-saved')).toHaveTextContent(fill(t.care.guide.savedLine, { name: t.care.nodes['1'].name, status: t.care.status.pass, date: '29. 10.' }));
      expect(screen.getAllByTestId('hotspot-date')[0]).toHaveTextContent('29. 10.');
      expect(screen.getByTestId('check-step-node-1')).toHaveTextContent('29. 10.');
    });

    it('should go from step to step with Back and Next, and finish the check with a summary after the last step', () => {
      render(<Harness locale={locale} />);
      expect(screen.getByTestId('step-back')).toBeDisabled();
      for (let i = 0; i < 6; i++) fireEvent.click(screen.getByTestId('step-next'));
      expect(screen.getByTestId('step-panel')).toHaveAttribute('data-step', '6');
      expect(screen.getByTestId('step-next')).toHaveTextContent(t.care.guide.finish);
      fireEvent.click(screen.getByTestId('step-next'));
      expect(screen.getByTestId('check-summary')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('check-again'));
      expect(screen.getByTestId('step-panel')).toHaveAttribute('data-step', '0');
    });

    it('should say what to do now at the top, with the progress and a button to the first open step, and say that the check is done at the end', () => {
      render(<Harness locale={locale} initial={{ ...DEFAULT_CARE, nodes: { 1: 'pass', 2: 'pass', 3: 'unchecked', 4: 'unchecked', 5: 'unchecked' } }} />);
      const banner = within(screen.getByTestId('check-banner'));
      expect(banner.getByText(fill(t.care.guide.bannerTitle, { n: 5, total: 7 }))).toBeInTheDocument();
      expect(banner.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
      expect(banner.getByTestId('check-continue')).toHaveTextContent(fill(t.care.guide.continue, { n: 3 }));
      expect(screen.getByTestId('step-panel')).toHaveAttribute('data-step', '2');
    });

    it('should put the tools of a step beside it: the brake guide at the cockpit, the derailleur and the rotor at the rear wheel, the flat repair at a tyre, nothing at the saddle', () => {
      render(<Harness locale={locale} />);
      pickStep(2);
      expect(screen.getByTestId('related-bleed')).toHaveTextContent(t.workshop.troubleshooter.wizardNames.bleed);
      pickStep(5);
      expect(within(screen.getByTestId('step-tools')).getAllByRole('button')).toHaveLength(2);
      pickStep(6);
      expect(within(screen.getByTestId('step-tools')).getAllByRole('button')).toHaveLength(2);
      expect(screen.getByTestId('related-flat')).toBeInTheDocument();
      pickStep(4);
      expect(screen.queryByTestId('step-tools')).not.toBeInTheDocument();
    });

    it('should colour a node by the result, write the day of the inspection, and list what needs attention', () => {
      render(<Harness locale={locale} />);
      for (const [node, result] of [[1, 'pass'], [3, 'warn'], [5, 'fail']] as const) {
        fireEvent.click(screen.getByTestId(`mcheck-node-${node}`));
        fireEvent.click(screen.getByTestId(`node-result-${result}`));
      }
      expect([1, 3, 5].map((n) => screen.getByTestId(`mcheck-node-${n}`).getAttribute('data-status'))).toEqual(['pass', 'warn', 'fail']);
      const summary = screen.getByTestId('mcheck-summary');
      expect(summary).toHaveTextContent(fill(t.care.mcheck.summary, { n: 3 }));
      expect(summary).toHaveTextContent(fill(t.care.mcheck.lastInspection, { date: '2026-10-29' }));
      expect(summary).toHaveTextContent(`${t.care.nodes['5'].short}, ${t.care.nodes['3'].short}`);
    });

    it('should take a result back to not checked', () => {
      render(<Harness locale={locale} initial={{ ...DEFAULT_CARE, nodes: { ...DEFAULT_CARE.nodes, 2: 'fail' } }} />);
      fireEvent.click(screen.getByTestId('mcheck-node-2'));
      fireEvent.click(screen.getByRole('button', { name: t.care.node.reset }));
      expect(screen.getByTestId('mcheck-node-2')).toHaveAttribute('data-status', 'unchecked');
    });
  });

  describe('the chain gauge', () => {
    const read = (text: string) => fireEvent.change(screen.getByTestId('chain-reading'), { target: { value: text } });
    const view = (initial?: BikeCare) => { render(<Harness locale={locale} initial={initial} />); openCare('chain'); };

    it('should say what a reading means for 11 to 12 speeds, and the limits move for 8 to 10', () => {
      view();
      expect(screen.getByTestId('chain-empty')).toBeInTheDocument();
      read('0.3');
      expect(screen.getByTestId('chain-verdict')).toHaveAttribute('data-verdict', 'ok');
      read('0,5');
      expect(screen.getByTestId('chain-verdict')).toHaveAttribute('data-verdict', 'replaceChain');
      expect(screen.getByTestId('chain-verdict')).toHaveTextContent(t.care.chain.verdicts.replaceChain.title);
      read('0.8');
      expect(screen.getByTestId('chain-verdict')).toHaveAttribute('data-verdict', 'replaceChainAndCassette');
      fireEvent.click(screen.getByTestId('chain-speeds-8-10'));
      expect(screen.getByTestId('chain-verdict')).toHaveAttribute('data-verdict', 'replaceChain');
      read('1.2');
      expect(screen.getByTestId('chain-verdict')).toHaveAttribute('data-verdict', 'replaceDrivetrain');
    });

    it('should refuse a reading that is not a number and clear the verdict when the field is emptied', () => {
      view({ ...DEFAULT_CARE, chainWearPct: 0.6 });
      expect(screen.getByTestId('chain-reading')).toHaveValue('0.6');
      read('abc');
      expect(screen.getByRole('alert')).toHaveTextContent(t.care.chain.invalid);
      expect(screen.getByTestId('chain-reading')).toHaveAttribute('aria-invalid', 'true');
      read('');
      expect(screen.getByTestId('chain-empty')).toBeInTheDocument();
    });
  });

  describe('the indoor trainer', () => {
    it('should say nothing alarming for a bike that is not on a trainer', () => {
      render(<Harness locale={locale} />);
      openCare('trainer');
      expect(screen.getByTestId('trainer-care')).toHaveTextContent(t.care.trainer.off);
      expect(screen.queryByTestId('tape-date')).not.toBeInTheDocument();
    });

    it('should ask for the day of the tape, then warn after six months and stay calm before', () => {
      render(<Harness locale={locale} />);
      openCare('trainer');
      fireEvent.click(screen.getByTestId('trainer-switch'));
      expect(screen.getByTestId('tape-unknown')).toHaveTextContent(t.care.trainer.unknown);
      fireEvent.change(screen.getByTestId('tape-date'), { target: { value: '2026-04-01' } });
      expect(screen.getByTestId('tape-due')).toHaveTextContent(t.care.trainer.due);
      fireEvent.change(screen.getByTestId('tape-date'), { target: { value: '2026-09-01' } });
      expect(screen.getByTestId('tape-fine')).toHaveTextContent(t.care.trainer.fine);
    });
  });

  describe('the wash', () => {
    it('should keep the golden order and show every prohibition', () => {
      render(<Harness locale={locale} />);
      openCare('wash');
      const steps = within(screen.getByTestId('wash-steps')).getAllByRole('listitem').map((step) => step.textContent);
      expect(steps[0]).toContain(t.care.wash.steps[0].title);
      expect(steps).toHaveLength(4);
      expect(steps[2]).toContain(t.care.wash.steps[2].title);
      expect(steps[3]).toContain(t.care.wash.steps[3].title);
      expect(screen.getByTestId('wash-protocol')).toHaveTextContent(t.care.wash.goldenRule);
      expect(within(screen.getByTestId('wash-prohibitions')).getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByTestId('wash-protocol')).toHaveTextContent('99');
    });
  });

  describe('the wash kit, the pressure warning and the tips', () => {
    it('should list the brushes and the cleaners before the steps, with isopropyl alcohol for the rotors', () => {
      render(<Harness locale={locale} />);
      openCare('wash');
      const kit = screen.getByTestId('wash-equipment');
      for (const item of [...t.care.wash.equipment.brushes, ...t.care.wash.equipment.chemistry]) expect(kit).toHaveTextContent(item.name);
      expect(kit).toHaveTextContent(t.care.wash.equipment.chemistry[2].text);
      expect(kit.compareDocumentPosition(screen.getByTestId('wash-steps')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should warn about the pressure washer with the safe way and the distance', () => {
      render(<Harness locale={locale} />);
      openCare('wash');
      const warning = screen.getByTestId('wash-pressure');
      expect(warning).toHaveTextContent(t.care.wash.pressure.title);
      expect(warning).toHaveTextContent(t.care.wash.pressure.safe);
    });

    it('should open and close the tip of every step on demand', () => {
      render(<Harness locale={locale} />);
      openCare('wash');
      for (const [index, step] of t.care.wash.steps.entries()) {
        const toggle = screen.getByTestId(`wash-tip-toggle-${index + 1}`);
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByTestId(`wash-tip-${index + 1}`)).not.toBeInTheDocument();
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByTestId(`wash-tip-${index + 1}`)).toHaveTextContent(step.tip);
        fireEvent.click(toggle);
        expect(screen.queryByTestId(`wash-tip-${index + 1}`)).not.toBeInTheDocument();
      }
    });
  });

  it('should have no emoji anywhere in the texts', () => {
    expect(JSON.stringify(t.care)).not.toMatch(EMOJI);
  });
});

describe.each(['en', 'cs'] as Locale[])('the bAIkcare module in the app (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => localStorage.clear());

  it('should open from the sidebar without a Coming Soon badge, and keep the findings of the bike in the passport', () => {
    render(<HomePage />);
    if (locale === 'cs') pickLanguage('CS');
    const item = within(screen.getByTestId('sidebar')).getByRole('button', { name: new RegExp(t.navigation.baikcareStudio) });
    expect(item).not.toHaveTextContent(t.navigation.comingSoon);
    fireEvent.click(item);
    expect(screen.getByTestId('maintain-view')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mcheck-node-5'));
    fireEvent.click(screen.getByTestId('node-result-fail'));
    openCare('chain');
    fireEvent.change(screen.getByTestId('chain-reading'), { target: { value: '0.9' } });
    const care = loadLocalPassport()?.passport.bikes[0].care;
    expect(care?.nodes[5]).toBe('fail');
    expect(care?.chainWearPct).toBe(0.9);
  });

  it('should add a bike that is used on an indoor trainer from the garage form', () => {
    render(<HomePage />);
    if (locale === 'cs') pickLanguage('CS');
    addBikeFromSidebar(t);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(t.profile.garage.nameLabel), { target: { value: 'Rollers' } });
    fireEvent.click(within(dialog).getByLabelText(new RegExp(t.profile.garage.trainerLabel)));
    fireEvent.click(within(dialog).getByRole('button', { name: t.profile.garage.create }));
    expect(loadLocalPassport()?.passport.bikes.find((bike) => bike.name === 'Rollers')?.care?.trainer).toBe(true);
  });
});
