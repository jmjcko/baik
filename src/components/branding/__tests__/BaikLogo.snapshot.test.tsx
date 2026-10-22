import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BaikLogo } from '../BaikLogo';

describe('BaikLogo', () => {
  it.each(['A', 'C', 'D', 'dark', 'light'] as const)('should render the SVG mark for variant %s', (variant) => {
    const { asFragment } = render(<BaikLogo variant={variant} size={64} showWordmark className="x" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the SVG mark without wordmark', () => {
    const { asFragment } = render(<BaikLogo variant="A" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it.each([{ variant: 'master' as const }, { variant: 'A' as const, useImage: true }])('should render the image logo %j', (props) => {
    const { asFragment, container } = render(<BaikLogo {...props} size={120} showWordmark />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('bAIk Logo');
    expect(asFragment()).toMatchSnapshot();
  });
});
