import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { lukeContext } from '@/lib/agents/gearPrefill';
import { MasterPromptModal } from '../MasterPromptModal';

describe.each(['en', 'cs'] as Locale[])('the master prompt dialog names the rider (%s)', (locale) => {
  const t = translations[locale];
  const input = { productTitle: 'Bar tape', category: null, parameters: [], notes: '', ...lukeContext({ ...DEFAULT_PROFILE }) };

  it('should name the rider on the body toggle with two riders, and keep the name out of the text', () => {
    render(<MasterPromptModal t={t} input={input as never} riderLabel="Eva" onClose={vi.fn()} />);
    expect(screen.getByLabelText(fill(t.gear.modal.includeRiderNamed, { name: 'Eva' }))).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('include-rider'));
    const text = (screen.getByTestId('prompt-preview') as HTMLTextAreaElement).value;
    expect(text).toContain(`${DEFAULT_PROFILE.riderWeightKg} kg`);
    expect(text).not.toContain('Eva');
  });

  it('should use the plain toggle text for a single rider', () => {
    render(<MasterPromptModal t={t} input={input as never} onClose={vi.fn()} />);
    expect(screen.getByLabelText(t.gear.modal.includeRider)).toBeInTheDocument();
  });

  it('should start with the body out of the text with two riders (a choice made on purpose) and in the text for a single rider', () => {
    const { unmount } = render(<MasterPromptModal t={t} input={input as never} riderLabel="Eva" onClose={vi.fn()} />);
    expect(screen.getByTestId('include-rider')).not.toBeChecked();
    unmount();
    render(<MasterPromptModal t={t} input={input as never} onClose={vi.fn()} />);
    expect(screen.getByTestId('include-rider')).toBeChecked();
  });
});
