import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';
import { SurfaceCard } from '../SurfaceCard';

describe('PageHeader', () => {
  it('should show the eyebrow, the title as the page heading, the subtitle, the chips and the actions', () => {
    render(<PageHeader eyebrow="My profile" title="Title" subtitle="One sentence." actions={<button>Do it</button>}><span>chip</span></PageHeader>);
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    for (const text of ['My profile', 'One sentence.', 'chip']) expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
  });

  it('should leave out what is not given, and not be a banner landmark inside the page', () => {
    render(<PageHeader title="Only a title" />);
    expect(screen.getByTestId('page-header').children).toHaveLength(1);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('should show the label, the number and its unit with the colored edge of its tone', () => {
    render(<StatCard testId="stat" label="Target saddle height" value="742" unit="mm" tone="warning" />);
    const card = screen.getByTestId('stat');
    expect(card).toHaveTextContent('Target saddle height');
    expect(card).toHaveTextContent('742mm');
    expect(card.className).toContain('border-l-tone-warning-line');
  });

  it('should show a muted value smaller and without the unit', () => {
    render(<StatCard testId="stat" label="Last diagnosis" value="Not set up yet" unit="mm" tone="info" muted />);
    expect(screen.getByTestId('stat')).toHaveTextContent('Not set up yet');
    expect(screen.getByTestId('stat')).not.toHaveTextContent('mm');
    expect(screen.getByText('Not set up yet').className).toContain('text-ink-3');
  });
});

describe('SurfaceCard', () => {
  it('should be an opaque themed surface with a border and a shadow, and no blur', () => {
    render(<SurfaceCard testId="card">x</SurfaceCard>);
    const { className } = screen.getByTestId('card');
    expect(className).toMatch(/bg-surface/);
    expect(className).toMatch(/border-line/);
    expect(className).toMatch(/shadow-sm/);
    expect(className).not.toMatch(/blur|\/\d+/);
  });

  it('should add no padding when the card lays out its own parts', () => {
    render(<SurfaceCard padding="none" testId="card">x</SurfaceCard>);
    expect(screen.getByTestId('card').className).not.toMatch(/\bp-\d/);
  });

  it('should give a main panel more space, draw a section when asked, and take a stronger shadow', () => {
    const { container } = render(<SurfaceCard as="section" padding="lg" elevation="elevated" testId="card">x</SurfaceCard>);
    expect(container.querySelector('section')).toBe(screen.getByTestId('card'));
    expect(screen.getByTestId('card').className).toContain('p-8');
    expect(screen.getByTestId('card').className).toContain('shadow-md');
  });
});
