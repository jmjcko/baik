import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { BOOK_STORAGE_KEY, loadBook } from '@/lib/service/bookStore';
import { useBikeEdit } from '@/lib/hooks/useBikeEdit';
import { DEFAULT_CARE } from '@/types/maintain';
import type { BikeProfile } from '@/lib/passport/types';
import { Sidebar } from '@/components/navigation/Sidebar';
import HomePage from '@/app/page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { addBikeFromSidebar, pickLanguage } from '@/test/accountMenu';
import { BikeDialog } from '../BikeDialog';
import { BikeEditDialog } from '../BikeEditDialog';

const bike = (id: string, name: string | null, isActive: boolean): BikeProfile => ({ id, name, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive, discipline: 'road' });
const garage = { bikes: [bike('a', 'Road bike', true), bike('b', 'Gravel bike', false)], activeBikeId: 'a' };

describe.each(['en', 'cs'] as Locale[])('the Edit bike dialog (%s)', (locale) => {
  const t = translations[locale];
  const e = t.bikeEdit;
  beforeEach(() => localStorage.clear());

  const open = (over: Partial<React.ComponentProps<typeof BikeEditDialog>> = {}) => {
    const props = { t, bike: bike('a', 'Road bike', true), care: DEFAULT_CARE, onRename: vi.fn(() => true), onDiscipline: vi.fn(), onCare: vi.fn(), onEditSetup: vi.fn(), onSaved: vi.fn(), onClose: vi.fn(), ...over };
    render(<BikeEditDialog {...props} />);
    return props;
  };
  const dialog = () => screen.getByTestId('bike-edit-dialog');

  it('should show the name, the kind, the trainer flag and the identity, and leave the setup numbers to the guide', () => {
    open();
    expect(screen.getByRole('dialog', { name: e.title })).toBeInTheDocument();
    expect(within(dialog()).getByDisplayValue('Road bike')).toBeInTheDocument();
    for (const id of ['identity-make', 'identity-model', 'identity-year', 'identity-serial', 'identity-insurance']) expect(screen.getByTestId(id)).toBeInTheDocument();
    expect(screen.getByTestId('edit-setup')).toHaveTextContent(e.setupHint);
    expect(screen.queryByLabelText(/crank|klik/i)).not.toBeInTheDocument();
  });

  it('should write the name, the kind, the trainer flag and the identity together with Save, and close', () => {
    const props = open();
    fireEvent.change(within(dialog()).getByDisplayValue('Road bike'), { target: { value: 'Race bike' } });
    fireEvent.click(within(dialog()).getByRole('button', { name: /gravel|štěrk/i }));
    fireEvent.click(within(dialog()).getByRole('checkbox'));
    fireEvent.change(screen.getByTestId('identity-make'), { target: { value: 'Canyon' } });
    fireEvent.change(screen.getByTestId('identity-serial'), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByTestId('bike-edit-save'));
    expect(props.onRename).toHaveBeenCalledWith('a', 'Race bike');
    expect(props.onDiscipline).toHaveBeenCalledWith('gravel');
    expect(props.onCare).toHaveBeenCalledWith({ trainer: true });
    expect(loadBook('a').identity).toMatchObject({ make: 'Canyon', serial: 'ABC123' });
    expect(props.onSaved).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should write nothing it did not change', () => {
    const props = open();
    fireEvent.click(screen.getByTestId('bike-edit-save'));
    expect(props.onRename).not.toHaveBeenCalled();
    expect(props.onDiscipline).not.toHaveBeenCalled();
    expect(props.onCare).not.toHaveBeenCalled();
  });

  it('should stay open and say so when the name is refused', () => {
    const props = open({ onRename: vi.fn(() => false) });
    fireEvent.change(within(dialog()).getByDisplayValue('Road bike'), { target: { value: 'Race bike' } });
    fireEvent.click(screen.getByTestId('bike-edit-save'));
    expect(screen.getByTestId('bike-edit-failed')).toHaveTextContent(e.failed);
    expect(props.onClose).not.toHaveBeenCalled();
    expect(props.onSaved).not.toHaveBeenCalled();
  });

  it('should leave through the setup guide, Cancel and Escape without saving', () => {
    const props = open();
    fireEvent.change(screen.getByTestId('identity-make'), { target: { value: 'Canyon' } });
    fireEvent.click(screen.getByTestId('edit-setup-button'));
    expect(props.onEditSetup).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('bike-edit-cancel'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(BOOK_STORAGE_KEY)).toBeNull();
  });

  describe('where it opens from', () => {
    it('should not put an Edit button into the choice of the bike in Riding now or in the bike dialog', () => {
      render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} locale={locale} theme="light" onSetLocale={vi.fn()} onSetTheme={vi.fn()} garage={garage} riders={null} onSwitchBike={vi.fn()} />);
      fireEvent.click(screen.getByTestId('riding-now'));
      expect(within(screen.getByRole('menu')).getAllByRole('menuitemradio')).toHaveLength(2);
      expect(screen.queryByTestId('edit-bike-b')).not.toBeInTheDocument();
      render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn(() => true)} onAdd={vi.fn()} onClose={vi.fn()} />);
      expect(screen.queryByTestId('dialog-edit-b')).not.toBeInTheDocument();
    });

    it('should switch to another bike before it opens, and not switch for the active one', () => {
      const switchBike = vi.fn(() => true);
      const { result } = renderHook(() => useBikeEdit(garage, switchBike, vi.fn()));
      act(() => result.current.edit('a'));
      expect(switchBike).not.toHaveBeenCalled();
      expect(result.current.open).toBe(true);
      act(() => result.current.close());
      act(() => result.current.edit('b'));
      expect(switchBike).toHaveBeenCalledWith('b');
      expect(result.current.open).toBe(true);
      act(() => result.current.onSaved());
      expect(result.current.saved).toBe(1);
    });

    it('should not open when the switch to the other bike failed', () => {
      const { result } = renderHook(() => useBikeEdit(garage, () => false, vi.fn()));
      act(() => result.current.edit('b'));
      expect(result.current.open).toBe(false);
    });

    it('should open the page of a bike picked in Riding now: switch, care mode, the Garage requested until it is shown', () => {
      const switchBike = vi.fn(() => true);
      const selectMode = vi.fn();
      const { result } = renderHook(() => useBikeEdit(garage, switchBike, selectMode));
      act(() => { result.current.openBike('b'); });
      expect(switchBike).toHaveBeenCalledWith('b');
      expect(selectMode).toHaveBeenCalledWith('care');
      expect(result.current.garageRequested).toBe(true);
      act(() => result.current.onGarageShown());
      expect(result.current.garageRequested).toBe(false);
      switchBike.mockClear();
      act(() => { result.current.openBike('a'); });
      expect(switchBike).not.toHaveBeenCalled();
      expect(selectMode).toHaveBeenCalledTimes(2);
    });

    it('should stay where it is when the switch failed', () => {
      const selectMode = vi.fn();
      const { result } = renderHook(() => useBikeEdit(garage, () => false, selectMode));
      act(() => { expect(result.current.openBike('b')).toBe(false); });
      expect(selectMode).not.toHaveBeenCalled();
      expect(result.current.garageRequested).toBe(false);
    });
  });

  describe('in the whole app', () => {
    it('should open the page of the bike from Riding now, rename it there and show the new name at once, and keep it in the garage', () => {
      render(<HomePage />);
      if (locale === 'cs') pickLanguage('CS');
      addBikeFromSidebar(t);
      const added = screen.getByRole('dialog', { name: t.profile.garage.dialogTitle });
      fireEvent.change(within(added).getByLabelText(t.profile.garage.nameLabel), { target: { value: 'Winter bike' } });
      fireEvent.click(within(added).getByRole('button', { name: t.profile.garage.create }));
      fireEvent.click(screen.getByTestId('riding-now'));
      fireEvent.click(screen.getByRole('menuitemradio', { name: /Winter bike/ }));
      expect(screen.getByTestId('garage-section')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('garage-edit-bike'));
      const edit = screen.getByTestId('bike-edit-dialog');
      fireEvent.change(within(edit).getByDisplayValue('Winter bike'), { target: { value: 'Summer bike' } });
      fireEvent.change(screen.getByTestId('identity-make'), { target: { value: 'Canyon' } });
      fireEvent.click(screen.getByTestId('bike-edit-save'));
      expect(screen.queryByTestId('bike-edit-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('riding-now')).toHaveTextContent('Summer bike');
      const passport = loadLocalPassport()?.passport;
      const saved = passport?.bikes.find((one) => one.id === passport.activeBikeId);
      expect(saved?.name).toBe('Summer bike');
      expect(loadBook(saved?.id ?? '').identity.make).toBe('Canyon');
    });
  });
});
