'use client';

import React, { useRef, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { shrinkPhoto } from '@/lib/service/photo';

interface PhotoFieldProps {
  t: Translations;
  photo: string | null;
  onChange: (photo: string | null) => void;
}

/** The photo of the bike: chosen from the device, shrunk in the browser and kept there. */
export const PhotoField: React.FC<PhotoFieldProps> = ({ t, photo, onChange }) => {
  const p = t.service.passport.photo;
  const input = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const choose = async (file: File | undefined) => {
    if (!file) return;
    const shrunk = await shrinkPhoto(file);
    setFailed(shrunk === null);
    if (shrunk !== null) onChange(shrunk);
    if (input.current) input.current.value = '';
  };
  return (
    <div className="space-y-2" data-testid="photo-field">
      <span className="text-xs font-semibold text-ink-2">{p.label}</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small data URL kept in the browser: there is nothing for the image loader to optimise */}
      {photo && <img src={photo} alt={p.alt} className="w-full max-w-xs rounded-xl border border-line object-cover" data-testid="photo-image" />}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} data-testid="photo-add" className="h-10 px-5 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken">{photo ? p.change : p.add}</button>
        {photo && <button type="button" onClick={() => onChange(null)} data-testid="photo-remove" className="h-10 px-5 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken">{p.remove}</button>}
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={p.label} onChange={(e) => void choose(e.target.files?.[0])} data-testid="photo-input" />
      <p className="text-xs text-ink-3">{p.hint}</p>
      {failed && <p role="alert" className="text-sm font-semibold text-tone-danger-ink" data-testid="photo-failed">{p.failed}</p>}
    </div>
  );
};
