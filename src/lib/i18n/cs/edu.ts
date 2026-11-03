import type { Translations } from '../types';

export const edu: Translations['edu'] = {
  title: 'Akademie bAIkedu',
  intro: 'Krátké praktické články ze znalostní báze bAIk. Přečtete je asi za dvě minuty a pak otevřete nástroj, ke kterému patří.',
  filtersLabel: 'Témata',
  all: 'Vše',
  tags: { bikefit: '#bikefit', care: '#údržba', gear: '#výbava', nutrition: '#výživa', tyres: '#pláště-a-tlak' },
  searchLabel: 'Hledat v článcích',
  searchPlaceholder: 'Hledat podle slova',
  readTime: '{min} min čtení',
  read: 'Číst článek',
  back: 'Zpět na články',
  empty: 'Žádný článek nevyhovuje. Zkuste jiné slovo nebo zvolte Vše.',
  count: 'Článků: {n}',
  keyFacts: 'Hlavní fakta',
  sourceLabel: 'Znalostní báze',
  sourceVideo: 'Zdroj: YouTube – {channel}: {title}',
  general: 'Obecná informace, nenahrazuje lékařskou péči ani trenéra.',
  openTool: { care: 'Otevřít bAIkcare', fit: 'Otevřít bAIkfit' },
  articles: {
    'bike-weight': {
      title: 'Mýtus o váze kola',
      teaser: 'Proč jedno nebo dvě kila navíc na rámu v reálném světě téměř nic neznamenají.',
      points: [
        'Hmotnost kola se přeceňuje, protože je na váze snadno vidět.',
        'Mimo strmá stoupání změní pár kilogramů navíc čas vyjížďky jen velmi málo. Mnohem víc rozhodují najeté kilometry a aerodynamika.',
        'Poddajné pláště a dobrý posed vrátí za peníze víc než lehčí komponenty.',
      ],
    },
    'm-check': {
      title: '5minutový M-Check',
      teaser: 'Jednoduchá kontrola kola před jízdou, bez nářadí.',
      points: [
        'Postupujte po linii písmene M: přední kolo a náboj, hlavové složení a kokpit, střed a kliky, sedlovka a sedlo, zadní kolo a měnič.',
        'Hledejte vůli v ložiskách, stav plášťů, dotažení šroubů představce a sedlovky a opotřebení řetězu.',
      ],
      source: 'Znalostní báze bAIkcare v1.1.0, protokol M-Check.',
    },
    'numb-hands': {
      title: 'Brnění rukou a mobilizace nervů',
      teaser: 'Jak ulevit tlaku na loketní a středový nerv, na kole i mimo něj.',
      points: [
        'Brnění malíku a vedlejší poloviny prsteníku ukazuje na loketní (ulnární) nerv, brnění palce, ukazováku a prostředníku na středový (mediánní) nerv.',
        'Obvyklé příčiny: příliš široká řídítka (zápěstí se vytáčejí), dlouhý dosah nebo sedlo skloněné dolů.',
        'Mobilizace nervů: jemný střídavý pohyb paží a hlavy posouvá nerv v jeho obalu a obnovuje prokrvení, bez agresivního natahování.',
      ],
      note: 'Když brnění nezmizí nebo se vrací, poraďte se s lékařem nebo fyzioterapeutem.',
      source: 'Znalostní báze bAIkfit v1.4.0.',
    },
    cleats: {
      title: 'Tretry, klenba a poloha kufrů',
      teaser: 'Proč vyměnit tovární vložky a posunout kufry směrem k patě.',
      points: [
        'Tovární vložky slouží jen k vyzkoušení boty v obchodě a klenbu nepodpírají.',
        'Koupě delší boty kvůli větší šířce posune kufr mimo klouby, příliš dopředu.',
        'Kufr dál vzadu, mezi první a pátou nártní kostí, uleví lýtkům, stabilizuje kotník a zapojí hýždě a zadní stranu stehen.',
      ],
    },
    fuelling: {
      title: 'Výživa na kole',
      teaser: 'Pravidlo 30 minut a jak předejít energetickému propadu, kterému se říká bonk.',
      points: [
        'Jezte a pijte od první půlhodiny jízdy; až pocítíte hlad, tělo už ztrácí glykogen.',
        'Doporučený poměr za celý den pro rostoucího jezdce: asi 60 % sacharidů, 20 % bílkovin a 20 % tuků.',
      ],
      note: 'Jde o obecnou informaci. Své potřeby probírejte s lékařem nebo nutričním terapeutem.',
    },
    'tyre-science': {
      title: 'Věda o tlaku a šířce plášťů',
      teaser: 'Proč širší plášť sám o sobě není rychlejší a jak zkrotit vibrace.',
      points: [
        'V laboratoři se širší plášť při stejném tlaku valí lépe, ale na silnici jedete nižším tlakem: při stejném stlačení a pohodlí je valivý odpor zhruba stejný.',
        'Přehuštěný plášť na nerovnostech poskakuje a ztrácí watty vibracemi (impedance). Širší plášť dovolí nižší tlak bez procvaknutí.',
        'Pravidlo 105: ráfek má být asi o 5 % širší než plášť, který na něm změříte, aby proud vzduchu zůstal přilnutý.',
      ],
      source: 'Znalostní báze bAIkcare v1.1.0, sekce 5a.',
    },
  },
};
