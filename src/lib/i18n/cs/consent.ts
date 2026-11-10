import type { ConsentTexts } from '../types/consent';

export const consent: ConsentTexts = {
  purposes: {
    health_storage: {
      title: 'Ukládat moje data v mém účtu',
      body: 'bAIk ukládá tvoje míry a hlášené potíže (zdravotní údaje) do tvého účtu, abys je mohl používat na každém zařízení. Vidíš je jen ty.',
      data: ['Tělesné míry a váha', 'Potíže, které nahlásíš', 'Tvoje kola a styl jízdy', 'Servisní knihy tvých kol: servisní deník, jízdy, připomínky (ne číslo rámu, číslo pojištění ani fotka)'],
    },
    ai_processing: {
      title: 'Nechat AI službu použít moje data',
      body: 'Některé funkce posílají tvoje data AI službě (Google Gemini), aby napsala vysvětlení. Pravidla aplikace běží vždy; AI jen doplní vysvětlení.',
      data: ['Výška, délka nohy, trupu a paže, šířka ramen, váha', 'Pohyblivost, styl jízdy a potíže, které nahlásíš', 'Kolo, které kontroluješ, a jeho geometrie, nebo tvoje odpovědi v hledači kol', 'Neposílá se: jméno, e-mail, poloha ani jízdy'],
    },
    strava: {
      title: 'Propojit Stravu',
      body: 'bAIk čte ze Stravy souhrny tvých jízd, aby doplnil opotřebení kola. Přihlášení ke Stravě je uložené zašifrované v tvém účtu a odpojit se můžeš kdykoli.',
      data: ['Identifikátor profilu na Stravě', 'Souhrny jízd: datum, vzdálenost, převýšení, kolo', 'Neukládá se trasa, mapa ani tepová frekvence'],
    },
    intervals: {
      title: 'Propojit Intervals.icu',
      body: 'bAIk čte z Intervals.icu souhrny tvých jízd, aby doplnil opotřebení kola. Když jsi přihlášen, tvůj klíč je uložený zašifrovaně v tvém účtu, takže se jízdy načítají na každém zařízení a také jednou denně na pozadí, když je aplikace zavřená: server aplikace pak přečte z Intervals.icu souhrny tvých jízd a doplní je do servisní knížky kola. Bez účtu zůstává klíč v tomto prohlížeči. Smazat ho můžeš kdykoli.',
      data: ['Tvůj klíč k Intervals.icu (zašifrovaně v tvém účtu, když jsi přihlášen, jinak jen v tomto prohlížeči)', 'Souhrny jízd: datum, vzdálenost, převýšení, kolo (server je čte jednou denně, i když je aplikace zavřená)'],
    },
    analytics: {
      title: 'Pomoct vylepšit bAIk statistikami používání',
      body: 'Volitelné. Počítá, které kroky se používají, aby šly opravit nepoužívané nebo matoucí kroky. Zatím se nic neměří; přepínač začne platit, až se měřit začne.',
      data: ['Které kroky aplikace otevřeš', 'Žádné míry, žádné potíže'],
    },
  },
  prompt: {
    dataTitle: 'Čeho se to týká',
    allow: 'Souhlasím',
    decline: 'Teď ne',
    privacyLink: 'Přečíst, jak se s daty zachází',
    needed: 'Tato funkce potřebuje tvůj souhlas. Můžeš ho dát tady, nebo později v profilu.',
  },
  audit: {
    title: 'Použít pro tuto kontrolu AI službu?',
    allow: 'Souhlasím a použít AI',
    decline: 'Zkontrolovat jen pravidly',
    declinedNote: 'Tuto kontrolu spočítala jen pravidla aplikace. Souhlas s AI vysvětlením můžeš kdykoli dát v profilu.',
  },
  finder: { title: 'Použít AI službu k návrhu kol?' },
  section: {
    title: 'Souhlasy',
    intro: 'Ty rozhoduješ, co smí bAIk s tvými daty dělat. Každé rozhodnutí tady můžeš kdykoli změnit; odvolat souhlas je stejně snadné jako ho dát.',
    stateGranted: 'Souhlasím',
    stateDeclined: 'Nesouhlasím',
    stateUnknown: 'Zatím se nikdo neptal',
    give: 'Souhlasit',
    withdraw: 'Odvolat',
    withdrawHealthNote: 'Nové změny se už do tvého účtu neukládají. Co je uloženo, tam zůstane, dokud to nesmažeš v části „Tvoje práva k datům“ níže.',
    privacyLink: 'Soukromí',
  },
  privacy: {
    title: 'Soukromí',
    subtitle: 'Co bAIk dělá s tvými daty, jednoduše.',
    draftNote: 'Návrh textu k právní revizi. Popisuje, jak aplikace funguje dnes; není to právní poradenství.',
    updated: 'Verze 1, 9. listopadu 2026',
    back: 'Zpět do aplikace',
    controllerHeading: 'Kdo za data odpovídá',
    controllerLine: 'Správcem tvých údajů je {name}.',
    contactLine: 'Kontakt pro dotazy a žádosti: {contact}',
    contactMissing: 'Kontakt pro dotazy a žádosti: bude doplněn před veřejným spuštěním.',
    sections: [
      {
        heading: 'Bez účtu',
        paragraphs: ['Pokud se nepřihlásíš, tvoje míry, kola a jízdy zůstanou jen v tomto prohlížeči. bAIk je nedostává. Smazáním dat tohoto webu zmizí.'],
      },
      {
        heading: 'S účtem',
        paragraphs: [
          'Když se přihlásíš, bAIk ukládá tvoje míry a hlášené potíže do tvého účtu, abys je mohl používat na každém zařízení. Potíže jsou zdravotní údaje, proto se bAIk nejdřív ptá na tvůj výslovný souhlas (GDPR, čl. 6 odst. 1 písm. a) a čl. 9 odst. 2 písm. a)). Tvoje řádky přečteš jen ty; hlídá to databáze.',
          'Servisní kniha každého kola (servisní deník, jízdy, připomínky) se ukládá do účtu také, aby byla vidět na každém zařízení. Číslo rámu, číslo pojištění a fotka kola tvůj prohlížeč nikdy neopustí.',
          'Souhlas můžeš kdykoli odvolat v profilu. Můžeš také stáhnout všechno, co je uloženo, smazat uložená data nebo smazat účet i se vším, co v něm je.',
        ],
      },
      {
        heading: 'AI služba',
        paragraphs: [
          'Dvě funkce (kontrola před koupí a hledač kol) mohou poslat tvoje míry, váhu, pohyblivost, styl jízdy a hlášené potíže službě Google Gemini, aby napsala vysvětlení. Stane se to až po tvém souhlasu. Jméno, e-mail, poloha ani jízdy se neposílají. bAIk neukládá ani nezaznamenává, co se posílá; Google s tím zachází podle vlastních podmínek pro Gemini API.',
          'Kontrola před koupí funguje i bez AI služby: výsledek pak spočítají jen pravidla aplikace.',
        ],
      },
      {
        heading: 'Strava a Intervals.icu',
        paragraphs: [
          'Pokud je propojíš, bAIk čte souhrny tvých jízd (datum, vzdálenost, převýšení, kolo), aby doplnil opotřebení kola. Přihlášení ke Stravě a, když jsi přihlášen, klíč k Intervals.icu jsou uložené zašifrovaně v tvém účtu (přečte je jen server aplikace) a server je jednou denně používá k načtení nových souhrnů jízd do tvé servisní knížky, i když je aplikace zavřená. Bez účtu zůstává klíč k Intervals.icu v tomto prohlížeči. Odpojit se můžeš kdykoli a klíč se smaže.',
        ],
      },
      {
        heading: 'Statistiky používání',
        paragraphs: ['bAIk teď tvoje používání neměří. Pokud se to v budoucnu změní, bude to volitelné a vypnuté, dokud nesouhlasíš.'],
      },
      {
        heading: 'Kdo další s daty zachází',
        paragraphs: ['Poskytovatel databáze a přihlášení, poskytovatel, který aplikaci hostuje, Google (AI služba, přihlášení přes Google) a Strava nebo Intervals.icu, pokud je propojíš.'],
      },
      {
        heading: 'Jak dlouho',
        paragraphs: ['Dokud je nesmažeš. Smazáním účtu zmizí uložená data, propojení i záznam o tvých souhlasech.'],
      },
      {
        heading: 'Tvoje práva',
        paragraphs: [
          'Můžeš žádat o přístup, opravu, výmaz, omezení a přenositelnost a vznést námitku proti zpracování. Většinu z toho zvládneš sám v profilu. Stížnost můžeš podat u Úřadu pro ochranu osobních údajů (uoou.gov.cz).',
        ],
      },
      {
        heading: 'Není to lékařská rada',
        paragraphs: ['bAIk dává obecné informace o nastavení kola. Nestanovuje diagnózu ani neléčí. Pokud tě bolest nebo brnění nepřejde, obrať se na lékaře nebo fyzioterapeuta.'],
      },
    ],
  },
};
