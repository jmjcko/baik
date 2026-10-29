import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import HomePage from '@/app/page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { MaintainView } from '../MaintainView';

const EMOJI = /\p{Extended_Pictographic}/u;

function Harness({ locale, initial = DEFAULT_CARE, today = '2026-10-29' }: { locale: Locale; initial?: BikeCare; today?: string }) {
  const [care, setCare] = React.useState(initial);
  return <MaintainView t={translations[locale]} bikeId="current" bikeName="Road bike" kind="road" care={care} onCareChange={(patch) => setCare({ ...care, ...patch })} today={today} />;
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

    it('should open the card of a node with its numbered steps and its drawing, and close it with Escape', () => {
      render(<Harness locale={locale} />);
      fireEvent.click(screen.getByTestId('mcheck-node-4'));
      const dialog = screen.getByRole('dialog', { name: t.care.nodes['4'].name });
      expect(within(dialog).getAllByRole('listitem')).toHaveLength(t.care.nodes['4'].steps.length);
      expect(within(dialog).getByTestId('node-diagram-4')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should colour a node by the result, write the day of the inspection, and list what needs attention', () => {
      render(<Harness locale={locale} />);
      for (const [node, result] of [[1, 'pass'], [3, 'warn'], [5, 'fail']] as const) {
        fireEvent.click(screen.getByTestId(`mcheck-node-${node}`));
        fireEvent.click(within(screen.getByRole('dialog')).getByTestId(`node-result-${result}`));
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: t.care.node.close }));
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

    it('should say what a reading means for 11 to 12 speeds, and the limits move for 8 to 10', () => {
      render(<Harness locale={locale} />);
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
      render(<Harness locale={locale} initial={{ ...DEFAULT_CARE, chainWearPct: 0.6 }} />);
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
      expect(screen.getByTestId('trainer-care')).toHaveTextContent(t.care.trainer.off);
      expect(screen.queryByTestId('tape-date')).not.toBeInTheDocument();
    });

    it('should ask for the day of the tape, then warn after six months and stay calm before', () => {
      render(<Harness locale={locale} />);
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
      const steps = within(screen.getByTestId('wash-steps')).getAllByRole('listitem').map((step) => step.textContent);
      expect(steps[0]).toContain(t.care.wash.steps[0].title);
      expect(steps[2]).toContain(t.care.wash.steps[2].title);
      expect(screen.getByTestId('wash-protocol')).toHaveTextContent(t.care.wash.goldenRule);
      expect(within(screen.getByTestId('wash-prohibitions')).getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByTestId('wash-protocol')).toHaveTextContent('99');
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
    if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    const item = within(screen.getByTestId('sidebar')).getByRole('button', { name: new RegExp(t.navigation.baikcareStudio) });
    expect(item).not.toHaveTextContent(t.navigation.comingSoon);
    fireEvent.click(item);
    expect(screen.getByTestId('maintain-view')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mcheck-node-5'));
    fireEvent.click(screen.getByTestId('node-result-fail'));
    fireEvent.change(screen.getByTestId('chain-reading'), { target: { value: '0.9' } });
    const care = loadLocalPassport()?.passport.bikes[0].care;
    expect(care?.nodes[5]).toBe('fail');
    expect(care?.chainWearPct).toBe(0.9);
  });

  it('should add a bike that is used on an indoor trainer from the garage form', () => {
    render(<HomePage />);
    if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    fireEvent.click(within(screen.getByTestId('sidebar-garage')).getByRole('button', { name: t.shell.sidebar.addBike }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(t.profile.garage.nameLabel), { target: { value: 'Rollers' } });
    fireEvent.click(within(dialog).getByLabelText(new RegExp(t.profile.garage.trainerLabel)));
    fireEvent.click(within(dialog).getByRole('button', { name: t.profile.garage.create }));
    expect(loadLocalPassport()?.passport.bikes.find((bike) => bike.name === 'Rollers')?.care?.trainer).toBe(true);
  });
});
