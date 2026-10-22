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
  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
    <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">{badge}</span>
    <button
      onClick={onClose}
      className="font-mono text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-800 hover:border-slate-600 transition-colors"
    >
      ESC / {closeLabel}
    </button>
  </div>
);

const ModalFooter: React.FC<{ closeLabel: string; onClose: () => void }> = ({ closeLabel, onClose }) => (
  <div className="pt-4 border-t border-slate-800 flex justify-end">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <ModalHeader badge={badge} closeLabel={closeLabel} onClose={onClose} />
        <h3 id="modal-title" className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
          <p>{description}</p>
        </div>
        <ModalFooter closeLabel={closeLabel} onClose={onClose} />
      </div>
    </div>
  );
};
