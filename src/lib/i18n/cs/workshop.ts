import type { Translations } from '../types';

export const workshop: Translations['workshop'] = {
  title: 'Dílna',
  intro: 'Popište, co kolo dělá, a dílna vás nasměruje na správnou kontrolu nebo návod. Nespěchejte: brzdy a řazení stojí za to udělat pořádně.',
  back: 'Zpět do dílny',
  next: 'Další krok',
  previous: 'Předchozí krok',
  finish: 'Hotovo',
  stepOf: 'Krok {n} z {total}',
  troubleshooter: {
    title: 'Co kolo dělá?',
    intro: 'Vyberte příznak, který sedí nejlépe.',
    groups: { drivetrain: 'Pohon a řazení', brakes: 'Brzdy', movement: 'Pohyblivé části' },
    symptoms: {
      chainSkips: {
        label: 'Řetěz přeskakuje nebo neřadí plynule',
        cause: 'Nejčastěji opotřebený řetěz, natažené nebo suché lanko, nebo špatně seřízená přehazovačka.',
        checks: ['Nejdřív změřte opotřebení řetězu: opotřebený řetěz pod zátěží přeskakuje.', 'Podívejte se na lanko, zda nerezaví a není zalomené, a zkontrolujte řadicí páku a přehazovačku, zda nejsou zanesené.', 'Je-li řetěz v pořádku, seřiďte indexaci zadní přehazovačky.'],
      },
      chainDrops: {
        label: 'Řetěz padá za kazetu nebo do rámu',
        cause: 'Limitní šrouby zadní přehazovačky jsou nastavené příliš široce, nebo je ohnutá patka přehazovačky.',
        checks: ['Podívejte se zezadu: patka musí být rovná a přehazovačka rovnoběžná s kolem.', 'Nastavte limitní šrouby tak, aby řetěz nemohl přejet přes nejmenší ani největší pastorek.', 'Zkontrolujte i opotřebení řetězu.'],
      },
      noisyDrive: {
        label: 'Hlučný chod pohonu',
        cause: 'Suchý nebo špinavý řetěz, opotřebený řetěz, nebo lehce rozladěná přehazovačka.',
        checks: ['Řetěz vyčistěte a namažte, přebytečný olej otřete.', 'Zkontrolujte opotřebení řetězu.', 'Pokud hluk vzniká jen v některých rychlostech, doladěte indexaci.'],
      },
      spongyLever: {
        label: 'Brzdová páka je měkká nebo propadá k řídítkům',
        cause: 'Vzduch v hydraulickém okruhu, nebo destičky a pístky, které potřebují servis.',
        checks: ['Stiskněte páku na stojícím kole: měkká páka, která pomalu klesá, ukazuje na vzduch v okruhu.', 'Hledejte olej na hadičce, páce a třmenu.', 'Obvykle pomůže brzdu odvzdušnit.'],
      },
      rotorRub: {
        label: 'Kotouč píská nebo škrtá o destičky',
        cause: 'Necentrovaný třmen, lehce ohnutý kotouč, nebo znečištěný kotouč.',
        checks: ['Roztočte kolo a poslouchejte, kde to škrtá: jedno místo znamená ohnutý kotouč, stálé škrtání znamená třmen.', 'Vycentrujte třmen nad kotoučem.', 'Pokud kotouč píská, otřete ho isopropylalkoholem o čistotě 99 %.'],
      },
      weakBraking: {
        label: 'Slabý brzdný účinek',
        cause: 'Opotřebené nebo znečištěné destičky, špinavý kotouč, nebo vzduch v okruhu.',
        checks: ['Zkontrolujte brzdovou směs v uzlu 1 M-Checku.', 'Hledejte olej nebo mazivo na kotouči a destičkách.', 'Je-li páka zároveň měkká, brzdu odvzdušněte.'],
      },
      playLooseness: {
        label: 'Vůle v hlavovém složení nebo v nábojích',
        cause: 'Uvolněné předpětí hlavového složení, nebo opotřebená či uvolněná ložiska nábojů.',
        checks: ['Držte přední brzdu a kolem kývejte tam a zpět: klepání v hlavovém složení znamená vůli.', 'Chyťte kolo nahoře a zatřeste jím do stran, abyste ucítili náboj.', 'Projděte příslušný uzel M-Checku.'],
      },
      bottomBracketCreak: {
        label: 'Vrzání v oblasti středu',
        cause: 'Uvolněné šrouby klik, suché závity pedálů nebo střed, který potřebuje servis.',
        checks: ['Zkontrolujte kliky, zda nemají vůli, a závity pedálů, zda jsou namazané.', 'Projděte uzel 3 M-Checku.'],
      },
    },
    causeTitle: 'Pravděpodobná příčina',
    checksTitle: 'Nejdřív se podívejte',
    nextTitle: 'Co dál',
    wizardNames: { bleed: 'Návod: odvzdušnění hydraulických brzd', derailleur: 'Návod: seřízení zadní přehazovačky', rotor: 'Návod: centrování třmenu a rovnání kotouče' },
    openGuide: 'Otevřít návod',
    openNode: 'Otevřít uzel {n} M-Checku',
    goToChain: 'Přejít na měřidlo řetězu',
  },
  bleed: {
    title: 'Odvzdušnění hydraulických brzd',
    intro: 'Pečlivá práce na klidnou hodinu. Pokud si v kterémkoli bodě nejste jistí, přestaňte a odvezte kolo do servisu.',
    diagramLabel: 'Brzdová páka, hadička a třmen se stříkačkou na třmenu a nálevkou na páce',
    fluidRule: 'Vždy zkontrolujte nápis vyražený na víčku nádobky nebo na páce (Mineral Oil, nebo DOT), než cokoli otevřete.',
    fluidQuestion: 'Jakou kapalinu vaše brzda používá?',
    fluidExamples: 'Značky jsou jen orientační příklady, nikdy ne důkaz: přečtěte si víčko nebo návod.',
    fluids: {
      mineral: { name: 'Minerální olej', brands: 'například Shimano, Magura, TRP' },
      dot: { name: 'Kapalina DOT 4 / 5.1', brands: 'například SRAM, Hope, Hayes' },
    },
    mixWarning: 'Nikdy nemíchejte kapalinu DOT s minerálním olejem. Těsnění se zničí a brzda selže.',
    chosen: 'Vaše kapalina: {fluid}',
    needFluid: 'Pro pokračování vyberte kapalinu.',
    manual: 'Přesnou sadu a množství najdete v návodu své brzdy. Je-li cokoli nejasné, jeďte do servisu.',
    steps: [
      {
        title: '1. Poznejte svou kapalinu',
        body: 'Obě kapaliny vypadají podobně a nesmí se míchat.',
        points: ['Přečtěte si nápis na víčku nádobky nebo na páce.', 'Používejte jen kapalinu a odvzdušňovací sadu určenou pro danou brzdu.'],
        warning: 'Smíchání kapalin zničí těsnění.',
      },
      {
        title: '2. Připravte se a chraňte se',
        body: 'Brzdová kapalina dráždí kůži a oči a poškozuje lak.',
        points: ['Nasaďte nitrilové rukavice a ochranné brýle.', 'Připravte si hadr, odvzdušňovací sadu a isopropylalkohol (IPA 99 %).', 'Kolo pevně podržte, páku mějte ve stejné výšce jako třmen.'],
      },
      {
        title: '3. Destičky ven, blokátor pístků dovnitř',
        body: 'Olej na destičkách znamená žádnou brzdu, proto destičky odcházejí dřív, než přijde kapalina.',
        points: ['Vyjměte kolo a brzdové destičky.', 'Uložte destičky daleko od kapaliny na čisté místo.', 'Mezi pístky třmenu vložte plastový blokátor pístků.'],
        warning: 'Nikdy nemačkejte páku, když jsou destičky venku a blokátor není vložený.',
      },
      {
        title: '4. Plňte zespodu nahoru',
        body: 'Kapalina vstupuje u třmenu a stoupá k páce, takže vzduch se vytlačí nahoře.',
        points: ['Připojte stříkačku na třmen a nálevku na páku.', 'Pomalu protlačujte kapalinu okruhem, dokud z nálevky nepřestanou unikat bublinky.', 'Lehce poklepejte na hadičku a páku, ať se bublinky uvolní.', 'Uzavřete páku, pak třmen a otřete každou kapku.'],
      },
      {
        title: '5. Očistěte a vyzkoušejte',
        body: 'Každá stopa kapaliny musí zmizet dřív, než se vrátí destičky.',
        points: ['Třmen a kotouč očistěte isopropylalkoholem o čistotě 99 %.', 'Vyjměte blokátor, vložte čisté destičky a kolo.', 'Stiskněte páku: před jízdou musí být pevná. Nejdřív zkoušejte na klidné cestě.'],
        warning: 'Je-li páka stále měkká, nejezděte. Odvzdušněte znovu nebo jeďte do servisu.',
      },
    ],
  },
  derailleur: {
    title: 'Seřízení zadní přehazovačky',
    intro: 'Čtyři kroky od rámu ke kazetě. Dělejte je v tomto pořadí, každý krok stojí na tom předchozím.',
    diagramLabel: 'Boční pohled na zadní přehazovačku a kazetu s vyznačenou částí aktuálního kroku',
    steps: [
      {
        title: '1. Zkontrolujte patku a lanko',
        body: 'Ohnutou patku ani zadřené lanko žádný šroub nespraví.',
        points: ['Podívejte se zezadu: patka je kolmá k rovině kola a klec přehazovačky visí rovně.', 'Šroub přehazovačky je dotažený na 9 Nm.', 'Zatím uvolněte napnutí lanka a zkontrolujte lanko a bowden, zda nerezaví a nejsou zalomené.'],
        warning: 'Viditelně ohnutá patka potřebuje rovnací přípravek nebo výměnu, ne odhad.',
      },
      {
        title: '2. Nastavte limitní šrouby H a L',
        body: 'Limity drží řetěz na kazetě.',
        points: ['H zastaví přehazovačku u nejmenšího pastorku, aby řetěz nespadl směrem k rámu.', 'L ji zastaví u největšího pastorku, aby řetěz nespadl do drátů.', 'Šroubem otáčejte po malých krocích a zkoušejte přehazovačku tlačit rukou.'],
        warning: 'Limitní šroub L musí vždy zabránit tomu, aby přehazovačka vjela do drátů.',
      },
      {
        title: '3. Indexace řazení stavěcím šroubem',
        body: 'Stavěcí šroub (barrel adjuster) jemně dolaďuje napnutí lanka.',
        points: ['Připojte lanko s řadicí pákou na nejmenším pastorku a stavěcím šroubem téměř zašroubovaným.', 'Řaďte nahoru i dolů přes všechny rychlosti a poslouchejte, zda řazení nezaváhá.', 'Stavěcím šroubem otáčejte po čtvrt otáčce a po každé řaďte znovu.'],
      },
      {
        title: '4. Nastavte B-gap',
        body: 'B-gap je vzdálenost mezi horní kladkou a pastorkem.',
        points: ['Přeřaďte na největší pastorek a podívejte se na mezeru mezi kladkou a pastorkem.', 'Šroubem B otáčejte, dokud mezera neodpovídá návodu vaší přehazovačky.', 'Ještě jednou přeřaďte všechny rychlosti a skončete krátkou zkušební jízdou.'],
      },
    ],
  },
  rotor: {
    title: 'Centrování třmenu a rovnání kotouče',
    intro: 'Většinu škrtání spraví vycentrování třmenu. Ohnutý kotouč chce trochu víc trpělivosti.',
    diagramLabel: 'Třmen nad kotoučem s destičkami, upevňovacími šrouby a pákou, s vyznačenou částí aktuálního kroku',
    steps: [
      {
        title: '1. Uvolněte šrouby třmenu',
        body: 'Třmen se musí dát posunout do stran.',
        points: ['Roztočte kolo a zjistěte, zda škrtá stále, nebo jen na jednom místě.', 'Povolte dva upevňovací šrouby třmenu jen tolik, aby se třmen dal posunout rukou.'],
      },
      {
        title: '2. Stiskněte páku a držte ji',
        body: 'Po stisknutí páky destičky vycentrují třmen na kotouč.',
        points: ['Pevně stiskněte brzdovou páku a držte ji.', 'Nepouštějte ji, dokud nejsou šrouby dotažené.'],
      },
      {
        title: '3. Dotáhněte na 6 Nm',
        body: 'Šrouby utahujte střídavě po malých krocích, zatímco páku držíte.',
        points: ['Oba šrouby dotáhněte momentovým klíčem na 6 Nm.', 'Zkontrolujte hodnotu vyraženou na třmenu nebo v jeho návodu.', 'Uvolněte páku a roztočte kolo.'],
        warning: 'Šrouby nepřetahujte: stržený závit je drahá oprava.',
      },
      {
        title: '4. Narovnejte místní ohyb',
        body: 'Pokud stále škrtá jedno místo, je kotouč na něm ohnutý.',
        points: ['Místo najdete pomalým otáčením kola a sledováním mezery.', 'Rovnací vidlici nasaďte na kotouč v místě ohybu a velmi jemně ho vraťte zpět.', 'Znovu roztočte kolo a opakujte po malých pohybech.', 'Pokud kotouč nelze srovnat, vyměňte ho.'],
        warning: 'Kotouč potom otřete isopropylalkoholem o čistotě 99 %. V blízkosti brzd nikdy nepoužívejte WD-40 ani GT-85.',
      },
    ],
  },
};
