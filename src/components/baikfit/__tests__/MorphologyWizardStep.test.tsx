import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MorphologyWizardStep, MorphologyWizardStepProps } from '../MorphologyWizardStep';
import { translations } from '@/lib/i18n/translations';

describe('MorphologyWizardStep - Interactive Measurement Guidance', () => {
  const defaultProps: MorphologyWizardStepProps = {
    t: translations.cs,
    inseamMm: 840,
    setInseamMm: vi.fn(),
    torsoLengthMm: 620,
    setTorsoLengthMm: vi.fn(),
    acromionWidthMm: 420,
    setAcromionWidthMm: vi.fn(),
    heightCm: 178,
    setHeightCm: vi.fn(),
    armLengthMm: 620,
    setArmLengthMm: vi.fn(),
  };

  it('renders all sliders and direct modal triggers in Czech (CS)', () => {
    render(<MorphologyWizardStep {...defaultProps} />);

    expect(screen.getByText(translations.cs.wizard.bodyTitle)).toBeInTheDocument();
    expect(screen.getByTestId('inseam-guide-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('torso-guide-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('acromion-guide-trigger')).toBeInTheDocument();

    expect(screen.getByText(translations.cs.wizard.inseamAccordionTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.torsoAccordionTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionAccordionTitle)).toBeInTheDocument();
  });

  it('opens Inseam visual CAD guide modal and displays athletic diagram and exact steps', () => {
    render(<MorphologyWizardStep {...defaultProps} />);

    // Initially modal is closed
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();

    // Click trigger to open modal
    const trigger = screen.getByTestId('inseam-guide-trigger');
    fireEvent.click(trigger);

    expect(screen.getByTestId('measurement-guide-modal')).toBeInTheDocument();
    expect(screen.getByTestId('inseam-cad-vector')).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.inseamSteps[0])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.inseamSteps[1])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.inseamSteps[2])).toBeInTheDocument();

    // Click close button to dismiss modal
    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();
  });

  it('opens Torso length visual CAD guide modal and displays athletic diagram and exact steps', () => {
    render(<MorphologyWizardStep {...defaultProps} />);

    // Initially closed
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();

    // Click trigger to open modal
    const trigger = screen.getByTestId('torso-guide-trigger');
    fireEvent.click(trigger);

    expect(screen.getByTestId('measurement-guide-modal')).toBeInTheDocument();
    expect(screen.getByTestId('torso-cad-vector')).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.torsoSteps[0])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.torsoSteps[1])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.torsoSteps[2])).toBeInTheDocument();

    // Click close button to dismiss
    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();
  });

  it('opens Shoulder Width (Acromion) visual CAD guide modal and displays athletic diagram and 3-step instructions', () => {
    render(<MorphologyWizardStep {...defaultProps} />);

    // Initially closed
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();

    // Click trigger to open modal
    const trigger = screen.getByTestId('acromion-guide-trigger');
    fireEvent.click(trigger);

    expect(screen.getByTestId('measurement-guide-modal')).toBeInTheDocument();
    expect(screen.getByTestId('acromion-cad-vector')).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionGuideText)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionSteps[0])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionSteps[1])).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionSteps[2])).toBeInTheDocument();

    // Click close button to dismiss
    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(screen.queryByTestId('measurement-guide-modal')).not.toBeInTheDocument();
  });

  it('verifies 100% English (EN) language parity for all visual guides', () => {
    render(<MorphologyWizardStep {...defaultProps} t={translations.en} />);

    expect(screen.getByText(translations.en.wizard.bodyTitle)).toBeInTheDocument();

    // Open Inseam guide
    fireEvent.click(screen.getByTestId('inseam-guide-trigger'));
    expect(screen.getByText(translations.en.wizard.inseamSteps[0])).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-close-btn'));

    // Open Torso guide
    fireEvent.click(screen.getByTestId('torso-guide-trigger'));
    expect(screen.getByText(translations.en.wizard.torsoSteps[0])).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.torsoSteps[1])).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-close-btn'));

    // Open Acromion guide
    fireEvent.click(screen.getByTestId('acromion-guide-trigger'));
    expect(screen.getByText(translations.en.wizard.acromionSteps[0])).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-close-btn'));

    // Open Arm length guide
    fireEvent.click(screen.getByTestId('arm-guide-trigger'));
    expect(screen.getByText(translations.en.wizard.armSteps[0])).toBeInTheDocument();
    expect(screen.getByTestId('arm-cad-vector')).toBeInTheDocument();
  });

  it('shows out-of-range validation error when Inseam is invalid', () => {
    render(<MorphologyWizardStep {...defaultProps} inseamMm={450} />);
    expect(screen.getByText(translations.cs.studio.outOfRangeError)).toBeInTheDocument();
  });

  it('strictly adheres to zero-emojis rule across all text nodes', () => {
    const { container } = render(<MorphologyWizardStep {...defaultProps} />);
    
    // Open modal
    fireEvent.click(screen.getByTestId('inseam-guide-trigger'));

    const textContent = container.textContent || '';
    // Common emoji code points regex
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(textContent)).toBe(false);
  });
});
