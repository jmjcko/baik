import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { fillNodes } from '../formatNodes';

describe('fillNodes', () => {
  it('should put an element in place of a placeholder and keep the text around it', () => {
    const { container } = render(<p>{fillNodes('Change {bike} of {rider}.', { bike: <strong>Verca</strong>, rider: 'Eva' })}</p>);
    expect(container.querySelector('strong')?.textContent).toBe('Verca');
    expect(container.textContent).toBe('Change Verca of Eva.');
  });

  it('should leave a placeholder that has no value as it is, and a template without placeholders unchanged', () => {
    expect(render(<p>{fillNodes('A {x} B', {})}</p>).container.textContent).toBe('A {x} B');
    expect(render(<p>{fillNodes('Plain text', { x: 'y' })}</p>).container.textContent).toBe('Plain text');
  });
});
