import type { FinderParameterTexts } from '../types/finder';

/** Otázky vyhledávače kol (pořadí a možnosti jsou v `lib/finder/parameters.ts`). */
export const finderParameters: FinderParameterTexts = {
  road_type: { name: 'K čemu kolo bude', why: 'Určuje celý charakter rámu: klidný a stabilní, nebo nízký a rychlý.', options: { endurance: 'Dlouhé pohodlné vyjížďky (endurance)', allround: 'Od všeho trochu (univerzální)', race: 'Rychlá jízda a závody (race)', aero: 'Maximální rychlost po rovině (aero)' } },
  gravel_use: { name: 'K čemu kolo bude', why: 'Rychlý gravel na závody a naložené dobrodružné kolo jsou postavené úplně jinak.', options: { fast: 'Rychlé vyjížďky a gravelové závody', adventure: 'Dobrodružství a bikepacking se zavazadly', mixed: 'Smíšené použití: silnice, šotolina a každodenní jízda' } },
  mtb_type: { name: 'K čemu kolo bude', why: 'Rozhoduje o zdvihu, úhlu hlavy a o tom, jak vzpřímeně sedíte.', options: { xc_race: 'Cross-country závody (XC)', marathon: 'Dlouhé maratonské jízdy', trail: 'Trailová jízda a sjezdy' } },
  suspension: { name: 'Odpružení', why: 'Hardtail je lehčí a levnější, celoodpružené kolo je pohodlnější a rychlejší v hrubém terénu.', options: { hardtail: 'Hardtail (jen přední vidlice)', full: 'Celoodpružené', either: 'Obojí, poraďte mi' } },
  wheel_size: { name: 'Velikost kol', why: 'Mění to, jak se kolo valí a jak sedí menšímu nebo vyššímu jezdci.', options: { w29: '29 palců', w275: '27,5 palce', mullet: 'Mullet (vpředu 29, vzadu 27,5)', any: 'Bez preference' } },
  shifting: { name: 'Řazení', why: 'Elektronické řazení je přesné a nevyžaduje seřizování, mechanické je jednodušší a levnější na servis.', options: { mechanical: 'Mechanické (lanko)', electronic: 'Elektronické (Di2, AXS)', any: 'Bez preference' } },
  groupset_brand: { name: 'Značka sady', why: 'Dva velcí výrobci se liší pocitem i náhradními díly; kolo bývá postavené kolem jednoho z nich.', options: { shimano: 'Shimano', sram: 'SRAM', any: 'Bez preference' } },
  drivetrain: { name: 'Uspořádání převodů', why: 'Jeden převodník je jednodušší a tišší, dva dávají jemnější odstupňování.', options: { one_by: 'Jeden převodník (1x)', two_by: 'Dva převodníky (2x)', any: 'Bez preference' } },
  brakes: { name: 'Brzdy', why: 'Hydraulické kotoučové brzdí nejlépe a vyžadují malou sílu, mechanické se snáz opraví na cestě.', options: { hydraulic_disc: 'Hydraulické kotoučové', mechanical_disc: 'Mechanické kotoučové', any: 'Bez preference' } },
  material: { name: 'Materiál rámu', why: 'Karbon je lehký a tlumí vibrace, hliník má nejlepší poměr ceny a výkonu, ocel a titan vydrží nejdéle.', options: { carbon: 'Karbon', aluminium: 'Hliník', steel_titanium: 'Ocel nebo titan', any: 'Bez preference' } },
  wheels: { name: 'Kola', why: 'Vyšší karbonové ráfky jsou rychlejší a tužší, ale v bočním větru těžší na ovládání a dražší.', options: { alloy: 'Hliníkové ráfky', carbon_mid: 'Karbon, střední profil', carbon_deep: 'Karbon, vysoký profil (aero)', any: 'Bez preference' } },
  tyres_road: { name: 'Šířka pláště, která se vejde', why: 'Širší pláště s nižším tlakem dávají pohodlí a přilnavost na špatných silnicích.', options: { up_to_28: 'Do 28 mm', c30_32: '30 až 32 mm', c35_plus: '35 mm a širší' } },
  tyres_gravel: { name: 'Šířka pláště, která se vejde', why: 'Širší pláště dávají přilnavost a pohodlí na sypkém povrchu, užší se valí rychleji.', options: { c40: 'Do 40 mm', c45: 'Do 45 mm', c50_plus: '50 mm a širší' } },
  mounts: { name: 'Úchyty na výbavu', why: 'Brašny, blatníky a nosiče potřebují závitové úchyty na rámu a vidlici.', options: { bags: 'Brašny na rám a horní trubku', fenders: 'Blatníky', rack: 'Nosiče', none: 'Nic z toho nepotřebuji' } },
  dropper: { name: 'Teleskopická sedlovka', why: 'Teleskopická sedlovka snižuje sedlo při sjezdu; nejvíc záleží u trailového kola.', options: { yes: 'Ano, musí ji mít', no: 'Ne', any: 'Bez preference' } },
  budget: { name: 'Rozpočet', why: 'Rozhoduje o úrovni dílů; velikost rámu na něm nezávisí.', options: { entry: 'Do 40 000 Kč', mid: '40 000 až 80 000 Kč', high: '80 000 až 130 000 Kč', top: 'Nad 130 000 Kč', open: 'Bez omezení' } },
  colour: { name: 'Barva', why: 'Je to jen přání; nikdy nemění velikost ani verdikt sedí/nesedí.', options: {} },
  brands_preferred: { name: 'Značky, které se vám líbí', why: 'Značky, kterým věříte nebo je chcete vidět jako první, oddělené čárkami.', options: {} },
  brands_excluded: { name: 'Značky, které vynechat', why: 'Značky, které se nesmí doporučit, oddělené čárkami.', options: {} },
};
