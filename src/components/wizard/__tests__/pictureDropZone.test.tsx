import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { PictureDropZone } from '../stock/PictureDropZone';

const png = (name = 'geometry.png', size = 2048) => {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

function setup(locale: Locale, first: File | null = null) {
  const onFile = vi.fn();
  const Harness = () => {
    const [file, setFile] = useState<File | null>(first);
    return <PictureDropZone texts={translations[locale].stockBike.picker} file={file} onFile={(next) => { onFile(next); setFile(next); }} />;
  };
  render(<Harness />);
  return onFile;
}

const paste = (items: Array<{ kind: string; type: string; file: File | null }>) => {
  const event = new Event('paste', { bubbles: true }) as Event & { clipboardData?: unknown };
  event.clipboardData = { items: items.map((item) => ({ kind: item.kind, type: item.type, getAsFile: () => item.file })) };
  act(() => {
    document.dispatchEvent(event);
  });
};

describe.each(['en', 'cs'] as Locale[])('PictureDropZone (%s)', (locale) => {
  const p = translations[locale].stockBike.picker;

  afterEach(() => vi.restoreAllMocks());

  it('should say where to drop the picture and how else to add it', () => {
    setup(locale);
    expect(screen.getByText(p.dropTitle)).toBeInTheDocument();
    expect(screen.getByText(p.dropOr)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: p.dropChoose })).toBeInTheDocument();
    expect(screen.getByText(p.dropHint)).toBeInTheDocument();
    expect(screen.getByTestId('picture-drop-zone').className).toContain('border-dashed');
  });

  it('should open the file chooser with the button', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    setup(locale);
    fireEvent.click(screen.getByRole('button', { name: p.dropChoose }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('should take a picture that is chosen with the file field (also for assistive technology)', () => {
    const onFile = setup(locale);
    const picture = png();
    fireEvent.change(screen.getByLabelText(p.imageLabel, { selector: 'input' }), { target: { files: [picture] } });
    expect(onFile).toHaveBeenCalledWith(picture);
    expect(screen.getByTestId('picture-name')).toHaveTextContent('geometry.png');
  });

  it('should highlight the area while a file is dragged over it and take the dropped picture', () => {
    const onFile = setup(locale);
    const zone = screen.getByTestId('picture-drop-zone');
    expect(zone).not.toHaveAttribute('data-dragging');
    fireEvent.dragOver(zone);
    expect(zone).toHaveAttribute('data-dragging', 'true');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute('data-dragging');
    fireEvent.dragOver(zone);
    const picture = png('dropped.png');
    fireEvent.drop(zone, { dataTransfer: { files: [picture] } });
    expect(zone).not.toHaveAttribute('data-dragging');
    expect(onFile).toHaveBeenCalledWith(picture);
    expect(screen.getByTestId('picture-name')).toHaveTextContent('dropped.png');
  });

  it('should take a screenshot that is pasted, and ignore text and other files on the clipboard', () => {
    const onFile = setup(locale);
    const shot = png('screenshot.png');
    paste([{ kind: 'string', type: 'text/plain', file: null }]);
    paste([{ kind: 'file', type: 'application/pdf', file: new File(['x'], 'a.pdf', { type: 'application/pdf' }) }]);
    expect(onFile).not.toHaveBeenCalled();
    paste([{ kind: 'string', type: 'text/plain', file: null }, { kind: 'file', type: 'image/png', file: shot }]);
    expect(onFile).toHaveBeenCalledWith(shot);
    expect(screen.getByTestId('picture-name')).toHaveTextContent('screenshot.png');
  });

  it('should show the name and the size of the chosen picture with a preview, and release the preview when it is removed', () => {
    const create = vi.fn(() => 'blob:preview');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const onFile = setup(locale, png('chart.png', 3 * 1024 * 1024));
    expect(screen.getByTestId('picture-name')).toHaveTextContent('chart.png');
    expect(screen.getByText('3.0 MB')).toBeInTheDocument();
    expect(document.querySelector('img')?.getAttribute('src')).toContain('blob');
    fireEvent.click(screen.getByRole('button', { name: p.dropRemove }));
    expect(onFile).toHaveBeenLastCalledWith(null);
    expect(revoke).toHaveBeenCalledWith('blob:preview');
    expect(screen.getByText(p.dropTitle)).toBeInTheDocument();
  });

  it('should clear the file field after a choice and after removing, so that the same picture can be chosen again', () => {
    setup(locale);
    const field = screen.getByLabelText(p.imageLabel, { selector: 'input' }) as HTMLInputElement;
    const picture = png();
    fireEvent.change(field, { target: { files: [picture] } });
    expect(field.value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: p.dropRemove }));
    expect((screen.getByLabelText(p.imageLabel, { selector: 'input' }) as HTMLInputElement).value).toBe('');
    fireEvent.change(screen.getByLabelText(p.imageLabel, { selector: 'input' }), { target: { files: [picture] } });
    expect(screen.getByTestId('picture-name')).toHaveTextContent('geometry.png');
  });

  it('should let the rider choose another picture, and show a small file in kilobytes', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    setup(locale, png('small.png', 300));
    expect(screen.getByText('1 kB')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: p.dropChange }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('should work without an address for the preview (no preview box, the name stays)', () => {
    Object.assign(URL, { createObjectURL: undefined });
    setup(locale, png('x.png'));
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByTestId('picture-name')).toHaveTextContent('x.png');
  });
});
