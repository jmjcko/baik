import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '../page';

describe('bAIk Landing Page', () => {
  it('renders the brand title bAIk and subtitle', () => {
    render(<HomePage />);
    expect(screen.getByText('bAIk')).toBeInTheDocument();
    expect(screen.getByText('Universal AI Cycling Hub')).toBeInTheDocument();
  });

  it('renders all 5 core cycling modules', () => {
    render(<HomePage />);
    expect(screen.getByText('AI Bike Fitting')).toBeInTheDocument();
    expect(screen.getByText('Diagnostika & Údržba')).toBeInTheDocument();
    expect(screen.getByText('Videorady & Manuály')).toBeInTheDocument();
    expect(screen.getByText('Cyklistický AI Asistent')).toBeInTheDocument();
    expect(screen.getByText('Výběr komponent & kompatibilita')).toBeInTheDocument();
  });
});
