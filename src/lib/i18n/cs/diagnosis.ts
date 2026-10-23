import type { Translations } from '../types';

/** Texty vycházejí z docs/knowledge/baikfit_kb_v1.3.0.md, část 6 (rozhodovací strom) a 4.1 (odlehčení tlaku). */
export const diagnosis: Translations['diagnosis'] = {
  heading: 'Co obvykle znamenají tvoje potíže',
  noSymptoms: 'Žádné potíže nehlásíš, skvělé. Kdyby tě něco začalo trápit, přidej to v kroku 3 průvodce a vysvětlíme ti pravděpodobnou příčinu.',
  rootCauseLabel: 'Pravděpodobná příčina',
  fixesLabel: 'Co s tím',
  learnMore: 'Návod na uvolňování nervů',
  items: {
    ulnar: {
      title: 'Brnění rukou: malíček a prsteník (ulnární nerv)',
      rootCause: 'Útlak ulnárního nervu kvůli zalomeným zápěstím nebo příliš velké váze na rukou.',
      fixes: [
        'Přizpůsobte šířku řídítek šířce akromionu (1:1).',
        'Vyrovnejte sedlo (0° až -1,5°).',
        'Zkraťte dosah kokpitu (reach).',
        'Cvičte uvolňování ulnárního nervu (nerve flossing).',
      ],
    },
    median: {
      title: 'Brnění rukou: palec, ukazováček a prostředník (mediánový nerv)',
      rootCause: 'Útlak mediánového nervu (karpální tunel) kvůli vibracím silnice a ohnutí zápěstí.',
      fixes: [
        'Natočte řadicí páky a blatníky tak, aby zápěstí nebylo přepnuté.',
        'Snižte tlak v pláštích (kalkulačka Silca).',
        'Použijte omotávku s dobrým úchopem, ne korkovou.',
        'Cvičte uvolňování mediánového nervu (nerve flossing).',
      ],
    },
    anteriorKnee: {
      title: 'Bolest přední části kolene (pately)',
      rootCause: 'Sedlo je příliš nízko nebo příliš vpředu a koleno se pod zátěží nadměrně ohýbá.',
      fixes: ['Zvedejte sedlo po krocích 3–5 mm.', 'Posuňte sedlo (setback) dozadu.'],
    },
    posteriorKnee: {
      title: 'Bolest zadní části kolene (hamstringy)',
      rootCause: 'Sedlo je příliš vysoko nebo příliš vzadu a koleno se ve 6 hodin přetahuje.',
      fixes: ['Snižujte sedlo po krocích 5–10 mm.', 'Posuňte sedlo (setback) dopředu.'],
    },
    lowerBack: {
      title: 'Bolest a únava beder',
      rootCause: 'Zaklopená pánev (hrbení) kvůli bolesti měkkých tkání nebo příliš dlouhému dosahu a velkému poklesu.',
      fixes: ['Přejděte na sedlo s výřezem.', 'Zkraťte dosah a pokles řídítek.', 'Zapojte střed těla (posilování).'],
    },
    neck: {
      title: 'Bolest krku a trapézových svalů',
      rootCause: 'Řídítka jsou příliš široká (ruce jsou daleko od sebe) nebo je dosah příliš dlouhý (natahování ramen).',
      fixes: ['Zúžte řídítka na šířku akromionu.', 'Zkraťte představec o 10–20 mm.'],
    },
    saddlePressure: {
      title: 'Otlačeniny a tlak na měkké tkáně',
      rootCause: 'Chybí odlehčení tlaku: sedlo bez středového výřezu (potřebuje ho přes 90 % jezdců) nebo příliš široké sedlo.',
      fixes: [
        'Použijte sedlo se středovým výřezem nebo hlubokým odlehčovacím kanálem.',
        'Držte šířku sedla do 145 mm.',
        'Držte sedlo vodorovně, nejvýše 1,5°–2,0° nosem dolů.',
      ],
    },
  },
};
