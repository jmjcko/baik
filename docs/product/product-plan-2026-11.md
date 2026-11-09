# bAIk: product assessment, brand direction and plan (2026-11-09)

Written by the assistant in the role of a senior product manager, for the product owner. Facts come from the repository and from web searches of 2026-11-09 (links at the end); everything else is marked **[hypothesis]** and has a test in section 9. Nothing here is legal advice.

## 1. Verdict in short
- **The product is unusually deep for its stage and thin where success is decided:** it has an engine, a knowledge base with weighted sources, four modules and good privacy, but **no validated users, no measurement of use, no business model, no public identity and an unresolved legal footing for health data.**
- **The market is real but crowded in the obvious place.** AI bike fit by photo or video has many cheap apps. Wear tracking is served by Strava-based apps. Nobody I found combines **fit, care, gear advice and learning around one rider and one bike, grounded in cited evidence, in Czech and English**.
- **The winning position is trust, not AI.** "AI" is the weakest word to build the brand on (hype, many look-alikes, and your engine is mostly rules on purpose). The strongest claim you can make and others cannot copy quickly is: *"set up right and kept right, with sources you can check."*
- **Next 8 weeks: stop building features, make the product publishable and learn from 15 real riders.**

## 2. What the product is today (fact base)
| Module | What exists | Evidence status |
| :--- | :--- | :--- |
| bAIkfit | 4-step wizard, report with deterministic guardrails, CAD studio simulator, pre-purchase audit, stock bike catalog, mini-tests | numbers come from the knowledge base; several are `[owner]` |
| bAIkcare | workshop (M-Check, chain gauge, tyres), garage and service book, wear logbook with Health Score, reminders, Intervals.icu sync, Strava (beta) | all distance numbers are `[owner baseline]` |
| bAIkgear | adviser and prompt writer for the rider's own chatbot, Upgrade Matrix, saved purchases; no shop, no prices | KB v1.1.0, brands and prices kept out of the output |
| bAIkedu | micro articles with sources | 6 articles |
| Platform | EN and CS, riders and bikes (family), accounts on Supabase, data stays in the browser where possible, body and bike data never sent to the AI | built, not yet public |
| Evidence base | weighted source channels (tiers A to D), claims workflow, 4 videos processed, 28 claims approved | no topic READY yet (best 1.1 of 2.0) |

## 3. Market and competition
**Categories and examples** (listings and articles of 2026; details unverified where marked):
| Group | Examples | What they do | Gap against bAIk |
| :--- | :--- | :--- | :--- |
| AI fit by photo or video | Bike Fast Fit (Elite subscription about 19.99 USD a year in its listing), FramIQ, Posturise, MyVeloFit, BikeFit AI, Bike Fit Pro, SizeMyBike | measure posture from camera | they do **only fit**, no care, no gear, little sourcing; some are free or cheap |
| Wear and service tracking | ProBikeGarage, Wearage (both use Strava rides), Garmin gear tracking in Connect (not confirmed) | component mileage and reminders | no fit, no advice, every one depends on Strava or Garmin |
| Training and data | Strava, Intervals.icu, TrainerRoad, Garmin Connect | rides and fitness | not about the bike itself |
| Human fitters | studios (for example a 3D fit at 4,490 CZK in the Prague area, a one-hour fit at 70 EUR at a retailer; 75 to 500 USD in the US) | the gold standard, once | expensive, one visit, no follow-up, no wear |
| Free advice | YouTube fitters, forums, AI chatbots | endless, uneven, generic | no memory of your bike, no guardrails |

**Reading:** the human fitter sets the **price anchor and the trust bar**; the cheap AI apps set the **feature bar**; the wear apps show that **riders do pay attention to service** and live on Strava, which is also their **platform risk**.

## 4. Who it is for, and what job it does (hypotheses)
| Persona | When | I want to | So I can | Evidence needed |
| :--- | :--- | :--- | :--- | :--- |
| **Pain rider** (35 to 55, owns a 2,000 to 4,000 EUR road or gravel bike) | numb hands, knee or back pain on rides | find what to change without paying a fitter first | ride without pain and not buy wrong parts | interviews |
| **Family bike manager** (the owner is one) | looking after bikes of a partner and children | see what is due for whom | nothing fails and nobody is on a wrong setup | interviews |
| **Data rider** (Intervals.icu, Strava, power meter) | riding 5,000 to 15,000 km a year | have wear tracked on its own and warned in time | replace the chain before the cassette dies | ask in the Intervals.icu forum |
| **Shop mechanic or fitter** (later, B2B) | a customer asks "what should I change" | a quick evidence-backed second opinion and a handover sheet | sell the right thing and keep the customer | later |

## 5. Lean canvas
- **Problem:** (1) a wrong setup hurts and is hard to diagnose at home, (2) wear surprises, (3) buying advice is noisy and sells. *Existing alternatives:* fitter once, YouTube, shop staff, Strava gear, spreadsheets, a generic chatbot.
- **Customer segments:** the pain rider and the data rider first; family manager as a retention feature; B2B later.
- **Unique value:** "One bike, one rider: set up right and kept right, with sources you can check. Private by design."
- **Solution:** the four modules around one data model of the rider and the bike.
- **Unfair advantage:** (a) the weighted evidence base and the deterministic guardrails (slow to copy, grows with use), (b) Czech and CEE language and market, (c) the privacy design (body data never leaves, no shop), (d) a rule engine that is testable, which a chat wrapper cannot match.
- **Channels:** content from the knowledge base (bAIkedu), cycling clubs and local fitters as partners, the Intervals.icu community, Czech cycling media, SEO on symptoms ("numb hands cycling").
- **Revenue streams [hypothesis]:** free core; paid **Pro** for several riders and bikes, automatic ride sync, certificates and exports; later a **B2B plan for fitters and shops**. No affiliate links: it would break the "no shop" promise that is the trust.
- **Cost structure:** hosting and database, the AI calls (small, one call type), domain and legal, and above all **curation time** for the evidence base.
- **Key metrics:** see section 11.

## 6. Strengths, gaps, threats
**Strengths:** integrated lifecycle; evidence and guardrails; privacy; Czech and English parity; family model; strong education visuals; automatic wear through Intervals.icu; engines are pure and tested.

**Gaps that decide success:**
1. **No users and no measurement.** Not one external rider has used it, and nothing measures activation or return.
2. **Credibility of the numbers.** Many core numbers are `[owner baseline]` without a checked source; the evidence base is the fix and is only started.
3. **Legal.** Symptoms are **health data** (GDPR Article 9: special category): explicit consent, privacy policy, retention and deletion, a short risk assessment; plus careful wording (a fit tool is not medical advice).
4. **Onboarding length.** Four steps and body measurements before value; the report must come within five minutes or riders leave.
5. **No mobile install or push reminders**; care needs reminders to bring riders back.
6. **Platform dependence.** Strava needs a paid developer subscription, Garmin is closed to individuals and works only through its developer programme for companies; the free route is Intervals.icu.
7. **Brand.** "bAIk" collides with an existing e-bike rental app and leans on "AI". No domain, no landing page.
8. **No business model tested.**

**Threats:** Strava or Garmin ship service tracking themselves; cheap AI fit apps add care; general chatbots give free generic advice; a bad outcome from advice (liability); API changes.

## 7. Brand and naming
**Promise (one line):** *Your bike, set up right and kept right. With sources.*
**Pillars:** (1) Evidence you can check, (2) Private by design, (3) Independent: we do not sell parts, (4) One bike, one rider, the whole life of the bike.
**Tone:** calm, expert, honest about limits ("a check, not a command"); no hype, no emoji (already the product rule).
**Do not lead with AI.** Say "AI inside" in the product, but name and promise the outcome and the trust.
**Name criteria:** easy to say in Czech and English; meaning that fits fit, care, gear and learning; no clash in the app stores; a `.cz` and `.app` or `.com` possible; works as a master brand ("X Fit, X Care, X Gear, X Learn").
**Findings (DNS check, not a registry check):** `baik.com`, `baik.io` parked or for sale, `baik.cz`, `baik.ai`, `baik.app` registered. Candidates with the best DNS picture: **Velowise** and **Crankwise** (`.cz`, `.app`, `.ai`, `.bike`, `.cc` showed no records, `.com` taken); **Dialed** has the best meaning ("dialed in" is bike slang for set up perfectly) but `dialed.bike`, `.ai` and `.app` are taken and the word is generic for search.
**My recommendation:** test **Velowise** (safe, ownable) against **Dialed** (strong meaning, weaker ownership) with ten riders and one trademark search (EUIPO TMview, the Czech office, WIPO, classes 9, 41, 42). Keep bAIk only if you accept the collision and the AI framing.

## 8. Strategy
- **Vision:** every rider rides a bike that is set up right and kept right, and knows why.
- **Goal (12 months) [hypothesis]:** 2,000 monthly active riders, 30 percent returning within 30 days, and 3 percent on a paid plan, **or** a clear signal that B2B is the better road.
- **Focus areas:** (1) trust and legal base, (2) fast time to first value, (3) a retention loop (service reminders, automatic rides), (4) evidence base to READY on the 10 core topics.
- **Challenges and answers:** platform APIs (answer: Intervals.icu first, apply to Garmin when the domain and privacy policy exist); health liability (answer: wording, guardrails, referral to a fitter, consent); curation cost (answer: weighted sources, the inbox workflow, the owner approves).

## 9. Assumption map
| # | Assumption | Type | Confidence | Cost if wrong | Cheapest test |
| :-- | :--- | :--- | :--- | :--- | :--- |
| 1 | Riders finish the 4-step wizard | Usability | low | high | 10 observed sessions, count drop-off per step |
| 2 | They trust the report without a fitter | Desirability | medium | high | ask after the report: would you change your bike? did you? (2 weeks later) |
| 3 | Pain riders pay for a **yearly** plan | Viability | low | high | pricing page with a fake "Start Pro" button, measure clicks |
| 4 | Fitters and shops would use or recommend it | Viability | low | medium | 5 conversations with local fitters |
| 5 | Wear tracking brings people back | Desirability | medium | medium | reminder e-mail test with 20 riders |
| 6 | Automatic rides are available long term | Feasibility | medium | medium | Intervals.icu is stable; Strava and Garmin need approval |
| 7 | Measurements done at home are good enough | Usability | low | high | compare 10 riders with a fitter's numbers |
| 8 | Symptoms can be stored lawfully | Ethical / legal | unknown | very high | privacy policy, consent flow, a short risk assessment before launch |
| 9 | The evidence base can reach READY on core topics | Feasibility | medium | medium | process 30 more videos, count topics at weight 2.0 |
| 10 | Czech is a real wedge | Desirability | medium | medium | share in 3 Czech clubs, count sign-ups |

## 10. Prioritisation
**RICE (my estimates, to be replaced by data):** Reach = riders per quarter, Impact 0.25 to 3, Confidence in percent, Effort in person-weeks; score = Reach x Impact x Confidence / Effort.
| Initiative | Reach | Impact | Conf. | Effort | Score |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Privacy policy, consent for health data, legal pages | 1000 | 3 | 90% | 2 | **1350** |
| Privacy-friendly analytics and funnel events | 1000 | 2 | 80% | 1.5 | **1067** |
| Brand, name, domain, landing page | 1000 | 2 | 80% | 3 | **533** |
| Mobile polish and installable app (PWA) | 800 | 2 | 70% | 3 | **373** |
| Evidence base to READY on core topics | 1000 | 2 | 70% | 6 | **233** |
| Service reminders by e-mail | 600 | 2 | 60% | 4 | **180** |
| Garmin developer programme application, Strava production | 400 | 2 | 40% | 3 | **107** |
| Video or photo posture analysis | 600 | 3 | 30% | 20 | **27** |
RICE undervalues **discovery with 15 riders** (small reach, but it decides everything): do it first regardless of score.

**Kano of today's features:** *Basic* (expected): correct report, privacy, EN and CS, works on a phone, data export and delete. *Satisfiers:* wear score and reminders, saved bikes and riders, certificates. *Delighters:* the master prompt for your own chatbot, the Upgrade Matrix with sources, the CAD explanations, automatic wear from Intervals.icu. *Indifferent (so far):* the CAD studio simulator for most riders (check by use), the long stock bike catalog.

## 11. Outcome roadmap (OKRs)
**Now (weeks 1 to 8): "Publishable and learning"**
- O1 Be safe and credible to publish. KR: privacy policy and consent live; risk assessment done; 10 core topics have a named source; name and domain decided.
- O2 Learn from real riders. KR: 15 riders complete the wizard; median time to report under 6 minutes; 10 interviews done; top 3 problems ranked.
- O3 See what happens. KR: funnel events live (wizard step, report, first service entry, return after 7 and 30 days).

**Next (weeks 9 to 20): "Make them come back"**
- O4 A retention loop. KR: reminder e-mails live; 30-day return 25 percent among beta riders.
- O5 Rides without effort. KR: Intervals.icu guide in the app; Garmin developer application sent; Strava decision made.
- O6 Money signal. KR: pricing page with fake door; at least 3 percent of visitors click Start Pro.

**Later (weeks 21 and on): "Grow"**
- B2B pilot with 3 fitters or shops; more languages (SK, DE, PL); community suggestions to the evidence base; posture analysis only if assumption 7 shows riders want it.

## 12. Metrics
**North star:** riders with a **current setup and a care plan they acted on** in the last 30 days.
**HEART:** Happiness: score after the report (one question). Engagement: service entries and ride syncs per bike per month. Adoption: share of sign-ups that finish the wizard. Retention: return after 7 and 30 days. Task success: time to the report, share who change a part after advice.
**AARRR:** Acquisition (visits to sign-ups by channel), Activation (report viewed), Retention (service entry or ride within 30 days), Referral (invites, shared passports), Revenue (Pro clicks, then payments).

## 13. Stakeholders
| Stakeholder | Power | Interest | Approach |
| :--- | :--- | :--- | :--- |
| Riders (users) | medium | high | manage closely: interviews and a beta group |
| Fitters and bike shops | high | medium | manage closely: partners, not rivals; "fit first, buy later" is their own ethos |
| Strava, Garmin, Intervals.icu | high | low | keep satisfied: follow the terms, use free routes first |
| Content creators (sources) | medium | low | keep informed: cite, never copy a transcript |
| Data protection authority | high | low | keep satisfied: consent, policy, deletion |
| Czech cycling clubs and media | low | high | keep informed: launch partners |

## 14. Discovery plan: 10 interviews in two weeks
Script (from the interview guide in the PDF, adapted): 1. "Tell me about the last time your bike did not feel right. Walk me through what you did." 2. "When did you last pay for or ask for help with setup or service? What happened?" 3. "Tell me about the last time you bought a part. How did you decide?" 4. "When did you last wish you had known a chain or brake pad was worn?" 5. "When did you last talk about it with a friend? What did you say?" Then watch them use bAIk with one task: "find out why your hands go numb." Ask for facts about the past, never "would you use it".

## 15. Decisions for the owner
1. Brand direction (Velowise, Dialed, or keep bAIk) and permission to run the trademark and domain check.
2. Go for a **public beta in 8 weeks** with the "Now" plan above.
3. Freeze new features except what the beta shows.
4. Who reviews the legal base (a lawyer or the data protection office) before the first public user.

## Sources
- [Bike Fast Fit Elite](https://apps.apple.com/us/app/bike-fast-fit-elite/id1145619812), [Best MyVeloFit alternatives](https://topai.tools/alternatives/myvelofit), [Best Posturise alternatives](https://topai.tools/alternatives/posturise)
- [ProBikeGarage](https://apps.apple.com/us/app/probikegarage/id1422489202), [Garmin gear tracking thread](https://singletrackworld.com/forum/bike-forum/garmin-gear-tracking/)
- [Kola Radotín, bike fit price list](https://www.kola-radotin.cz/en/bike-seat-settings-retul-bike-fitting), [MTBIKER bike fitting](https://www.mtbiker.shop/shop/informacie/bikefitting.html)
- [Garmin personal API FAQ](https://developer.garmin.com/gc-developer-program/personal/personal-faq/)
