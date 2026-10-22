'use client';

import React, { useEffect } from 'react';

export type ModalTopic = 'lemond' | 'ulnar' | 'nerveFlossing' | 'crank' | null;

interface EducationalModalProps {
  topic: ModalTopic;
  title: string;
  description: string;
  badge: string;
  closeLabel: string;
  onClose: () => void;
}

/** Calls onClose when Escape is pressed while the modal is active. */
function useEscapeToClose(active: boolean, onClose: () => void): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (active) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onClose]);
}

const ModalHeader: React.FC<{ badge: string; closeLabel: string; onClose: () => void }> = ({ badge, closeLabel, onClose }) => (
  <div className="flex items-center justify-between border-b border-line pb-3">
    <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">{badge}</span>
    <button
      onClick={onClose}
      className="font-mono text-xs text-ink-3 hover:text-ink px-2 py-1 rounded border border-line hover:border-ink-3 transition-colors"
    >
      ESC / {closeLabel}
    </button>
  </div>
);

const ModalFooter: React.FC<{ closeLabel: string; onClose: () => void }> = ({ closeLabel, onClose }) => (
  <div className="pt-4 border-t border-line flex justify-end">
    <button
      type="button"
      onClick={onClose}
      className="px-5 py-2 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
    >
      {closeLabel}
    </button>
  </div>
);

export const EducationalModal: React.FC<EducationalModalProps> = ({ topic, title, description, badge, closeLabel, onClose }) => {
  useEscapeToClose(Boolean(topic), onClose);
  if (!topic) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-xl border border-line bg-surface p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <ModalHeader badge={badge} closeLabel={closeLabel} onClose={onClose} />
        <h3 id="modal-title" className="text-lg font-bold text-ink tracking-tight">{title}</h3>
        <div className="text-sm text-ink-2 leading-relaxed space-y-3 font-sans">
          <p>{description}</p>
        </div>
        <ModalFooter closeLabel={closeLabel} onClose={onClose} />
      </div>
    </div>
  );
};
