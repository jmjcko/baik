import React from 'react';

/** The look of a menu that opens from the sidebar: a clear edge and a deep shadow so it stands out from the dark panel in both themes. */
export const POPUP_CLASS = 'absolute left-0 right-0 top-full z-50 mt-3 rounded-2xl border border-slate-400/60 bg-surface p-1.5 text-ink shadow-[0_18px_44px_rgba(0,0,0,0.55)] ring-1 ring-black/10';

/** The trigger of such a menu: the edge turns blue while the menu is open, so the button and its menu belong together. */
export const triggerClass = (open: boolean): string =>
  `w-full text-left rounded-xl border bg-[#282a3c] px-3 py-2 flex items-center justify-between gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 ${open ? 'border-blue-400' : 'border-slate-700/60 hover:border-slate-500'}`;

/** A small notch on the top edge of the menu that points at the button (decoration, hidden from screen readers). */
export const PopupCaret: React.FC = () => (
  <span aria-hidden="true" className="absolute -top-[7px] right-5 h-3 w-3 rotate-45 border-l border-t border-slate-400/60 bg-surface" />
);
