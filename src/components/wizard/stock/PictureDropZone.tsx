'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';

type Texts = Translations['stockBike']['picker'];

interface DropZoneProps {
  texts: Texts;
  file: File | null;
  onFile: (file: File | null) => void;
}

/** A picture on the clipboard (a screenshot), or null. */
function pastedPicture(event: ClipboardEvent): File | null {
  const items = Array.from(event.clipboardData?.items ?? []);
  return items.find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile() ?? null;
}

/** A small preview of the chosen picture; the address is released as soon as the picture changes. */
function usePreview(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  /* The preview address exists only in the browser, so it is made and released from an effect on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== 'function') return setUrl(null);
    const made = URL.createObjectURL(file);
    setUrl(made);
    return () => URL.revokeObjectURL(made);
  }, [file]);
  /* eslint-enable react-hooks/set-state-in-effect */
  return url;
}

const kilobytes = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} kB`);

const PILL = 'h-10 px-5 rounded-full border text-sm font-semibold transition-colors';

/** The picture that was chosen: a preview, its name and size, and the way to change or remove it. */
const Chosen: React.FC<{ texts: Texts; file: File; preview: string | null; onChoose: () => void; onRemove: () => void }> = ({ texts: p, file, preview, onChoose, onRemove }) => (
  <div className="flex items-center gap-4 text-left">
    {preview && <Image src={preview} alt="" width={112} height={80} unoptimized className="h-20 w-28 object-contain rounded-lg border border-slate-200 bg-white" />}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-900 truncate" data-testid="picture-name">{file.name}</p>
      <p className="text-xs text-slate-500">{kilobytes(file.size)}</p>
    </div>
    <div className="flex flex-col gap-2 shrink-0">
      <button type="button" onClick={onChoose} className={`${PILL} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>{p.dropChange}</button>
      <button type="button" onClick={onRemove} className={`${PILL} border-transparent text-slate-600 hover:text-slate-900`}>{p.dropRemove}</button>
    </div>
  </div>
);

/** Nothing chosen yet: say where to drop the picture and how else to add it. */
const Empty: React.FC<{ texts: Texts; onChoose: () => void }> = ({ texts: p, onChoose }) => (
  <>
    <p className="text-sm font-bold text-slate-900">{p.dropTitle}</p>
    <p className="text-xs text-slate-500">{p.dropOr}</p>
    <button type="button" onClick={onChoose} className={`${PILL} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}>{p.dropChoose}</button>
    <p className="text-[11px] text-slate-500 leading-relaxed">{p.dropHint}</p>
  </>
);

/** A screenshot pasted with Ctrl+V (Cmd+V) while the area is on the screen is taken as the picture. */
function usePasteTarget(onFile: (file: File) => void) {
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const picture = pastedPicture(event);
      if (picture) onFile(picture);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onFile]);
}

/** Where and how to add the picture: drop it on the area, choose a file, or paste a screenshot; the chosen file is shown with a preview. */
export const PictureDropZone: React.FC<DropZoneProps> = ({ texts: p, file, onFile }) => {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const preview = usePreview(file);
  usePasteTarget(onFile);
  const choose = () => input.current?.click();
  /* A file field remembers its file: without clearing it the same picture cannot be chosen again after it was removed or used. */
  useEffect(() => {
    if (!file && input.current) input.current.value = '';
  }, [file]);
  return (
    <div
      role="group"
      aria-label={p.dropTitle}
      data-testid="picture-drop-zone"
      data-dragging={dragging || undefined}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer?.files?.[0] ?? null); }}
      className={cx('rounded-2xl border-2 border-dashed p-5 text-center space-y-3 transition-colors', dragging ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white')}
    >
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label={p.imageLabel} className="sr-only" tabIndex={-1} onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      {file ? <Chosen texts={p} file={file} preview={preview} onChoose={choose} onRemove={() => onFile(null)} /> : <Empty texts={p} onChoose={choose} />}
    </div>
  );
};
