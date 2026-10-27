'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { ADMIN_MAX_BYTES } from '@/lib/bikes/adminExtraction';
import { FIELD, PILL_PRIMARY } from '@/components/admin/AdminParts';
import { TableDropZone } from '@/components/admin/TableDropZone';
import type { Reading } from './readers';

type Texts = Translations['admin']['upload'];

interface GeometryReaderProps {
  /** The words of the drop area and the errors (the owner's page and the rider's intake word the hint differently). */
  texts: Texts;
  files: File[];
  onFiles: (files: File[]) => void;
  reading: Reading;
  onRead: () => void;
  accept?: readonly string[];
  /** The bike name box (the owner types it; the rider's intake already knows the name and passes none). */
  name?: { value: string; onChange: (name: string) => void };
}

/** The tables and, when asked for, the name of the bike; "Read all sizes" sends them to the reader that the page chose. */
export const GeometryReader: React.FC<GeometryReaderProps> = ({ texts: u, files, onFiles, reading, onRead, accept, name }) => {
  const [tried, setTried] = useState(false);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const incomplete = files.length === 0 || (name !== undefined && name.value.trim() === '') || total > ADMIN_MAX_BYTES;
  const error = tried && incomplete ? 'invalid_input' : reading.status === 'error' ? reading.error : null;
  /* Not a form: the rider's intake sits inside the search form of path B, and a form cannot hold a form. */
  const submit = () => { setTried(true); if (!incomplete) onRead(); };
  return (
    <div className="space-y-3">
      <TableDropZone texts={u} files={files} onFiles={onFiles} accept={accept} />
      {name && <label className="block space-y-1 max-w-md"><span className="text-xs font-semibold text-ink-2">{u.nameLabel}</span><input type="text" maxLength={80} placeholder={u.namePlaceholder} value={name.value} onChange={(e) => name.onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} className={FIELD} /></label>}
      {error && <p role="alert" className="text-sm text-tone-danger-ink">{u.errors[error]}</p>}
      <button type="button" onClick={submit} disabled={reading.status === 'working'} className={PILL_PRIMARY}>{reading.status === 'working' ? u.reading : u.read}</button>
    </div>
  );
};
