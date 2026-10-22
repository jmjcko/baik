import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeasurementGuideModal } from '../MeasurementGuideModal';
import { translations } from '@/lib/i18n/translations';

describe('MeasurementGuideModal - CAD Vector Blueprint Visualizer', () => {
  const onCloseMock = vi.fn();

  it('renders Inseam CAD vector diagram correctly in Czech (CS)', () => {
    render(
      <MeasurementGuideModal
        isOpen={true}
        onClose={onCloseMock}
        guideType="inseam"
        t={translations.cs}
      />
    );

    expect(screen.getByTestId('measurement-guide-modal')).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.inseamGuideTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.visualCadDiagramTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.inseamClinicalNote)).toBeInTheDocument();
    expect(screen.getByTestId('inseam-cad-vector')).toBeInTheDocument();

    // Verify close action
    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('renders Torso CAD vector diagram correctly in English (EN)', () => {
    render(
      <MeasurementGuideModal
        isOpen={true}
        onClose={onCloseMock}
        guideType="torso"
        t={translations.en}
      />
    );

    expect(screen.getByText(translations.en.wizard.torsoAccordionTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.torsoClinicalNote)).toBeInTheDocument();
    expect(screen.getByTestId('torso-cad-vector')).toBeInTheDocument();
  });

  it('renders Acromion CAD vector diagram correctly', () => {
    render(
      <MeasurementGuideModal
        isOpen={true}
        onClose={onCloseMock}
        guideType="acromion"
        t={translations.cs}
      />
    );

    expect(screen.getByText(translations.cs.wizard.acromionGuideTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.acromionClinicalNote)).toBeInTheDocument();
    expect(screen.getByTestId('acromion-cad-vector')).toBeInTheDocument();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <MeasurementGuideModal
        isOpen={false}
        onClose={onCloseMock}
        guideType="inseam"
        t={translations.cs}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('strictly adheres to zero-emojis rule across CAD modal text', () => {
    const { container } = render(
      <MeasurementGuideModal
        isOpen={true}
        onClose={onCloseMock}
        guideType="inseam"
        t={translations.cs}
      />
    );

    const textContent = container.textContent || '';
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(textContent)).toBe(false);
  });

  it('renders the Arm Length CAD diagram with localized labels (EN and CS)', () => {
    const { unmount } = render(
      <MeasurementGuideModal isOpen={true} onClose={onCloseMock} guideType="arm" t={translations.en} />
    );
    expect(screen.getByTestId('arm-cad-vector')).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.diagramFist)).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.diagramArmDimLabel)).toBeInTheDocument();
    unmount();

    render(<MeasurementGuideModal isOpen={true} onClose={onCloseMock} guideType="arm" t={translations.cs} />);
    expect(screen.getByText(translations.cs.wizard.diagramFist)).toBeInTheDocument();
    expect(screen.getByText(translations.cs.wizard.armClinicalNote)).toBeInTheDocument();
  });

  it('uses the shared frontal-figure images for torso, arm and shoulder guides', () => {
    for (const [guideType, file] of [['torso', 'torso_cad'], ['arm', 'arm_cad'], ['acromion', 'acromion_cad']] as const) {
      const { container, unmount } = render(
        <MeasurementGuideModal isOpen={true} onClose={onCloseMock} guideType={guideType} t={translations.en} />
      );
      expect(container.querySelector(`img[src^="/assets/guides/${file}.jpg"]`)).not.toBeNull();
      unmount();
    }
  });
});
