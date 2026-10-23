import type { Translations } from '../types';

export const miniTests: Translations['miniTests'] = {
  title: 'Dva rychlé testy pohyblivosti',
  intro: 'Nepovinné. Každý trvá asi minutu a bAIk podle nich přizpůsobí cílovou polohu vašemu tělu.',
  optional: 'nepovinné',
  clear: 'Zrušit moji odpověď',
  hamstring: {
    title: 'Ohebnost hamstringů (zvedání propnuté nohy)',
    steps: [
      'Lehněte si na záda na podlahu s oběma nohama propnutýma.',
      'Poproste někoho, aby vám zvedl jednu propnutou nohu, nebo ji zvedněte sami s ručníkem kolem chodidla, dokud se koleno neprohne nebo se nenakloní pánev.',
      'Odhadněte úhel mezi zvednutou nohou a podlahou, nebo ho změřte vodováhou v telefonu.',
    ],
    question: 'Jak vysoko se vám propnutá noha zvedne?',
    options: {
      low: { title: 'Pod 60°', hint: 'Zkrácené hamstringy.', effect: 'Cílový stack řídítek zvedneme o {stack} mm (menší drop), aby se vám nekulatila dolní záda, a snižování řídítek nikdy nedoporučíme.' },
      medium: { title: '60° až 75°', hint: 'Průměrná ohebnost.', effect: 'Vaše cílová poloha se nemění.' },
      high: { title: 'Nad 75°', hint: 'Ohebné hamstringy.', effect: 'Vaše cílová poloha se nemění.' },
    },
    diagramLabel: 'Ilustrace jezdce ležícího na zádech s jednou propnutou nohou zvednutou; úhlové značky ukazují pod 60° jako nízkou ohebnost, 60° až 75° jako střední a nad 75° jako vysokou.',
    diagramCaption: 'Jezdec leží na zádech a zvedá jednu propnutou nohu. Pod 60° je nízká ohebnost, 60° až 75° střední, nad 75° vysoká. Popisky v obrázku jsou anglicky.',
  },
  release: {
    title: 'Test odlehčení rukou (rovnováha trupu)',
    steps: [
      'Sedněte na kolo na trenažéru nebo u zdi ve své obvyklé jezdecké poloze.',
      'Zvedněte dlaně asi 2 cm nad řídítka a držte je tam 3 sekundy, v tempu jízdy.',
      'Všimněte si, jestli přepadáte dopředu na řídítka, nebo držíte pozici trupem.',
    ],
    question: 'Co se stane, když ruce opustí řídítka?',
    options: {
      slumping: { title: 'Přepadávám dopředu', hint: 'Ruce nesou část vašeho trupu.', effect: 'Cílovou polohu sedla posuneme o {setback} mm dozadu, aby trup nesla pánev, a snižování řídítek nikdy nedoporučíme.' },
      stable: { title: 'Udržím pozici', hint: 'Trup nesete trupovým svalstvem.', effect: 'Vaše cílová poloha se nemění.' },
    },
    diagramLabel: 'Ilustrace jezdce na kole na trenažéru s rukama uvolněnýma 2 cm nad řídítky; šipky ukazují síly na sedlo a pedály a zapojený střed těla.',
    diagramCaption: 'Ruce se vznášejí 2 cm nad řídítky, zatímco trup drží střed těla. Šipky ukazují váhu na sedle a na pedálech. Popisky v obrázku jsou anglicky.',
  },
};
