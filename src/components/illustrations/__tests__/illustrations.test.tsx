import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { ActionPlan } from '@/components/report/ActionPlan';
import { buildActionPlan } from '@/components/report/buildActionPlan';
import { CapabilitiesView } from '@/components/capabilities/CapabilitiesView';
import { ExplainerImage, IllustrationToggle } from '../ExplainerImage';
import { ILLUSTRATIONS, type IllustrationId } from '../illustrations';

/** Width and height of a PNG file, read from its header. */
function pngSize(path: string): { width: number; height: number } {
  const header = readFileSync(path);
  expect(header.subarray(1, 4).toString()).toBe('PNG');
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const source = (node: HTMLElement) => decodeURIComponent(node.querySelector('img')?.getAttribute('src') ?? '');

describe('the illustration files', () => {
  it.each(Object.entries(ILLUSTRATIONS))('should exist in public as a PNG of the size that the page expects: %s', (_id, illustration) => {
    const path = `public${illustration.src}`;
    expect(existsSync(path)).toBe(true);
    expect(pngSize(path)).toEqual({ width: illustration.width, height: illustration.height });
  });

  it('should be the four illustrations of the owner', () => {
    expect(Object.keys(ILLUSTRATIONS).sort()).toEqual(['acromion', 'drop', 'hamstring', 'release']);
  });
});

describe('ExplainerImage', () => {
  it('should show the picture with its alt text and its caption', () => {
    render(<ExplainerImage id="drop" alt="Frame with the drop" caption="Example only" />);
    expect(screen.getByRole('img', { name: 'Frame with the drop' })).toBeInTheDocument();
    expect(source(screen.getByTestId('illustration-drop'))).toContain('/saddle_to_bar_drop_schematic_v2.png');
    expect(screen.getByText('Example only')).toBeInTheDocument();
  });

  it('should keep the picture in a closed section until the label is opened', () => {
    render(<IllustrationToggle id="acromion" label="Show illustration" alt="Shoulders" caption="Caption" />);
    const toggle = screen.getByTestId('illustration-toggle-acromion');
    expect(toggle).not.toHaveAttribute('open');
    expect(within(toggle).getByText('Show illustration').tagName).toBe('SUMMARY');
  });
});

describe.each(['en', 'cs'] as Locale[])('the illustrations in the report and on the capabilities page (%s)', (locale) => {
  const t = translations[locale];
  const il = t.diagnosticReport.illustrations;
  const values = (over: Partial<ProfileValues>): ProfileValues => ({ ...DEFAULT_PROFILE, inseamMm: 840, acromionWidthMm: 380, ...over });
  const planOf = (v: ProfileValues, bar: number | null = null) => buildActionPlan(t, { inseamMm: v.inseamMm, acromionWidthMm: v.acromionWidthMm, crankLengthMm: v.crankLengthMm, currentBarWidthMm: bar, currentSaddleHeightMm: null, saddleHeightMm: deriveCoordinates(v).saddle.heightAlongTubeMm, currentPains: v.currentPains, ridingStyle: v.ridingStyle, hamstringTest: v.hamstringTest, releaseTest: v.releaseTest });

  it('should give the drop step the drop schematic and the width step the shoulder illustration, each with its own alt text', () => {
    const steps = planOf(values({ currentPains: ['numb_hands'] }));
    expect(steps.find((step) => step.id === 'drop')?.illustration).toBe('drop');
    expect(steps.find((step) => step.id === 'handlebar')?.illustration).toBe('acromion');
    render(<ActionPlan t={t} steps={steps} onShowDetail={vi.fn()} />);
    expect(source(screen.getByTestId('illustration-toggle-drop'))).toContain('saddle_to_bar_drop_schematic_v2.png');
    expect(screen.getByRole('img', { name: il.drop.alt, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: il.acromion.alt, hidden: true })).toBeInTheDocument();
  });

  it('should show an illustration under no other step', () => {
    const steps = planOf(values({ currentPains: ['numb_hands'] }), 380);
    for (const step of steps) expect(step.illustration).toBe(step.id === 'drop' || step.id === 'handlebar' ? step.illustration : undefined);
    expect(steps.filter((step) => step.illustration).map((step) => step.id).sort()).toEqual(['drop', 'handlebar']);
  });

  it('should say that the number in the drop drawing is an example and not a target, and that the labels are English', () => {
    expect(il.drop.caption).toMatch(/95/);
    expect(il.drop.caption).toMatch(locale === 'en' ? /not a target/ : /ne cíl/);
    expect(il.acromion.caption).toMatch(/380/);
    if (locale === 'cs') for (const text of [il.drop.caption, il.acromion.caption, t.miniTests.hamstring.diagramCaption, t.miniTests.release.diagramCaption]) expect(text).toMatch(/anglicky/);
    expect(il.drop.alt.length).toBeGreaterThan(60);
  });

  it('should put both illustrations on the capabilities page, under the handlebar width and the drop and stack', () => {
    render(<CapabilitiesView t={t} onTakeTests={vi.fn()} />);
    const bar = screen.getByRole('heading', { level: 3, name: t.capabilities.items.barWidth.name }).closest('li') as HTMLElement;
    const drop = screen.getByRole('heading', { level: 3, name: t.capabilities.items.dropStack.name }).closest('li') as HTMLElement;
    expect(within(bar).getByTestId('illustration-toggle-acromion')).toBeInTheDocument();
    expect(within(drop).getByTestId('illustration-toggle-drop')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^illustration-toggle-/)).toHaveLength(2);
  });

  it('should have a different alt text in each language', () => {
    for (const id of ['drop', 'acromion'] as const) expect(translations.cs.diagnosticReport.illustrations[id].alt).not.toBe(translations.en.diagnosticReport.illustrations[id].alt);
    for (const id of ['hamstring', 'release'] as const) expect(translations.cs.miniTests[id].diagramLabel).not.toBe(translations.en.miniTests[id].diagramLabel);
    expect((['hamstring', 'release', 'drop', 'acromion'] as IllustrationId[]).length).toBe(4);
  });
});
