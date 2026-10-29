import type { Translations } from '../types';

export const wheels: Translations['wheels'] = {
  title: 'Kola a pláště',
  intro: 'Pláště jsou jediné, co vás spojuje se silnicí. Držte tmel čerstvý, tlak správný a vězte, co dělat při defektu.',
  back: 'Zpět ke kolům a plášťům',
  setup: { label: 'Systém plášťů', tube: 'S duší', tubeless: 'Tubeless' },
  sealant: {
    title: 'Tubeless tmel',
    dateLabel: 'Tmel doplněn dne',
    hint: 'Tmel časem zaschne v gumové kuličky. Doplňujte ho každé 3 až 6 měsíců.',
    unknown: 'Zadejte den, kdy byl tmel naposledy doplněn, ať se dá spočítat 3 až 6 měsíců.',
    fresh: 'Tmel je mladší než 3 měsíce. Zatím není co dělat.',
    topUp: 'Tmel je starý 3 až 6 měsíců: doplňte ho teď. Návod na defekt ukáže jak.',
    overdue: 'Tmel je starší než 6 měsíců. Ihned ho doplňte a zkontrolujte, zda nezaschl v kuličky.',
    off: 'Pláště s duší tmel nepotřebují.',
    window: 'Okno pro doplnění: {from} až {until}',
  },
  pressure: {
    title: 'Tlak v plášti',
    intro: 'Orientace podle druhu kola a vaší hmotnosti. Meze vytištěné na plášti a na ráfku mají vždy přednost.',
    reference: 'Referenční plášť: {tyre}',
    categories: { road: 'silnice, 28 mm', gravel: 'gravel, 40 mm', mtb: 'horské kolo, 2,4"' },
    range: 'Obvyklý rozsah: {min} až {max} bar',
    yours: 'Pro {kg} kg: asi {bar} bar',
    weightNote: 'Hmotnost se bere z vašeho profilu. Těžší jezdci jdou k hornímu konci rozsahu, lehčí k dolnímu.',
    otherWidth: 'U jiné šířky vyjděte z tlaku na boku pláště nebo z tabulky výrobce. Širší plášť snese menší tlak.',
  },
  wear: {
    title: 'Opotřebení a poškození',
    intro: 'Prohlédněte oba pláště a oba ráfky. Při zjištění níže je nutná výměna dílu.',
    items: [
      { title: 'Běhoun', body: 'Hledejte indikátory opotřebení běhounu (TWI), malé značky v dezénu. Když je dezén sjetý na ně, plášť vyměňte. Vyjměte zabodnuté křemeny a sklo.' },
      { title: 'Kostra a bok pláště', body: 'Praskliny v boku, prořezy až na kostru, vybouleniny nebo viditelná vlákna znamenají, že plášť musí pryč.' },
      { title: 'Opotřebení ráfku', body: 'U ráfkových brzd sledujte indikační drážku na boku ráfku. Pokud je bok ráfku prohnutý (vydutý dovnitř), ráfek ihned vyměňte.' },
      { title: 'Páska v ráfku', body: 'Páska musí být uprostřed, rovná, celá a zakrývat každou dírku po špici. Jak ji zkontrolovat, ukazuje návod na defekt.' },
    ],
  },
  flat: {
    title: 'Návod na defekt',
    intro: 'Pět prací při defektu, od cesty po dílnu.',
    open: 'Otevřít návod na defekt',
    openHint: 'Výměna nebo lepení duše, knotování tubeless pláště, doplnění tmelu, kontrola pásky v ráfku.',
    pick: 'Co chcete dělat?',
    backToList: 'Zpět na seznam prací',
    scenarios: {
      tube: {
        name: 'Výměna duše',
        summary: 'Jistá oprava na cestě: nová duše.',
        diagramLabel: 'Řez pláštěm na ráfku s duší, ventilkem a montpákou',
        steps: [
          { title: '1. Najděte příčinu', body: 'Nová duše zase sfoukne, pokud příčina zůstala v plášti.', points: ['Vyjměte kolo a vypusťte zbytek vzduchu.', 'Opatrně projeďte prsty po vnitřku pláště a hledejte trn, sklo nebo drát.', 'Podívejte se, kde je díra v duši, a zkontrolujte stejné místo na plášti.'], warning: 'Prsty veďte pomalu: sklo řeže.' },
          { title: '2. Sundejte plášť a duši', body: 'Nejdřív vytvořte vůli, potom přepáčte patku přes ráfek.', points: ['Zatlačte patku pláště dokola do středního žlábku ráfku.', 'Podhákněte montpáku pod patku a postupujte kolem ráfku. Druhá montpáka pomůže.', 'Vytáhněte duši a vyjměte ventilek z otvoru.'] },
          { title: '3. Zkontrolujte plášť a pásku v ráfku', body: 'Podívejte se, než cokoli vrátíte.', points: ['Znovu prohlédněte vnitřek pláště, zda v něm nic ostrého nezbylo.', 'Páska v ráfku zakrývá každou dírku po špici a leží uprostřed ráfku.', 'Má-li plášť prořez až na kostru, vyměňte ho.'] },
          { title: '4. Vložte novou duši', body: 'Dávejte pozor, aby duše nezůstala pod patkou.', points: ['Novou duši nafoukněte jen tolik, aby držela tvar.', 'Provlékněte ventilek otvorem a patku zatlačte zpět rukou, začněte u ventilku.', 'Ověřte, že duše není skřípnutá pod patkou, a nafoukněte na tlak z karty.', 'Zkontrolujte, že plášť sedí na ráfku rovnoměrně na obou stranách.'], warning: 'Poslední kus patky nenasazujte montpákami: můžete duši skřípnout.' },
        ],
      },
      patch: {
        name: 'Lepení duše (záplata)',
        summary: 'Oprava malé díry v duši.',
        diagramLabel: 'Duše s dírou a přitlačenou záplatou',
        steps: [
          { title: '1. Najděte díru', body: 'Co nenajdete, to nezalepíte.', points: ['Duši nafoukněte a držte u ucha, nebo ji ponořte do vody, a najděte únik.', 'Místo označte a vypusťte vzduch.', 'Zjistěte, co udělalo díru v plášti (viz první krok výměny duše).'] },
          { title: '2. Připravte duši', body: 'Záplata drží jen na čistém, zdrsněném a suchém povrchu.', points: ['Okolí díry zdrsněte brusným papírem ze sady.', 'Setřete prach.', 'Naneste tenkou vrstvu lepidla o málo širší než záplata.', 'Počkejte, až je lepidlo na dotek suché.'], warning: 'Záplata se nepřilepí na mokré lepidlo ani na zaprášenou duši.' },
          { title: '3. Přitlačte záplatu', body: 'Nedotýkejte se lepivé strany.', points: ['Stáhněte ze záplaty krycí fólii a nedotýkejte se lepivé strany.', 'Pevně ji přitlačte na lepidlo, od středu ven.', 'Držte ji přitlačenou delší dobu a zkontrolujte okraje, zda nemají bublinky.'] },
          { title: '4. Vložte zpět a vyzkoušejte', body: 'Zalepená duše je oprava, ne nová duše.', points: ['Duši trochu nafoukněte a zkontrolujte, že záplata drží.', 'Vložte duši jako při výměně a nafoukněte na tlak z karty.', 'Po chvíli plášť zkontrolujte a při povolení záplaty brzy vyměňte duši.'] },
        ],
      },
      plug: {
        name: 'Knotování tubeless pláště',
        summary: 'Zavření vpichu v běhounu bez sundání pláště.',
        diagramLabel: 'Řez tubeless pláštěm s tmelem a knotem skrz běhoun',
        steps: [
          { title: '1. Najděte díru', body: 'Malou díru často zavře sám tmel.', points: ['Otočte kolo tak, aby díra byla dole, kde je tmel, a dejte mu chvilku.', 'Pokud vzduch stále uniká, nastříkejte plášť mýdlovou vodou a díru najděte.', 'Kleštěmi vytáhněte trn nebo sklo.'], warning: 'Knot je jen pro malou díru v běhounu. Říznutí v boku pláště vyžaduje nový plášť nebo duši.' },
          { title: '2. Zaveďte knot', body: 'Jedno plynulé zasunutí zavaděčem.', points: ['Navlékněte knot do ouška zavaděče.', 'Zasuňte zavaděč do díry jedním plynulým pohybem a konce knotu nechte venku.', 'Vytáhněte zavaděč a knot nechte v plášti.'] },
          { title: '3. Zastřihněte a nafoukněte', body: 'Zbytek udělá tmel.', points: ['Konce knotu odřízněte u běhounu.', 'Nafoukněte plášť na tlak z karty.', 'Kolem roztočte, ať se tmel rozloží přes knot.'] },
          { title: '4. Zkontrolujte', body: 'Knot se musí osvědčit.', points: ['Knot nastříkejte mýdlovou vodou a hledejte bublinky.', 'Zpočátku jeďte opatrně a znovu zkontrolujte tlak.', 'Pokud stále uniká, vložte duši a plášť doma vyměňte.'] },
        ],
      },
      sealant: {
        name: 'Doleití tmelu',
        summary: 'U tubeless pláště každé 3 až 6 měsíců.',
        diagramLabel: 'Řez tubeless pláštěm s tmelem dole a lahvičkou u ventilku',
        steps: [
          { title: '1. Zkontrolujte datum', body: 'Tmel zaschne v gumové kuličky a pak už nic neutěsní.', points: ['Podívejte se na datum na kartě kol a plášťů: doplňujte každé 3 až 6 měsíců.', 'Lahvičku s tmelem dobře protřepejte.', 'Použijte množství z lahvičky pro velikost svého pláště.'] },
          { title: '2. Vypusťte vzduch', body: 'Ventilek musí být nahoře.', points: ['Otočte kolo tak, aby ventilek byl nahoře.', 'Vypusťte všechen vzduch a vyšroubujte vložku ventilku nástrojem na vložky.', 'Pokud vložku nejde vyjmout, uvolněte patku pláště na jedné straně a tmel nalijte tudy.'] },
          { title: '3. Přidejte tmel', body: 'Nalijte nebo vstříkněte ho ventilkem.', points: ['Připojte lahvičku nebo stříkačku na ventilek.', 'Vstříkněte množství z lahvičky.', 'Uvidíte-li uvnitř staré suché kuličky latexu, vytáhněte je.'] },
          { title: '4. Nafoukněte a rozetřete', body: 'Tmel musí pokrýt celý plášť.', points: ['Vraťte vložku ventilku a nafoukněte na tlak z karty.', 'Kolem natáčejte do všech směrů, ať tmel pokryje vnitřek.', 'Dnešní den zapište jako nové datum na kartě kol a plášťů.'] },
        ],
      },
      tape: {
        name: 'Kontrola pásky v ráfku',
        summary: 'Posunutá páska řeže duše a tubeless plášť přestane těsnit.',
        diagramLabel: 'Řez ráfkem s páskou v ráfku a vyznačenými dírkami po špicích',
        steps: [
          { title: '1. Proč na tom záleží', body: 'Páska chrání duši nebo utěsňuje ráfek.', points: ['Páska zakrývá dírky po špicích v ráfku.', 'Díra v pásce nechá duši vtlačit do dírky po špici a prasknout, nebo pustí vzduch z tubeless pláště.'] },
          { title: '2. Prohlédněte pásku', body: 'Sundejte plášť a duši z jedné strany.', points: ['Páska leží uprostřed ráfku, je rovná a zakrývá každou dírku po špici.', 'Hledejte trhliny, zvednuté okraje a díry.', 'U tubeless ráfku musí být páska vzduchotěsná.'] },
          { title: '3. Opravte nebo vyměňte', body: 'Posunuté pásce nevěřte.', points: ['Pokud se páska posunula, přitlačte ji zpět nebo ji vyměňte.', 'Před novou páskou očistěte lože ráfku.', 'Použijte pásku šířky, která sedí vašemu ráfku.'] },
          { title: '4. Vraťte vše zpět', body: 'Dokončete práci pořádně.', points: ['Vložte duši nebo tubeless plášť jako u ostatních prací.', 'Nafoukněte a zkontrolujte, že plášť sedí rovnoměrně.'] },
        ],
      },
    },
  },
};
