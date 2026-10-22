import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EducationalModal } from '../EducationalModal';

const props = { title: 'Title', description: 'Body text', badge: '[BADGE]', closeLabel: 'Close' };

describe('EducationalModal', () => {
  it('should render nothing without a topic', () => {
    const { container } = render(<EducationalModal topic={null} onClose={vi.fn()} {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the dialog for a topic', () => {
    const { asFragment } = render(<EducationalModal topic="lemond" onClose={vi.fn()} {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should close on Escape, on the close button and on a backdrop click only', () => {
    const onClose = vi.fn();
    render(<EducationalModal topic="ulnar" onClose={onClose} {...props} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.click(screen.getByText('Close'));
    fireEvent.click(screen.getByText('Body text'));
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('should not listen for Escape while closed', () => {
    const onClose = vi.fn();
    render(<EducationalModal topic={null} onClose={onClose} {...props} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
