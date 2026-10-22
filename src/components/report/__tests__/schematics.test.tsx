import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { BarSchematic } from '../schematics/BarSchematic';
import { CrankSchematic } from '../schematics/CrankSchematic';
import { SaddleSchematic } from '../schematics/SaddleSchematic';

const RED = '#f43f5e';
const GREEN = '#34d399';

describe.each(['en', 'cs'] as Locale[])('report schematics (%s)', (locale) => {
  const t = translations[locale].diagnosticReport.schematics;

  describe('SaddleSchematic', () => {
    it('should show current red and target green with an arrow and a plus delta when the saddle is too low', () => {
      const { container } = render(<SaddleSchematic t={t} targetMm={742} currentMm={726} />);
      expect(screen.getByText(`${t.currentLabel} 726 mm`)).toBeInTheDocument();
      expect(screen.getByText(`${t.targetLabel} 742 mm`)).toBeInTheDocument();
      expect(screen.getByText('+16 mm')).toBeInTheDocument();
      expect(container.querySelector(`[stroke="${RED}"]`)).not.toBeNull();
      expect(container.querySelector(`[stroke="${GREEN}"]`)).not.toBeNull();
    });

    it('should show a minus delta when the saddle is too high', () => {
      render(<SaddleSchematic t={t} targetMm={742} currentMm={760} />);
      expect(screen.getByText('−18 mm')).toBeInTheDocument();
    });

    it('should show only the green on-target mark when within the tolerance', () => {
      const { container } = render(<SaddleSchematic t={t} targetMm={742} currentMm={744} />);
      expect(screen.getByText(`${t.onTargetLabel} 742 mm`)).toBeInTheDocument();
      expect(screen.queryByText(`${t.currentLabel} 744 mm`)).not.toBeInTheDocument();
      expect(container.querySelector(`[stroke="${RED}"]`)).toBeNull();
    });

    it('should show only the target and a hint for the wizard without a current value', () => {
      render(<SaddleSchematic t={t} targetMm={742} currentMm={null} />);
      expect(screen.getByText(`${t.targetLabel} 742 mm`)).toBeInTheDocument();
      expect(screen.getByText(t.saddleCaptionTargetOnly)).toBeInTheDocument();
    });

    it('should expose hover tooltips, shapes without color and an accessible label', () => {
      const { container } = render(<SaddleSchematic t={t} targetMm={742} currentMm={726} />);
      expect(Array.from(container.querySelectorAll('title')).map((el) => el.textContent)).toEqual(
        expect.arrayContaining([expect.stringContaining('742'), expect.stringContaining('726')])
      );
      expect(container.querySelector('polygon[fill="none"]')).not.toBeNull();
      expect(container.querySelector('line[stroke-dasharray]')).not.toBeNull();
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('726'));
    });
  });

  describe('BarSchematic', () => {
    it('should turn the bar and arms red and show the excess when the bar is too wide', () => {
      const { container } = render(<BarSchematic t={t} acromionMm={390} bar={assessBar(440, 390)} />);
      expect(screen.getByText(`${t.barLabel} 440 mm (+60 mm)`)).toBeInTheDocument();
      expect(screen.getByText(`${t.recommendedLabel} 380 mm`)).toBeInTheDocument();
      expect(container.querySelector(`[stroke="${RED}"]`)).not.toBeNull();
      expect(screen.getByText(/60/, { selector: 'figcaption' })).toBeInTheDocument();
    });

    it('should stay green with straight forearms when the bar matches the shoulders', () => {
      const { container } = render(<BarSchematic t={t} acromionMm={390} bar={assessBar(380, 390)} />);
      expect(container.querySelector(`[stroke="${RED}"]`)).toBeNull();
      expect(screen.getByText(t.barCaptionOk)).toBeInTheDocument();
    });
  });

  describe('CrankSchematic', () => {
    it('should show the real knee height difference of 7.5 mm between 172.5 and 165 mm', () => {
      const { container } = render(<CrankSchematic t={t} crank={assessCrank(172.5)} />);
      expect(screen.getByText('7.5 mm')).toBeInTheDocument();
      expect(screen.getByText('172.5 mm')).toBeInTheDocument();
      expect(screen.getByText('165 mm')).toBeInTheDocument();
      expect(container.querySelector(`[stroke="${RED}"]`)).not.toBeNull();
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('7.5'));
    });
  });
});
