# PM Master Specification & Domain Knowledge Base: bAIktime Hub

> **Source & Research Integration:** Grounded in NotebookLM domain source corpus (biomechanical studies, World Tour fit methodologies, Silca tire pressure models, M-Check inspection protocols).  
> **Target Platform:** bAIk / bAIktime Hub  
> **Architecture & UI Standard:** Next.js 16 (App Router), React 19, TypeScript, Google Material Design (zero decorative icons/emojis).

---

## 1. PRODUKTOVÁ VIZE, CÍLOVÉ PERSONY A LEAN CANVAS

### 1.1 Produktová Vize a Stratifikace Platformy

Digitální ekosystém **bAIktime Hub** vzniká jako odpověď na zásadní fragmentaci informací v oblasti cyklistického vybavení, biomechaniky a údržby. Většina jezdců tráví desítky hodin vyhledáváním protichůdných rad na internetu, což vede k chybnému nastavení kol, chronickým bolestem a neefektivním finančním investicím. bAIktime Hub funguje jako inteligentní produktový partner, který demokratizuje profesionální know-how z prostředí World Tour týmů a špičkových fit studií. Sjednocuje pokročilé datové modely s přístupným uživatelským rozhraním tak, aby běžný cyklista získal přesné, vědecky podložené odpovědi bez nutnosti dešifrovat nepřehledný inženýrský nebo fyzioterapeutický jargon.

Platforma bAIktime Hub stojí na trojroli integrovatelných modulů pokrývajících kompletní životní cyklus cyklisty i jeho stroje:

* **Digitální PM Partner (Produktový Manažer Cyklistické Cesty):** Správce tréninkové struktury, investičního plánování do vybavení a dlouhodobých cílů. Řídí logiku rozhodování na základě metodik Lean PM a prioritizačních rámců.
* **Personalizovaný Bike Fitter (Modul `bAIkfit`):** Biomechanický poradce využívající exaktní koordinátový systém, antropometrické měření (včetně akromiálního rozpětí) a symptomatickou diagnostiku k odstranění bolestí (brnění rukou, krční páteř, kolena).
* **Virtuální Mechanik (Modul `bAIkcare`):** Diagnostický průvodce preventivní údržbou, systematickými inspekcemi a ochranou komponent před degradačními vlivy prostředí i trenažérového potu.

#### Architektura Mezimodulového Datového Toku (Inter-Modal Data Flow)

Síla platformy spočívá v centrálním datovém profilu uživatele. Naměřené antropometrické hodnoty z modulu `bAIkfit` (hmotnost jezdce, celková hmotnost systému, délka klik, šířka postoje) automaticky napájejí výpočetní algoritmické kalkulátory v modulu `bAIkshop` (kalkulátor ideálního tlaku pneumatik dle Silca/SRAM parametrů) a nastavují dynamické servisní intervaly v modulu `bAIkcare` (přepočet opotřebení řetězu a plánování ochranných inspekcí proti potní korozi na základě týdenního objemu z jízdního modulu `bAIkride`).

```
 +-----------------------------------------------------------------------+
 |                        CENTRÁLNÍ UŽIVATELSKÝ PROFIL                   |
 |  Antropometrie | Hmotnost systému | XY Souřadnice | Typ provozu | Nájezd |
 +-----------------------------------------------------------------------+
        |                                |                                |
        v                                v                                v
+------------------+             +------------------+             +------------------+
|     bAIkfit      |             |     bAIkcare     |             |     bAIkshop     |
| Biomechanika Posedu|          | Údržba & M-Check |              | Tlaky & Upgrady  |
| - XY Koordináty  |------------>| - Servisní plán  |------------>| - Silca Tlaky    |
| - Akromion / Bar |  Profil     | - Degradace řetězu|   Doporučené| - ROI Matice     |
| - Stance / Kliky |  Data       | - Potní prevence |   Komponenty| - LBS / Gadgety  |
+------------------+             +------------------+             +------------------+
        ^                                                                  |
        |__________________________________________________________________|
                              bAIkride (Trénink & Nájezd)
```

#### Přehled Hodnotové Nabídky (Value Proposition)

| Oblast | Tradiční Stav / Problém | Hodnotová Nabídka bAIktime Hub |
| :--- | :--- | :--- |
| **Posed & Ergonomie** | Mýty o olovnici z kolena, odhadování výšky sedla od oka, generické šířky řídítek (42 cm). | Exaktní nastavení přes XY koordináty (vztažené k bottom bracket), měření přes akromion proces, cílená péče o nervové dráhy. |
| **Údržba & Servis** | Servisování den před závodním startem, chytré používání penetračních olejů (WD-40) na ložiska a brzdy. | Preventivní protokoly (metodika M-Check), kontrola opotřebení řetězu měrkou, ochrana před potním elektrochemickým článkem na trenažéru. |
| **Nákup & Upgrade** | Neefektivní útraty za keramická ložiska a karbonové kladky bez reálného přínosu pro rychlost či komfort. | Algoritmus High-ROI upgrade (pláště, kontaktní body, vložky), definování "Price Sweet Spotu" v rozmezí £1,000–£2,000. |
| **Jízdní Metodika** | Trvalá jízda ve vysoké intenzitě, zanedbávání pomalých technických dovedností, bonkování z podvýživy. | Polarizovaný tréninkový model 80/20, doplňování sacharidů každých 30 minut, systematický nácvik ovládání kola při nízkých rychlostech. |

---

### 1.2 Cílové Persony a Opportunity Solution Tree (OST)

#### Profilace Cílových Person

1. **Začátečník / Amatér (Persona A – "Hledající komfort"):**
   * *Profil:* Jezdec kupující své první silniční nebo endurance kolo (často velikost z druhé ruky nebo e-shopu bez fitu).
   * *Hlavní bolesti:* Nezažité řazení, brnění rukou po 45 minutách jízdy, strach z nášlapných pedálů, zmatení z tlaku v pneumatikách.
2. **Pokročilý Endurance Jezdec (Persona B – "Efektivní výkonnostní cyklista"):**
   * *Profil:* Jezdec absolvující 100+ km vyjížďky, gran fonda či trenažérové zimní bloky.
   * *Hlavní bolesti:* Bolesti krční páteře a trapézů po 2 hodinách na kole, korozivní poškození řídítek od potu na trenažéru, opotřebené kazety kvůli pozdní výměně řetězu, hledání marginálních zisků bez vyhazování peněz.
3. **Těžší / Specifický Jezdec (Persona C – "Rider vyšší hmotnosti či specifické morfologie"):**
   * *Profil:* Jezdec s vyšší trupovou hmotností, širším pánevním rozptylem nebo torakální kyfózou (zakřivením hrudní páteře).
   * *Hlavní bolesti:* Kolize břicha se stehny v horní úvrati šlapání (hip impingement), otlaky z příliš úzkých nebo širokých sedel, nadměrný tlak na dlaně způsobený gravitačním taháním trupu dopředu.

#### Opportunity Solution Tree (OST)

```
CÍL PLATFORMY: Bezbolestný, efektivní a ekonomicky optimální zážitek z cyklistiky
 ├── PŘÍLEŽITOST / PROBLÉM (Pain Point)
 │    ├── A. Brnění rukou & bolest krku (Ulnární nerv / Trapézy)
 │    │    ├── Doménové Řešení: Úprava šířky řídítek dle akromionu, narovnání zápěstí, redukce reach/drop.
 │    │    └── Produktová Funkce bAIktime Hub: [bAIkfit] Acromion-to-Bar Calculator & Nerve Flossing Guide.
 │    ├── B. Nestabilita pánve & bolest sedacích partií
 │    │    ├── Doménové Řešení: Výběr sedla s relief kanálkem (<145 mm), nastavení výšky dle paty/LeMond koeficientu, mikronastavení sklonu (0.5°–2°).
 │    │    └── Produktová Funkce bAIktime Hub: [bAIkfit] Pelvic Stability & Saddle Match Matrix.
 │    ├── C. Koroze a poškození komponent na trenažéru
 │    │    ├── Doménové Řešení: Ochrana před elektrolytickým potem, kontrola pod omotávkou, sušení vzduchem.
 │    │    └── Produktová Funkce bAIktime Hub: [bAIkcare] Indoor Sweat-Shield Alert & Maintenance Protocol.
 │    ├── D. Neefektivní investice do upgradu
 │    │    ├── Doménové Řešení: Prioritizace poddajných plášťů, správa tlaku, custom vložky do bot místo drahých ložisek.
 │    │    └── Produktová Funkce bAIktime Hub: [bAIkshop] Upgrade ROI Predictor & Pressure Calculator.
 │    └── E. Předčasné opotřebení pohonu (řetěz, kazeta)
 │         ├── Doménové Řešení: Pravidelné měření řetězovou měrkou (výměna při 0.5–0.75 %), přechod na vosk.
 │         └── Produktová Funkce bAIktime Hub: [bAIkcare] M-Check Tracker & Drivetrain Wear Monitor.
```

---

### 1.3 Lean Canvas a Prioritizační Rámec RICE (6D PM Framework)

#### Prioritizační Rámec RICE (Vývojová Prioritizace)

Vzorec: $\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$

| Modul / Funkce | Reach (1-10) | Impact (0.25-3) | Confidence (0.5-1.0) | Effort (PM) | RICE Skóre | Analytické Zdůvodnění ("So What?") |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`bAIkfit: XY Coordinate Calculator`** | 9 | 3.0 | 1.0 (100%) | 1.5 | **18.0** | **Kritická priorita #1.** Okamžitě řeší největší bolest (špatný posed). Umožňuje přenést posed na jakékoliv jiné kolo/trenažér s použitím jediného vztažného bodu (BB). |
| **`bAIkcare: M-Check Inspection Checklist`** | 8 | 2.0 | 0.9 (90%) | 0.8 | **18.0** | **Kritická priorita #1.** Extrémně nízké úsilí na vývoj s masivním preventivním dopadem. Zabraňuje haváriím a šetří tisíce za zničené komponenty. |
| **`bAIkfit: Cockpit & Acromion Evaluator`** | 7 | 2.0 | 0.8 (80%) | 1.0 | **11.2** | Vysoko prioritní modul. Eliminace mýtů o sériových 42cm řídítkách. Přímý dopad na brnění ulnárního nervu a bolesti krku. |
| **`bAIkshop: High-ROI Upgrade Matrix`** | 8 | 1.0 | 0.8 (80%) | 0.6 | **10.67** | Okamžitá monetizace přes affiliate. Chrání uživatele před nákupem nesmyslů (keramika) a směřuje investice do plášťů a kontaktních bodů. |
| **`bAIkfit: Heavy & Tall Rider Adapter`** | 4 | 2.5 | 0.9 (90%) | 1.0 | **9.0** | Specifický, ale vysoce loajální segment. Řeší kolize břicha (hip impingement), úpravu stance width a zkrácení klik na 150–165 mm. |
| **`bAIkride: Polarized 80/20 & Nutrition`** | 6 | 1.0 | 0.8 (80%) | 0.8 | **6.0** | Metodický tréninkový modul. Zabraňuje bonkování a přetrénování, posiluje správný příjem sacharidů (každých 30 min). |

---

## 2. DETAILNÍ FUNKČNÍ MODULY A ODBORNÉ POSTUPY (HOW-TO PROTOKOLY)

### 2.1 Modul `bAIkfit`: Ergonomie, Biomechanika a XY Koordinátový Systém

#### Šířka Řídítek & Akromion Proces
* 90 % mužů disponuje ramenním rozpětím mezi 39 cm a 41 cm a ženy mezi 32 cm a 38 cm. Sériová 42cm řídítka způsobují:
  1. *Vytáčení zápěstí (Wrist rolling)* -> lokální tlak na ulnární nerv.
  2. *Neuropatie a brnění dlaní* (malík a prsteník).
  3. *Vytáčení loktů (Flared elbows)* -> přetížení m. trapezius a m. rhomboideus -> ostrá bolest krční páteře a ramen po 1.5–2 h jízdy.
* *Korekční protokol:* Šířka řídítek musí přesně odpovídat strukturální šířce akromionů. Doporučena řídítka s kratším dosahem (reach cca 75 mm).

#### Nastavení a Výstřednost Sedla (Height & Tilt)
* *Výška sedla:* LeMond koeficient: $\text{Inseam (mm)} \times 0.883$ (nebo orientačně $\text{Inseam} - 12\text{ cm}$ po vršek sedla v ose sedlové trubky). Flexní úhel v koleni 30°–35°.
* *Sklon sedla (Tilt):* Většina moderních sedel je navržena pro rovinu. Akceptovatelný sklon dolů je max 0.5°–2° (nikdy ne >3°, což vytváří skluzavku a obrovský přítlak na dlaně).
* *Rozložení tlaku:* Anteriorní rotace pánve pro přenos váhy na sedací hrboly (*ischial tuberosities*) a stydkou kost (*pubic rami*).
* *Šířka sedla:* Pro 90 % jezdců je stropní hranicí šířka 145 mm (např. Selle Italia SLR Boost S3). Nezbytný středový relief kanálek.

#### Obuv, Vložky & Kufry
* ZÁKAZ zvětšování velikosti (sizing up) kvůli šířce.
* Tovární vložky ihned nahradit nízko-objemovými pevnými vložkami s podporou mediálního oblouku (např. Soul G8).
* Kufry posunout co nejvíce dozadu na podrážce (odlehčení předonoží) a nastavit maximální stranový float (Shimano žluté 6°, Look červené 9°, Speedplay).

#### XY Koordinátový Systém
* **Počáteční bod [0,0]:** Střed šlapacího středu (*Bottom Bracket Center*).
* **Zaměření sedla (Bod 70 mm):** Bod na sedle se šířkou 70 mm:
  * `Saddle X` (Setback): Horizontální vzdálenost od BB dozadu.
  * `Saddle Y` (Výška): Vertikální vzdálenost od BB nahoru.
* **Zaměření kokpitu:**
  * `Bar X` (Reach): Horizontální vzdálenost od BB dopředu ke středu objímky představce.
  * `Bar Y` (Stack): Vertikální vzdálenost od BB nahoru ke středu objímky představce.

#### Diagnostika Brnění Rukou & Nerve Flossing
* Cvik pro ulnární nerv: Ruka ve výši ramen, symbol "brýlí" (spojení ukazováčku a palce) k obličeji. Při pokrčení lokte náklon hlavy K ruce; při propínání paže náklon hlavy OD ruky. Dynamický plynulý skluz bez statického tahu (10–15 opakování).

#### Specifika pro Větší a Těžší Jezdce
* Zkrácení klik z 172.5–175 mm na 150–165 mm: otevírá kyčelní úhel a eliminuje kolizi břicha se stehnem (*hip impingement*).
* Rozšíření postoje (*Stance Width / Q-Factor*): podložky pod pedály 2–3 mm, posun kufrů na vnitřní okraj podrážky.

---

### 2.2 Modul `bAIkcare`: DIY Údržba, M-Check a Prevence Koroze

#### Express 5-minutový Čistící Protokol
1. Rám a kola shora dolů mýdlovou vodou / auto-šamponem.
2. Ráfky a pláště samostatnou houbou.
3. Pohon (kazeta, řetěz) speciálním odmašťovačem AŽ NAKONEC.
* *STRIKTNÍ ZÁKAZY:* Zákaz tlakového mytí (vytlačuje vazelínu z ložisek). Zákaz WD-40/GT85 na brzdy a ložiska (pouze isopropylalkohol na kotouče).

#### Inspekční Postup 'M-Check' (5 klíčových uzlů)
1. **Uzel 1:** Přední kolo & náboj (vůle, prořezy, kotouč/ráfek, osa).
2. **Uzel 2:** Hlavové složení & kokpit (vůle v ložiscích, momentový klíč na představci, omotávka).
3. **Uzel 3:** Středové složení & kliky (chod ložisek, dotažení převodníků a pedálů).
4. **Uzel 4:** Sedlovka & sedlo (utahovací moment objímky, mazání ližin sedla).
5. **Uzel 5:** Zadní kolo, kazeta & měnič (patka měniče, opotřebení řetězu měrkou).

#### Měření Opotřebení Řetězu & Vosk vs. Olej
* **0.5 %:** Okamžitá výměna řetězu pro 11s a 12s systémy (ochrání kazetu a převodníky).
* **0.75 %:** Hranice pro 8s–10s systémy; při překročení nutná výměna řetězu i kazety.
* Horký vosk / drip wax: nelepí prach, nulová abrazivní brusná pasta, prodloužení životnosti pohonu o stovky procent.

#### Ochrana před Potem z Trenažéru (Indoor Sweat Damage)
* Galvanická koroze hliníkových řídítek pod omotávkou elektrolytickým potem.
* Pravidelná výměna omotávky a sušení ložisek po indoor tréninku.

---

### 2.3 Modul `bAIkshop`: Smart Upgrade a Nákupní Matice

#### High-ROI vs. Low-ROI Upgrade Matice
* **High ROI:**
  1. Špičkové poddajné pláště (GP5000 / Corsa Pro).
  2. Optimalizace tlaku v pláštích (Silca/SRAM kalkulátor).
  3. Ergonomické kontaktní body a custom vložky (Soul G8).
  4. TPU duše / Tubeless konverze.
* **Low ROI (Předražené nesmysly s minimálním přínosem):**
  - Keramická ložiska (úspora 0.5–1 W).
  - Karbonové kladky měniče.
  - Elektronické řazení na nevhodně padnoucím rámu.
* **Price Sweet Spot:** £1,000–£2,000 (30,000–60,000 Kč) – vrchol křivky užitné hodnoty. Nad tuto částku platí zákon klesajících výnosů.
* **Bezpečnostní gadgety:** Radary (Garmin Varia, Kuspo TR70, Raveman) s detekcí vozidel na 140 m; skryté držáky AirTag/Find My (Raveman ABF1).

---

### 2.4 Modul `bAIkride`: Tréninková Metodika a Jízdní Technika

* **Polarizovaný trénink 80/20:** 80 % Zone 2 (konverzační aerobní vytrvalost), 20 % vysoká intenzita (VO2max, intervaly). Vyvarovat se neustálé jízdě v "šedé zóně".
* **Výživa & Hydratace:** Doplňování sacharidů každých 30 minut. Prevence bonkování (nárazu do zdi). Denní rozdělení: 60 % sacharidy, 20 % bílkoviny, 20 % zdravé tuky.
* **Jízdní technika:** Parkovišťové drily pomalé jízdy, včasné podřazování před křižovatkou, správný průjezd zatáčkou (vnější noha dole v poloze 6 h, vnitřní nahoře v poloze 12 h).

---

## 3. ANTIGRAVITY DATA SCHEMAS & COMPUTATIONAL CONTRACTS

### 3.1 Inter-Modal JSON Schema

```json
{
  "rider_profile": {
    "user_id": "usr_98412",
    "anthropometrics": {
      "weight_kg": 82.5,
      "system_weight_total_kg": 91.0,
      "inseam_mm": 840,
      "acromion_width_mm": 360,
      "foot_length_mm": 265,
      "foot_width_type": "wide_germanic"
    },
    "current_setup": {
      "crank_length_mm": 172.5,
      "saddle_width_mm": 152,
      "bar_width_mm": 420
    }
  },
  "xy_coordinates_output": {
    "datum_point": "Bottom Bracket (0,0)",
    "saddle_70mm_point": {
      "x_setback_mm": 210,
      "y_height_mm": 741.7
    },
    "handlebar_center": {
      "x_reach_mm": 480,
      "y_stack_mm": 610
    }
  },
  "intermodal_outputs": {
    "baikshop_pressure_calculator_inputs": {
      "system_weight_kg": 91.0,
      "recommended_tire_width_mm": 28
    },
    "baikcare_corrosion_alert_triggers": {
      "trainer_use": true,
      "sweat_check_interval_days": 90
    }
  }
}
```

### 3.2 Computational Rules Engine
* `Y_Saddle = inseam_mm * 0.883`
* `recommended_bar_width_mm = acromion_width_mm`
* `IF bar_width_mm > recommended_bar_width_mm + 20 -> FLAG_ULNAR_RISK`
* `IF chain_wear >= 0.5 AND chain_wear < 0.75 AND speed >= 11 -> REPLACE_CHAIN_ONLY`
* `IF chain_wear >= 0.75 -> REPLACE_CHAIN_AND_CASSETTE`
* `IF inseam_mm < 800 AND crank_length_mm > 170 -> RECOMMEND_SHORT_CRANKS(150-165)`
