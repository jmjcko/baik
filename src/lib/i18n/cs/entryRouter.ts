import type { Translations } from '../types';

export const entryRouter: Translations['entryRouter'] = {
  title: 'Najdi svůj perfektní posed na kole',
  subtitle: 'Jednoduchý průvodce nastavením kola a výběrem správné velikosti z domova.',
  pathATitle: 'Nastavit moje současné kolo',
  pathASubtitle: 'Bolí tě při jízdě ruce, kolena nebo záda? Projdeme 3 rychlé kroky a ukážeme ti přesné úpravy posedu.',
  pathABadge: 'CESTA A: PRŮVODCE POSEDEM',
  pathAButton: 'Spustit průvodce posedu →',
  pathASteps: [
    'Změření tvojí postavy (3 minuty)',
    'Diagnostika tvojí bolesti a výpočet posedu',
    'Přehledný report s návodem, co jak posunout',
  ],
  pathBTitle: 'Vybrat nové kolo před nákupem',
  pathBSubtitle: 'Chystáš se koupit nové kolo? Porovnáme tvou postavu s geometrií rámu, abys nekoupil špatnou velikost.',
  pathBBadge: 'CESTA B: KONTROLA PŘED NÁKUPEM',
  pathBButton: 'Zkontrolovat nové kolo →',
  pathBSteps: [
    'Zadání modelu nebo odkazu na kolo',
    'AI kontrola geometrie (Stack / Reach)',
    'Upozornění na nevhodná řídítka nebo kliky před objednáním',
  ],
  directCadTitle: 'Přímý vstup do CAD studia',
  directCadSubtitle: 'Pro zkušené mechaniky a stavitele rámů vyžadující okamžité ladění souřadnic.',
  directCadButton: 'Otevřít CAD studio přímo (Pokročilé)',
};
