import type { Translations } from '../types';

export const connections: Translations['connections'] = {
  title: 'Propojení',
  intro: 'Služby, které přinášejí jízdy tohoto kola do knihy opotřebení. Čtou jen den, druh, vzdálenost a stoupání jízdy.',
  summary: '{n} z {total} služeb přináší jízdy tomuto kolu.',
  summaryNone: 'Žádná služba zatím nepřináší jízdy tomuto kolu.',
  states: { checking: 'Ověřuje se', guest: 'Je potřeba přihlášení', unavailable: 'Není nastaveno', disconnected: 'Nepropojeno', connected: 'Propojeno, kolo nespárováno', paired: 'Propojeno a spárováno', keySaved: 'Klíč uložen, zatím bez pravidla' },
  pointer: 'Jízdy ze Stravy nebo z Intervals.icu se nastavují v záložce Propojení.',
  pointerButton: 'Otevřít Propojení',
};
