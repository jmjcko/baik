import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { PrivacyClient } from '../PrivacyClient';

describe('the privacy page', () => {
  it('should show the draft text in English, the controller, the placeholder contact and every consent', () => {
    const t = translations.en.consent;
    render(<PrivacyClient />);
    expect(screen.getByRole('heading', { level: 1, name: t.privacy.title })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(t.privacy.draftNote);
    expect(screen.getByText(/The controller of your data is bAIk\./)).toBeInTheDocument();
    expect(screen.getByTestId('privacy-contact')).toHaveTextContent(t.privacy.contactMissing);
    for (const section of t.privacy.sections) expect(screen.getByRole('heading', { name: section.heading })).toBeInTheDocument();
    expect(screen.getAllByTestId(/^consent-row-/)).toHaveLength(5);
  });

  it('should switch to Czech with the language switch', () => {
    render(<PrivacyClient />);
    fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    expect(screen.getByRole('heading', { level: 1, name: translations.cs.consent.privacy.title })).toBeInTheDocument();
    expect(screen.getByText(/Správcem tvých údajů je bAIk\./)).toBeInTheDocument();
  });

  it('should say that the AI service gets health data only after consent, and show no emoji', () => {
    render(<PrivacyClient />);
    expect(document.body.textContent).toMatch(/only after your consent/);
    expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('should link back to the app', () => {
    render(<PrivacyClient />);
    expect(screen.getByRole('link', { name: translations.en.consent.privacy.back })).toHaveAttribute('href', '/');
  });
});
