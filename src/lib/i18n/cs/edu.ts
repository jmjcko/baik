import type { Translations } from '../types';

export const edu: Translations['edu'] = {
  title: 'Akademie bAIkedu',
  intro: 'Krátké praktické tipy ze znalostní báze bAIk. Přečtete je asi za dvě minuty a pak otevřete nástroj, ke kterému patří.',
  filtersLabel: 'Témata',
  all: 'Vše',
  tags: { bikefit: '#bikefit', care: '#údržba', gear: '#výbava', nutrition: '#výživa', tyres: '#pláště-a-tlak' },
  searchLabel: 'Hledat v tipech',
  searchPlaceholder: 'Hledat podle slova',
  readTime: '{min} min čtení',
  read: 'Číst tip',
  back: 'Zpět na tipy',
  empty: 'Žádný tip nevyhovuje. Zkuste jiné slovo nebo zvolte Vše.',
  count: 'Tipů: {n}',
  keyFacts: 'Hlavní fakta',
  sourceLabel: 'Znalostní báze',
  sourcesTitle: 'Podívejte se na zdroj',
  sourceVideo: 'Zdroj: YouTube – {channel}: {title} (čas {time})',
  general: 'Obecná informace, nenahrazuje lékařskou péči ani trenéra.',
  openTool: { care: 'Otevřít bAIkcare' },
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
    'shifting-technique-drivetrain-care': {
      title: 'Správná technika řazení a péče o pohon',
      teaser: 'Naučte se správně používat řazení, uvolňovat tlak na pedály při řazení a vyhnout se škodlivému křížení řetězu.',
      points: [
        'Pravá páčka řadí zadní kazetu (jemné dolaďování), levá přední převodník (hrubé skoky v převodu).',
        'Držte stabilní kadenci asi 80 až 95 ot./min tím, že převod přizpůsobíte terénu.',
        'Stoupání předvídejte a podřaďte asi 20 metrů před jeho začátkem, abyste neřadili pod plnou zátěží.',
        'Při řazení na okamžik uvolněte tlak na pedály, řetěz pak běží hladce a tiše.',
        'Vyhněte se křížení řetězu (velký převodník s největším pastorkem, nebo malý s nejmenším): opotřebovává drahé součásti pohonu.',
      ],
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
      source: 'Znalostní báze bAIkfit v1.5.0.',
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
    'how-to-choose-bike-type-guide': {
      title: 'Jak vybrat správný typ kola (průvodce pro začátečníky)',
      teaser: 'Stručný průvodce silničními, gravelovými a horskými koly, který vám pomůže najít to, co sedí vaší jízdě.',
      points: [
        'Silniční kola se dělí na Race (agresivní, dlouhý a nízký posed pro zkušené) a Endurance (pohodlnější, kratší a vyšší posed pro dlouhé jízdy).',
        'Gravel kola spojují silniční berany se širokými plášti, stabilnější geometrií a lehčími převody, pro silnici i pro terén.',
        'Horská kola mají rovná řídítka a odpružení pro kontrolu v náročném terénu; vzpřímený posed a vzorek plášťů ale zvyšují odpor na asfaltu.',
      ],
    },
    'pedalling-technique-myths-efficiency': {
      title: 'Mýty o technice šlapání: proč se "šlapání do kruhu" nevyplácí',
      teaser: 'Co říká výzkum o tahání pedálu nahoru a jak opravdu šlapou profesionálové.',
      points: [
        'Celková metabolická efektivita jezdce se mezi začátečníky a profesionály výrazně neliší.',
        'Aktivní tahání pedálu nahoru ("šlapání do kruhu") prodlužuje svalovou kontrakci a snižuje celkovou energetickou účinnost.',
        'Profesionálové mají nejvyšší výkon při včasném a silném zatlačení dolů, zhruba když klika míří na třetí hodinu, a pedál při cestě nahoru odlehčují.',
        'Efektivita šlapání se zlepšuje přirozeně s najetými kilometry a tréninkem v různých kadencích.',
      ],
    },
    'bike-theft-prevention-locking-tricks': {
      title: 'Jak zabezpečit kolo před zloději a nenechat se napálit',
      teaser: 'Obvyklé triky zlodějů kol a klidný způsob zamykání, bez zbytečných obav.',
      points: [
        'Zloději zamknou svůj zámek přes vaše kolo nebo uvolní značky ze země, aby vás přiměli nechat kolo na místě přes noc.',
        'Dobré zabezpečení prodlouží čas potřebný k překonání zámku nad 3 až 5 minut a odradí většinu příležitostných zlodějů.',
        'Pro celodenní stání použijte skládací zámek spolu s masivním U-lockem, na dobře osvětleném místě.',
        'Zaregistrujte výrobní číslo rámu a fotografie kola v databázi, například Bike Index nebo Project 529.',
      ],
    },
    'bike-radar-lights-comparison-2025': {
      title: 'Radarové svítilny 2025: srovnání 6 modelů a na co si dát pozor',
      teaser: 'Stručné srovnání cyklistických radarů podle dosahu detekce, svítivosti, výdrže baterie a bezpečnostních detailů.',
      points: [
        'Cyklistické radary varují před přibližujícími se vozidly na vzdálenost až asi 160 metrů.',
        'Model Coospo vyniká poměrem ceny a výkonu a výdrží baterie až 26 hodin.',
        'Zvažte hmotnost proti baterii: nejlehčí v testu, iGPSPORT SR Mini (49 g), se hodí na krátké vyjížďky (asi 7 hodin), nejsilnější světlo má Ravemen (80 lumenů).',
        'Používejte bezpečnostní šňůrku, aby svítilna nepropadla, když se na rozbité silnici uvolní držák.',
      ],
    },
  },
};
