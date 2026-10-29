import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import HomePage from '@/app/page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { BikeDialog } from '../BikeDialog';
import type { BikeProfile } from '@/lib/passport/types';

const bike = (id: string, name: string, isActive: boolean, discipline: 'road' | 'gravel' | 'xc_mtb' = 'road'): BikeProfile => ({ id, name, discipline, isActive, isFactory: false, lastDiagnosis: null } as unknown as BikeProfile);

describe.each(['en', 'cs'] as Locale[])('the which-bike dialog (%s)', (locale) => {
  const t = translations[locale];
  const g = t.profile.garage;

  describe('the dialog', () => {
    const garage = { activeBikeId: 'a', bikes: [bike('a', 'Road bike', true), bike('b', 'Gravel bike', false, 'gravel')] };

    it('should list the bikes of the garage with the active one marked, and switch to the chosen one and close', () => {
      const onSwitch = vi.fn(() => true);
      const onClose = vi.fn();
      render(<BikeDialog t={t} garage={garage} onSwitch={onSwitch} onAdd={vi.fn()} onClose={onClose} />);
      const dialog = screen.getByRole('dialog', { name: g.dialogTitle });
      expect(within(dialog).getByText('Road bike').closest('button')).toHaveAttribute('aria-current', 'true');
      fireEvent.click(within(dialog).getByText('Gravel bike'));
      expect(onSwitch).toHaveBeenCalledWith('b');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should stay open when the switch cannot be done', () => {
      const onClose = vi.fn();
      render(<BikeDialog t={t} garage={garage} onSwitch={() => false} onAdd={vi.fn()} onClose={onClose} />);
      fireEvent.click(screen.getByText('Gravel bike'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should add a new bike with a name and a kind and close, and refuse an empty name', () => {
      const onAdd = vi.fn(() => true);
      const onClose = vi.fn();
      render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={onAdd} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: g.create }));
      expect(screen.getByRole('alert')).toHaveTextContent(g.nameInvalid);
      expect(onAdd).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Trail bike' } });
      fireEvent.click(screen.getByRole('button', { name: t.studio.disciplines.xc_mtb.split(' ')[0] }));
      fireEvent.click(screen.getByRole('button', { name: g.create }));
      expect(onAdd).toHaveBeenCalledWith('Trail bike', 'xc_mtb', false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should say when the bike could not be added and stay open', () => {
      const onClose = vi.fn();
      render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={() => false} onClose={onClose} />);
      fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Trail bike' } });
      fireEvent.click(screen.getByRole('button', { name: g.create }));
      expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should close with Escape, the close button and a click on the dark area, and show no list for an empty garage', () => {
      const onClose = vi.fn();
      const { rerender } = render(<BikeDialog t={t} garage={null} onSwitch={vi.fn()} onAdd={vi.fn()} onClose={onClose} />);
      expect(screen.queryByText(g.dialogYourBikes)).not.toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.click(screen.getByRole('button', { name: g.dialogClose }));
      fireEvent.mouseDown(screen.getByTestId('bike-dialog'));
      expect(onClose).toHaveBeenCalledTimes(3);
      rerender(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={vi.fn()} onClose={onClose} />);
      expect(screen.getByText(g.dialogYourBikes)).toBeInTheDocument();
    });
  });

  describe('in the app', () => {
    beforeEach(() => localStorage.clear());

    it('should open from "Switch or add a bike" in the wizard without leaving it, and make the new bike the one that is fitted', () => {
      render(<HomePage />);
      if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
      fireEvent.click(screen.getByText(t.shell.dashboard.hero.start));
      fireEvent.click(screen.getByRole('button', { name: t.wizard.activeBike.manage }));
      const dialog = screen.getByRole('dialog', { name: g.dialogTitle });
      fireEvent.change(within(dialog).getByLabelText(g.nameLabel), { target: { value: 'Winter bike' } });
      fireEvent.click(within(dialog).getByRole('button', { name: g.create }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('discipline-step')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-active-bike')).toHaveTextContent('Winter bike');
      expect(loadLocalPassport()?.passport.bikes.map((one) => one.name)).toContain('Winter bike');
    });

    it('should open from the sidebar for a guest too, and not send anyone to the profile page', () => {
      render(<HomePage />);
      if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
      const sidebar = screen.getByTestId('sidebar-garage');
      fireEvent.click(within(sidebar).getByRole('button', { name: t.shell.sidebar.addBike }));
      expect(screen.getByRole('dialog', { name: g.dialogTitle })).toBeInTheDocument();
      expect(screen.queryByTestId('profile-view')).not.toBeInTheDocument();
    });
  });
});
