import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { diagnoseSymptoms } from '@/lib/engines/baikfit/diagnostics';
import { RIDER_PAIN_TYPES, painsFor } from '@/types/baikfit';
import { loweringGuard, forbidsSaddleBack, forbidsSaddleForward, forbidsLongerStem, needsPositionChecks } from '@/lib/engines/baikfit/dropRules';
import { DiagnosisPanel } from '../ReportParts';

describe('leg length difference: a referral and nothing else (KB v1.5.0 section 3.4)', () => {
  it('should be a symptom the rider can report, on every discipline, mapped to its own card', () => {
    expect(RIDER_PAIN_TYPES).toContain('leg_length');
    expect(painsFor('road')).toContain('leg_length');
    expect(painsFor('xc_mtb')).toContain('leg_length');
    expect(diagnoseSymptoms(['leg_length'])).toEqual(['legLength']);
  });

  it('should change no rule of the position: no guard, no check, no direction', () => {
    const context = { pains: ['leg_length' as const] };
    expect(loweringGuard(context)).toBeNull();
    expect(forbidsSaddleBack(context)).toBe(false);
    expect(forbidsSaddleForward(context)).toBe(false);
    expect(forbidsLongerStem(context)).toBe(false);
    expect(needsPositionChecks(context)).toBe(false);
  });
});

describe.each(['en', 'cs'] as Locale[])('the leg length card (%s)', (locale) => {
  const t = translations[locale];
  const item = t.diagnosis.items.legLength;

  it('should send the rider to a physiotherapist or a bike fitter and give no number, no shim, no wedge and no insole to buy', () => {
    const text = `${item.title} ${item.rootCause} ${item.fixes.join(' ')}`;
    expect(item.fixes.join(' ')).toMatch(locale === 'en' ? /physiotherapist/ : /fyzioterapeut/);
    expect(item.fixes.join(' ')).toMatch(/fitter/);
    expect(text).not.toMatch(/\d\s?(mm|°)/);
    expect(item.fixes.join(' ')).toMatch(locale === 'en' ? /Do not add a shim, a wedge or an insole on your own/ : /Sami nepřidávejte podložku, klín ani vložku/);
  });

  it('should show the card for a rider who reports it, with the way to the professional', () => {
    render(<DiagnosisPanel t={t} ids={['legLength']} onLearnMore={() => undefined} expanded />);
    const card = within(screen.getByTestId('diagnosis-legLength'));
    expect(card.getByText(item.title)).toBeInTheDocument();
    for (const fix of item.fixes) expect(card.getByText(fix)).toBeInTheDocument();
  });

  it('should name the symptom in the checklist of the wizard in both languages', () => {
    expect(t.studio.pains.leg_length).toBeTruthy();
    expect(t.studio.pains.leg_length).toMatch(locale === 'en' ? /Leg length/ : /délce nohou/);
  });
});
