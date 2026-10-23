'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { ADMIN_MAX_FILES, ADMIN_MIME_TYPES } from '@/lib/bikes/adminExtraction';
import { PILL_OUTLINE, PILL_PRIMARY } from './AdminParts';

type Texts = Translations['admin']['upload'];

interface DropZoneProps {
  texts: Texts;
  files: File[];
  onFiles: (files: File[]) => void;
}

const kilobytes = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} kB`);

/** The pictures on the clipboard (a screenshot). */
const pastedPictures = (event: ClipboardEvent): File[] =>
  Array.from(event.clipboardData?.items ?? []).filter((item) => item.kind === 'file' && item.type.startsWith('image/')).flatMap((item) => item.getAsFile() ?? []);

/** A screenshot pasted with Ctrl+V (Cmd+V) while the area is on the screen is added to the files. */
function usePasteTarget(onAdd: (added: File[]) => void) {
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pictures = pastedPictures(event);
      if (pictures.length > 0) onAdd(pictures);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onAdd]);
}

const FileList: React.FC<{ texts: Texts; files: File[]; onRemove: (index: number) => void }> = ({ texts, files, onRemove }) => (
  <ul className="space-y-2 text-left" data-testid="table-files">
    {files.map((file, index) => (
      <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-line bg-sunken px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{file.name}</span>
        <span className="text-xs text-ink-3">{kilobytes(file.size)}</span>
        <button type="button" aria-label={fill(texts.removeFile, { name: file.name })} onClick={() => onRemove(index)} className="text-xs font-semibold text-ink-2 hover:text-ink">×</button>
      </li>
    ))}
  </ul>
);

/** Where and how to add the tables: drop them on the area, choose files, or paste a screenshot; the files are listed below. */
export const TableDropZone: React.FC<DropZoneProps> = ({ texts, files, onFiles }) => {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const add = (added: File[]) => onFiles([...files, ...added].slice(0, ADMIN_MAX_FILES));
  usePasteTarget(add);
  return (
    <div
      role="group"
      aria-label={texts.dropTitle}
      data-testid="table-drop-zone"
      data-dragging={dragging || undefined}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); add(Array.from(e.dataTransfer?.files ?? [])); }}
      className={cx('rounded-2xl border-2 border-dashed p-5 text-center space-y-3 transition-colors', dragging ? 'border-blue-600 bg-tone-info-bg' : 'border-line bg-surface')}
    >
      <input ref={input} type="file" multiple accept={ADMIN_MIME_TYPES.join(',')} aria-label={texts.dropChoose} className="sr-only" tabIndex={-1} onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      <p className="text-sm font-bold text-ink">{texts.dropTitle}</p>
      <p className="text-xs text-ink-2">{texts.dropOr}</p>
      <button type="button" onClick={() => input.current?.click()} className={files.length === 0 ? PILL_PRIMARY : PILL_OUTLINE}>{texts.dropChoose}</button>
      <p className="text-[11px] text-ink-3 leading-relaxed">{texts.dropHint}</p>
      {files.length > 0 && <FileList texts={texts} files={files} onRemove={(index) => onFiles(files.filter((_, at) => at !== index))} />}
    </div>
  );
};
