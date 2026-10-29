import type { Translations } from '../types';

export const shell: Translations['shell'] = {
  header: {
    modes: { entry: 'Přehled', fit: 'bAIkfit', wizard: 'Průvodce nastavením', report: 'Report fittingu', studio: 'CAD studio', prepurchasing: 'Kontrola před nákupem', care: 'Dílna bAIkcare', profile: 'Můj profil', admin: 'Správa katalogu', capabilities: 'Přehled možností fittingu' },
    activeBike: 'Aktivní kolo',
    bikeSwitcherLabel: 'Aktivní kolo ve vaší stáji',
    noBike: 'Kolo bez názvu',
    openNav: 'Otevřít navigaci',
    closeNav: 'Zavřít navigaci',
    status: { guest: 'Host: uloženo v tomto prohlížeči', synced: 'Přihlášen: synchronizováno', syncing: 'Synchronizuji', error: 'Chyba synchronizace: drží se v tomto prohlížeči' },
  },
  sidebar: {
    dashboard: 'Přehled',
    modules: 'Moduly',
    myBikes: 'Moje kola',
    activeBike: 'Aktivní',
    noBikes: 'Zatím žádné kolo',
    addBike: 'Přidat kolo',
    mainLabel: 'Hlavní navigace',
  },
  fitHub: {
    title: 'Vaše kolo, přizpůsobené vám',
    subtitle: 'Změřte se, zkontrolujte kolo a dostanete jasný plán, co změnit a proč, abyste jezdili déle a bez bolesti.',
    chips: ['Přesná čísla v milimetrech', 'Důvod každého kroku', 'Z domova, během minut'],
    pathA: { badge: 'Průvodce posedem', title: 'Nastavit moje kolo', text: 'Bolí vás při jízdě ruce, kolena nebo záda? Získáte přesné úpravy a důvod každé z nich.', button: 'Spustit průvodce' },
    pathB: { badge: 'Před nákupem', title: 'Zkontrolovat nové kolo', text: 'Porovnejte geometrii kola, o kterém uvažujete, se svou postavou, ať nekoupíte špatnou velikost.', button: 'Zkontrolovat nové kolo' },
  },
  dashboard: {
    title: 'Přehled',
    subtitle: 'Váš fitting na jednom místě: cíle aktivního kola, vaše stáj a testy pohyblivosti.',
    notSetUp: 'Zatím nenastaveno',
    kpis: { saddle: 'Cílová výška sedla', stack: 'Cílový stack řídítek', setback: 'Cílový posun sedla', symptoms: 'Hlášené potíže', diagnosis: 'Poslední diagnostika' },
    symptomsNone: 'Žádné',
    noDiagnosis: 'Zatím bez diagnostiky',
    hero: { title: 'Přizpůsobte kolo svému tělu', text: 'Odpovězte na pár otázek, změřte se a dostanete report, který řekne, co na kole změnit a proč.', stepsTitle: 'Co průvodce pokrývá', start: 'Spustit průvodce', checkBike: 'Zkontrolovat kolo před nákupem' },
    overview: { title: 'Biomechanický přehled', subtitle: 'CAD kresba vašeho aktivního kola podle jeho cílových čísel.', empty: 'Dokončete průvodce a uvidíte kresbu svého kola.' },
    garage: { title: 'Moje stáj', text: 'Aktivní kolo je to, se kterým pracuje průvodce nastavením, report i studio.', active: 'Aktivní kolo', makeActive: 'Přepnout jako aktivní', manage: 'Spravovat stáj', signInHint: 'Přihlaste se, abyste mohli do stáje přidat další kola.', factory: 'Původní osazení z výroby', ownSetup: 'Vlastní osazení' },
    miniTests: { title: 'Mini-testy pohyblivosti', text: 'Dva rychlé testy, které přizpůsobí cílovou polohu vašemu tělu.', hamstring: 'Ohebnost hamstringů', release: 'Test odlehčení rukou', notDone: 'Neudělán', take: 'Udělat mini-testy', answers: { low: 'Pod 60°', medium: '60° až 75°', high: 'Nad 75°', slumping: 'Přepadává dopředu', stable: 'Drží pozici' } },
    modules: { care: { title: 'bAIkcare', text: 'Protokoly údržby a diagnostika opotřebení vašeho kola.' }, shop: { title: 'bAIkshop', text: 'Upgrady komponent seřazené podle toho, co vám za peníze přinesou.' }, comingSoon: 'Připravujeme' },
  },
};
