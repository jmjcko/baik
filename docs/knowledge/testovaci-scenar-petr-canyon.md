# 🚴‍♂️ Testovací případ: Cyklista Petr & Canyon Endurace CF 7

Tento dokument slouží jako **End-to-End E2E testovací scénář** pro ověření výpočetního enginu, vizuálních schémat a klinické diagnostiky v aplikaci **bAIk fit** (bAIk).

---

## 📋 1. Vstupy do průvodce (Wizard Steps 1–4)

### **Krok 1: Výběr disciplíny (Riding Discipline)**
* **Vybraná disciplína:** `Road` (Silniční cyklistika)

---

### **Krok 2: Tělesná morfologie (Rider Body Morphology)**
* **Výška těla:** `1810 mm` (181 cm)
* **Vnitřní délka nohy (Inseam):** `850 mm` (85 cm)
* **Šířka ramen (Acromion):** `380 mm`
* **Délka trupu:** `610 mm`
* **Délka paže:** `660 mm`

---

### **Krok 3: Posed & Diagnostika symptomů (Posture & Pain Checklist)**
* **Styl jízdy:** `Endurance` (~45°+ sklon trupu)
* **Zaškrtnuté bolesti/příznaky:**
  1. ☑️ **Brnění malíčku a prsteníčku** (*Ulnar nerve numbness*)
  2. ☑️ **Bolest přední strany kolene** (*Anterior knee pain*) po 40–50 km jízdy

---

### **Krok 4: Stávající kolo od výrobce (Stock Bike Parameters)**
* **Model:** `Canyon Endurace CF 7` (Sériové osazení velikosti M)
* **Sériové kliky z výroby:** `172.5 mm`
* **Sériová řídítka z výroby:** `420 mm` (*tovární "420mm trap" pro velikost M*)
* **Naměřená stávající výška sedla na kole:** `720 mm` (*změřeno podél sedlové trubky od středu složení po šířku sedla 70 mm*)

---

## 📊 2. Očekávané výstupy engine & reportu (Diagnostic Report)

Až proklikáte průvodce s těmito daty, finální stránka reportu musí spočítat a zobrazit přesně následující hodnoty:

---

### 1️⃣ **Výška sedla (Saddle Height Baseline)**
* **Matematický výpočet (LeMond Baseline):**  
  $$\text{Target Saddle Height} = \text{Inseam (850 mm)} \times 0.883 = \mathbf{750.55\text{ mm}} \approx \mathbf{751\text{ mm}}$$
* **Srovnání se stávajícím kolem:**  
  Současně: `720 mm` vs. Cíl: `751 mm` $\rightarrow$ **Delta = −31 mm** (*Sedlo je příliš nízké*)
* **Grafické SVG schéma:**  
  Zobrazí boční pohled na sedlovku s červenou značkou na 720 mm, zelenou na 751 mm a **šipkou nahoru `+31 mm`**.
* **Klinická vazba na bolest:**  
  Box Klinická diagnostika propojí odchylku −31 mm (>3 mm limit) přímo s reakcí:  
  👉 *„Bolest přední strany kolene je způsobena nízkým sedlem o 31 mm (přetížení čéškového vaziva při hluboké flexi).“*
* **Akční plán (Krok 1):**  
  *„Zvednout sedlo o +31 mm v adaptačních krocích po 8–10 mm s testovací jízdou.“*

---

### 2️⃣ **Šířka řídítek & Kokpit (Handlebar Width)**
* **Matematický výpočet (Acromion Rule 1:1):**  
  Šířka ramen 380 mm $\rightarrow$ **Cílová řídítka 380 mm**.
* **Srovnání se stávajícím kolem:**  
  Současně: `420 mm` vs. Cíl: `380 mm` $\rightarrow$ **Delta = +40 mm** (*Řídítka jsou o 40 mm širší*)
* **Grafické SVG schéma:**  
  Zobrazí přední pohled na kostru ramen a řídítka. Červená 420mm barva zvýrazní vnější rotaci zápěstí a útlak ulnárního nervu. Zelená 380mm ukáže přímou paralelní osu paže–zápěstí.
* **Klinická vazba na bolest:**  
  Box Klinická diagnostika propojí odchylku +40 mm s reakcí:  
  👉 *„Brnění malíčku a prsteníčku je způsobeno továrními 420mm řídítky, která nutí rotaci zápěstí a stlačují ulnární nerv v Guyonově kanálu.“*
* **Akční plán (Krok 2):**  
  *„Vyměnit tovární 420mm řídítka za 380mm (případně stočit páky mírně dovnouť pro přirozenou osu).“*

---

### 3️⃣ **Délka klik (Crank Length)**
* **Doporučení engine:** **`165 mm`** (*optimální biomechanické otevření kyčelního úhlu*)
* **Srovnání se stávajícím kolem:**  
  Současně: `172.5 mm` vs. Cíl: `165 mm` $\rightarrow$ **Delta = +7.5 mm navíc**
* **Grafické SVG schéma:**  
  Zobrazí boční pohled na pedálovou dráhu v horní úvrati (12 o'clock). Zkrácení klik o 7.5 mm ukáže **snížení zdvihu kolene v horní úvrati přesně o 7.5 mm**, což uvolní tlak na kyčel i koleno.
* **Akční plán (Krok 3):**  
  *„Při budoucí výměně komponentů přejít na 165mm kliky pro plynulejší kadenci a snížení tlaku na kolena.“*

---

### 4️⃣ **Sklon sedla & Nastavení kufrů (Saddle Pitch & Cleats)**
* **Sklon sedla:** **0° až -1.5°** (*vodorovná rovina až mírné sklopení špičky dospod*)
* **Pozice kufrů na tretrách:** **10–17 mm** za kloubem 1. metatarzu (*posun kufru co nejvíce dozadu pro stabilizaci paty*)
* **Akční plán (Krok 4):**  
  *„Srovnat sklon sedla do roviny (0° až -1.5°) a posunout kufry o 10–17 mm za kloub palce.“*
