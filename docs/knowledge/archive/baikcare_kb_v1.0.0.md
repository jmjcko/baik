# bAIkcare Workshop — Domain Knowledge Base & Maintenance Protocol (v1.0.0)

> **System Component:** `bAIkcare` (Universal Bike Maintenance, Diagnostic Protocols & Wear Monitoring Engine)  
> **Target Consumer:** Antigravity AI Agent / AIRE Framework (`docs/requirements.md`, `src/app/actions/`, `src/lib/kbLoader.ts`)  
> **Source Grounding:** Professional Mechanic Transcripts, Manufacturer Service Manuals, Silca Drivetrain Optimization Research  
> **Compliance & Style:** ZERO Emojis or Decorative Icons (Typography-Driven Hierarchy), 100% Bilingual Parity (EN / CZ)  

---

## 1. The 5-Node M-Check Inspection Protocol

### 1.1 Biomechanical & Safety Rationale
The M-Check is the universal mechanical safety audit protocol. Tracing the shape of a capital letter 'M' across the bicycle frame ensures that 100% of safety-critical structural nodes are inspected systematically in under 3 minutes without omitting any component.

### 1.2 Inspection Path & Diagnostic Nodes

```
      [Node 2: Cockpit / Headset]           [Node 4: Seatpost / Saddle]
                 /\                                     /\
                /  \                                   /  \
               /    \                                 /    \
  [Node 1: Front     \         [Node 3: Bottom       /      [Node 5: Rear Wheel,
   Wheel / Hub]       \-------- Bracket / Cranks]---/        Cassette & Derailleur]
```

#### Node 1: Front Wheel, Hub & Brake Assembly (Node 1 / 5)
* **EN Check Items:**
  1. Wheel retention: Verify thru-axle (12/15mm) is torqued to 9–12 Nm or quick-release skewer is securely clamped.
  2. Bearing play: Grab tire top and rock laterally; zero play or knocking permitted.
  3. Rim & Tire: Inspect tire tread for embedded glass, cuts down to casing, and casing bulges. Check rim true (<1mm lateral runout).
  4. Disc Brake: Verify rotor bolts torqued to 4–6 Nm (or centerlock lockring to 40 Nm). Inspect brake pad thickness (>1.0mm pad material required; replace at <0.5mm).
* **CZ Položky Kontroly:**
  1. Upevnění kola: Ověřte dotažení pevné osy (12/15 mm) na 9–12 Nm nebo správné předepnutí rychloupínáku.
  2. Vůle v náboji: Uchopte plášť nahoře a zahýbejte do stran; nesmí se projevit žádná vůle ani cvakání.
  3. Ráfek a plášť: Prohlédněte běhoun na přítomnost skla, hluboké prořezy a vybouleniny kordu. Zkontrolujte házivost (<1 mm).
  4. Kotoučová brzda: Prověřte dotažení kotouče na 4–6 Nm (centerlock na 40 Nm). Tloušťka brzdové směsi musí být >1,0 mm (výměna při <0,5 mm).

#### Node 2: Headset, Fork & Cockpit (Node 2 / 5)
* **EN Check Items:**
  1. Headset preload: Hold front brake locked and rock handlebars back and forth; feel for play at upper and lower headset bearing cups.
  2. Steering smoothness: Lift front wheel off floor and swing handlebars side to side; check for indexing/notching (brinelling) or cable binding.
  3. Stem & Handlebar torque: Check 4 faceplate bolts and 2 steerer clamp bolts with a calibrated torque wrench (typically 4–6 Nm, alternating criss-cross).
  4. Shifter controls: Ensure hoods are firmly clamped and cannot twist under emergency braking load.
* **CZ Položky Kontroly:**
  1. Předpětí hlavového složení: Zabrzděte přední brzdu a zapružte kolem dopředu/dozadu; zkontrolujte vůli v horní i dolní misce ložiska.
  2. Hladkost řízení: Zvedněte přední kolo a otočte řídítky do stran; zkontrolujte zadrhávání ložisek (vymačkání misek) a odpor bowdenů.
  3. Utahovací momenty kokpitu: Ověřte dotažení 4 šroubů čela představce a 2 šroubů sloupku vidlice momentovým klíčem (typicky 4–6 Nm křížem).
  4. Páky a omotávka: Ověřte, že se těla pák při silném stisku nepootočí na řídítkách.

#### Node 3: Bottom Bracket, Chainset & Pedals (Node 3 / 5)
* **EN Check Items:**
  1. Bottom Bracket bearings: Drop chain off inner chainring; spin crankarms by hand; verify silky smooth rotation without crunching or drag.
  2. Crankarm retention: Pull and push crankarms laterally toward frame; zero axial play allowed. Verify pinch bolts (e.g. Shimano Hollowtech II 12–14 Nm alternating).
  3. Chainring bolts: Verify tightness of 4 or 5 chainring bolts / direct mount lockring.
  4. Pedal axles: Verify pedals are torqued to 35–40 Nm with greased threads (remember reverse thread on left pedal).
* **CZ Položky Kontroly:**
  1. Středové složení: Shoďte řetěz z převodníku; roztočte kliky rukou; rotace musí být naprosto hladká bez drhnutí a chroupání.
  2. Upevnění klik: Zahýbejte klikami v ose k rámu a od rámu; nesmí existovat žádná axiální vůle. Zkontrolujte stažení šroubů klik (12–14 Nm).
  3. Převodníky: Ověřte dotažení šroubů převodníků / direct-mount matice.
  4. Pedály: Ověřte dotažení pedálů na 35–40 Nm s namazaným závitem (pozor na levý závit na levé straně).

#### Node 4: Seatpost & Saddle Assembly (Node 4 / 5)
* **EN Check Items:**
  1. Seatpost clamp torque: Check seat collar bolt with torque wrench (typically 4–5 Nm for carbon posts with friction paste).
  2. Minimum insertion depth: Ensure seatpost is inserted beyond frame minimum insertion mark (minimum 80–100mm inside seat tube).
  3. Saddle rail clamp: Inspect rail clamp bolts (typically 8–12 Nm) and rail straightness.
  4. Sweat and water ingress: Verify seatpost has not seized in seat tube (apply carbon paste or waterproof grease periodically).
* **CZ Položky Kontroly:**
  1. Objímka sedlovky: Zkontrolujte dotažení momentovým klíčem (typicky 4–5 Nm u karbonových sedlovek s montážní pastou).
  2. Minimální zasunutí: Ujistěte se, že sedlovka přesahuje minimální rysku rámu (alespoň 80–100 mm v rámu).
  3. Ližiny sedla: Prověřte dotažení zámku sedlovky (typicky 8–12 Nm) a neporušenost ližin.
  4. Ochrana proti zatuhnutí: Ověřte, že sedlovka není zapečená v rámu (pravidelná aplikace montážní pasty nebo vazelíny).

#### Node 5: Rear Wheel, Cassette, Drivetrain & Rear Derailleur (Node 5 / 5)
* **EN Check Items:**
  1. Rear wheel retention: Verify thru-axle torqued to 12 Nm.
  2. Derailleur hanger alignment: Inspect derailleur cage angle; hanger must be perpendicular to wheel plane (unbent).
  3. Cassette lockring: Confirm lockring is torqued to 40 Nm with zero lateral wobble on freehub body.
  4. Shifting indexing & limit screws: Check crisp shifts across all sprockets. Confirm low-limit screw (L) prevents derailleur from entering spokes.
* **CZ Položky Kontroly:**
  1. Upevnění zadního kola: Zkontrolujte dotažení pevné osy na 12 Nm.
  2. Patka přehazovačky: Zkontrolujte rovinu patky a ramínka měniče; ramínko musí směřovat přesně kolmo k ose pastorků.
  3. Matice kazety: Prověřte dotažení pojistné matice kazety na 40 Nm bez boční vůle na ořechu.
  4. Indexace a dorazy: Zkontrolujte přesné řazení po celé kazetě. Ověřte spodní doraz (L), aby měnič nemohl spadnout do výpletu.

---

## 2. Drivetrain Wear Thresholds & Chain Gauge Matrix

### 2.1 The Physics of Chain Elongation
Bicycle chains do not stretch through metal deformation; they elongate due to microscopic wear on internal pins and bushings. As pitch increases beyond 0.50 inches, the elongated chain rides higher up the cassette teeth, rapidly carving hooks into expensive aluminum and steel cogs.

### 2.2 Critical Replacement Thresholds

| Drivetrain Speed | Wear Gauge % | Diagnostic Impact | Mandatory Action |
| :--- | :--- | :--- | :--- |
| **11-Speed & 12-Speed** | **0.50 %** | Pin wear threshold reached | **Replace chain immediately.** Cassette and chainrings remain 100% reusable. |
| **11-Speed & 12-Speed** | **>0.75 %** | Severe cog tooth erosion | **Replace chain AND cassette.** New chain will skip under load on worn teeth. |
| **8-Speed, 9-Speed, 10-Speed** | **0.75 %** | Pin wear limit reached | **Replace chain.** Cassette teeth undamaged. |
| **8-Speed, 9-Speed, 10-Speed** | **>1.00 %** | Complete tooth hooking | **Full drivetrain replacement required** (chain, cassette, chainrings). |

### 2.3 Hot Wax vs. Wet Lubrication Science
* **Drip Oil Lubricants:** Act as liquid magnets for road grit, quartz dust, and grit, forming an abrasive grinding paste inside chain rollers that destroys drivetrains within 2,500–3,500 km.
* **Hot Melt Paraffin Wax (Silca / Molten Speed Wax):** Solid at room temperature. Repels dust and debris completely. Friction loss drops from 6–8 Watts to 2–3 Watts. Drivetrain longevity multiplies by $3\times$ to $5\times$ (chains last 10,000–15,000 km).

---

## 3. The 5-Minute Express Wash Protocol

### 3.1 Strict Prohibitions & Mechanical Safeguards
* **STRICT PROHIBITION 1: NO Pressure Washers (Jet Washes):** High-pressure water penetrates cartridge bearing seals (bottom bracket, hubs, headset, suspension pivots), washing out lithium grease and initiating rapid galvanic pitting.
* **STRICT PROHIBITION 2: NO Penetrating Sprays (WD-40 / GT-85) Near Brakes:** Aerosols vaporize into disc brake rotors and contaminate porous brake pads, causing permanent glazing and zero braking power.
* **APPROVED CHEMICALS ONLY:** Pure Isopropyl Alcohol (IPA 99%) for brake rotors and disc surfaces. pH-neutral bicycle shampoo for frame. Dedicated water-soluble drivetrain degreaser applied strictly to chain/cassette.

### 3.2 Step-by-Step 5-Minute Procedure
1. **Minute 1 — Low-Pressure Rinse:** Spray bicycle from top to bottom with low-pressure garden hose or pump sprayer to loosen surface dust.
2. **Minute 2 — Drivetrain Degreasing:** Spray water-soluble degreaser onto cassette, chain, and chainrings. Agitate with stiff nylon bristle brush.
3. **Minute 3 — Frame & Wheels Suds:** Apply pH-neutral foam shampoo using a soft microfiber sponge. Wash from handlebars down to bottom bracket. Use separate sponge for wheels and tires to avoid transferring road grit to the paintwork.
4. **Minute 4 — Clean Rinse:** Thoroughly flush frame and drivetrain with clean, gentle water flow until all foam and degreaser residues dissipate.
5. **Minute 5 — Dry & Re-lube:** Bounce bike twice on rubber tires to dislodge standing water droplets. Dry frame, brake rotors, and chain with microfiber towel. Apply drip wax or lubricant to chain rollers immediately.

---

## 4. Indoor Trainer Sweat Corrosion Prevention (Electrolytic Pitting)

### 4.1 The Mechanism of Galvanic Sweat Attack
Human sweat contains 0.9% sodium chloride, lactic acid, and minerals. During indoor stationary cycling:
* Riders produce 0.8–1.5 liters of sweat per hour.
* Without outdoor airflow, sweat pools on handlebars, shifter hoods, stem bolts, and headset bearings.
* Sweat penetrates handlebar tape and creates an active electrochemical galvanic cell between aluminum handlebars and steel/carbon interfaces, causing catastrophic aluminum oxidation and hidden handlebar snap failures.

### 4.2 Preventative Maintenance Protocol
1. **Sweat Cover Thong:** Always use an absorbent frame guard between seatpost and handlebars during indoor trainer sessions.
2. **Post-Ride Wipe-down:** Wipe handlebars, stem, and top tube with a damp microfiber cloth after EVERY indoor session.
3. **Bar Tape Replacement Interval:** Strip and replace handlebar tape every **6 months** or after indoor winter season. Inspect bare aluminum bar surface for white powder (aluminum oxide pitting). Discard pitted handlebars immediately.

---

## 5. Tooling Specifications & Workshop Standards

| Tool Category | Recommended Specification | Purpose |
| :--- | :--- | :--- |
| **Torque Wrench** | 2–14 Nm Calibrated Micro-Clicker | Stem bolts, seat collars, carbon cockpit fixtures |
| **Chain Checker** | Drop-in 3-Point Wear Gauge (e.g. Park Tool CC-4, Pedro's Chain Checker Plus) | Isolates pin wear from roller clearance wear |
| **Hex / Torx Keys** | S2 Hardened Steel Chamfered L-Keys (4mm, 5mm, T25) | Prevents stripping lightweight aluminum fasteners |
| **Cleaning Solvents** | 99% Isopropyl Alcohol (IPA) | Disc rotor decontamination, brake bleeding prep |
| **Assembly Paste** | Micro-Pearl Carbon Assembly Compound | Increases friction by 30%, preventing slipping at lower torque |

---

## 6. Bilingual Diagnostic Rules & Strings Schema

```json
{
  "schema_version": "v1.0.0",
  "m_check_nodes": [
    {
      "node_id": 1,
      "name_en": "Front Wheel, Hub & Rotor",
      "name_cs": "Přední kolo, náboj a kotouč",
      "torque_specs": { "thru_axle_nm": 12, "rotor_bolts_nm": 5 }
    },
    {
      "node_id": 2,
      "name_en": "Headset, Fork & Cockpit",
      "name_cs": "Hlavové složení, vidlice a kokpit",
      "torque_specs": { "stem_faceplate_nm": 5, "steerer_clamp_nm": 5 }
    },
    {
      "node_id": 3,
      "name_en": "Bottom Bracket & Cranks",
      "name_cs": "Středové složení a kliky",
      "torque_specs": { "crank_arm_nm": 14, "pedals_nm": 38 }
    },
    {
      "node_id": 4,
      "name_en": "Seatpost & Saddle",
      "name_cs": "Sedlovka a sedlo",
      "torque_specs": { "collar_clamp_nm": 5, "saddle_rails_nm": 10 }
    },
    {
      "node_id": 5,
      "name_en": "Rear Wheel, Drivetrain & Hanger",
      "name_cs": "Zadní kolo, pohon a patka",
      "torque_specs": { "cassette_lockring_nm": 40, "derailleur_bolt_nm": 9 }
    }
  ],
  "chain_wear_rules": {
    "speed_11_12_threshold_percent": 0.50,
    "speed_8_10_threshold_percent": 0.75,
    "action_en": "Replace chain immediately to safeguard cassette",
    "action_cs": "Okamžitě vyměňte řetěz pro ochranu kazety a převodníků"
  }
}
```
