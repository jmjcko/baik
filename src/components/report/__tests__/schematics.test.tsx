import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { BarSchematic } from '../schematics/BarSchematic';
import { CrankSchematic } from '../schematics/CrankSchematic';
import { SaddleSchematic } from '../schematics/SaddleSchematic';

const RED = '#e11d48';
const GREEN = '#059669';

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

    it('should draw on the saddle artwork with a dashed current line, tooltips and an accessible label', () => {
      const { container } = render(<SaddleSchematic t={t} targetMm={742} currentMm={726} />);
      expect(container.querySelector('image')?.getAttribute('href')).toContain('/assets/guides/saddle_side.jpg');
      expect(Array.from(container.querySelectorAll('title')).map((el) => el.textContent)).toEqual(
        expect.arrayContaining([expect.stringContaining('742'), expect.stringContaining('726')])
      );
      expect(container.querySelector('line[stroke-dasharray]')).not.toBeNull();
      expect(screen.getByText(t.bbLabel)).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('726'));
    });

    it('should put the target line above the current one when the saddle must be raised and below it when it must be lowered', () => {
      const lineY = (current: number) => {
        const { container } = render(<SaddleSchematic t={t} targetMm={742} currentMm={current} />);
        const y = (color: string) => Number(container.querySelector(`line[stroke="${color}"][stroke-width="5"]`)!.getAttribute('y1'));
        return { current: y(RED), target: y(GREEN) };
      };
      const raise = lineY(726);
      expect(raise.target).toBeLessThan(raise.current);
      const lower = lineY(760);
      expect(lower.target).toBeGreaterThan(lower.current);
    });
  });

  describe('BarSchematic', () => {
    const BAD_HEX = '#e11d48';

    it('should draw the shoulders and the bar on the guide figure and mark the excess in red when the bar is too wide', () => {
      const { container } = render(<BarSchematic t={t} acromionMm={390} bar={assessBar(440, 390)} />);
      expect(container.querySelector('image')?.getAttribute('href')).toContain('/assets/guides/acromion_cad.jpg');
      expect(screen.getByText(`${t.shouldersLabel} 390 mm`)).toBeInTheDocument();
      expect(screen.getByText(`${t.barLabel} 440 mm (+60 mm)`)).toBeInTheDocument();
      expect(screen.getByText(`${t.recommendedLabel} 380 mm`)).toBeInTheDocument();
      expect(container.querySelectorAll(`line[stroke="${BAD_HEX}"]`).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/60/, { selector: 'figcaption' })).toBeInTheDocument();
    });

    it('should stay green without red parts and without a second badge when the bar matches the shoulders', () => {
      const { container } = render(<BarSchematic t={t} acromionMm={390} bar={assessBar(380, 390)} />);
      expect(container.querySelector(`[stroke="${BAD_HEX}"]`)).toBeNull();
      expect(screen.queryByText(new RegExp(t.recommendedLabel))).not.toBeInTheDocument();
      expect(screen.getByText(t.barCaptionOk)).toBeInTheDocument();
    });

    it('should scale the bar against the shoulders: a bar as wide as the shoulders ends at the vertical shoulder guides', () => {
      const { container } = render(<BarSchematic t={t} acromionMm={380} bar={assessBar(380, 380)} />);
      const bar = Array.from(container.querySelectorAll('line[stroke-width="13"]'))[0];
      expect(Number(bar.getAttribute('x1'))).toBeCloseTo(312);
      expect(Number(bar.getAttribute('x2'))).toBeCloseTo(712);
    });
  });

  describe('CrankSchematic', () => {
    it('should draw the rider crank on the guide figure with the recommended length and the real knee height difference of 7.5 mm', () => {
      const { container } = render(<CrankSchematic t={t} crank={assessCrank(172.5)} />);
      expect(container.querySelector('image')?.getAttribute('href')).toContain('/assets/guides/crank_tdc.jpg');
      expect(screen.getByText('172.5 mm')).toBeInTheDocument();
      expect(screen.getByText('165 mm')).toBeInTheDocument();
      expect(screen.getByText('7.5 mm')).toBeInTheDocument();
      expect(screen.getByText(t.kneeLabel)).toBeInTheDocument();
      expect(screen.getByText(t.bbLabel)).toBeInTheDocument();
      expect(container.querySelector('line[stroke="#e11d48"]')).not.toBeNull();
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('7.5'));
    });

    it('should show only the green recommended length without a knee difference when the crank is 165 mm', () => {
      const { container } = render(<CrankSchematic t={t} crank={assessCrank(165)} />);
      expect(screen.getAllByText('165 mm')).toHaveLength(1);
      expect(container.querySelector('[stroke="#e11d48"]')).toBeNull();
      expect(screen.queryByText('0 mm')).not.toBeInTheDocument();
    });
  });
});

import { CleatSchematic } from '../schematics/CleatSchematic';
import { PitchSchematic } from '../schematics/PitchSchematic';

describe.each(['en', 'cs'] as Locale[])('PitchSchematic and CleatSchematic (%s)', (locale) => {
  const t = translations[locale].diagnosticReport.schematics;

  it('should label the level saddle and the 2 degree maximum on the saddle artwork', () => {
    const { container } = render(<PitchSchematic t={t} />);
    expect(container.querySelector('image')?.getAttribute('href')).toContain('/assets/guides/saddle_side.jpg');
    expect(screen.getByText(t.pitchLevelLabel)).toBeInTheDocument();
    expect(screen.getByText(t.pitchMaxLabel.replace('{pitch}', '2'))).toBeInTheDocument();
    expect(container.querySelector('rect[stroke-dasharray="12 8"]')).not.toBeNull();
    expect(screen.queryByText(t.jointLabel)).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('2'));
  });

  it('should label the 1st metatarsal joint, the pedal axle and 10 to 17 mm on the sole artwork', () => {
    const { container } = render(<CleatSchematic t={t} />);
    expect(container.querySelector('image')?.getAttribute('href')).toContain('/assets/guides/cleat_sole.jpg');
    expect(screen.getByText(t.jointLabel)).toBeInTheDocument();
    expect(screen.getByText(t.axleLabel)).toBeInTheDocument();
    expect(screen.getByText('10–17 mm')).toBeInTheDocument();
    expect(screen.queryByText(t.pitchLevelLabel)).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('17'));
  });

  it('should place the allowed band 10 to 17 mm behind the joint line at the scale of the shoe artwork', () => {
    const { container } = render(<CleatSchematic t={t} />);
    const band = container.querySelector('rect[fill-opacity="0.2"]')!;
    expect(Number(band.getAttribute('y'))).toBeCloseTo(339 + 10 * 3.1, 5);
    expect(Number(band.getAttribute('height'))).toBeCloseTo(7 * 3.1, 5);
  });

  it('should expose tooltips for the joint and the pedal axle', () => {
    const { container } = render(<CleatSchematic t={t} />);
    const titles = Array.from(container.querySelectorAll('title')).map((el) => el.textContent);
    expect(titles).toEqual(expect.arrayContaining([t.tipJoint.replace('{cleatMin}', '10'), expect.stringContaining('17')]));
  });

  it('should explain in the caption where the 1st metatarsal joint is', () => {
    render(<CleatSchematic t={t} />);
    expect(screen.getByText(t.cleatCaption.replace('{cleatMin}', '10').replace('{cleatMax}', '17'))).toBeInTheDocument();
    expect(t.cleatCaption).toMatch(/metatars|metatarz/i);
  });
});
