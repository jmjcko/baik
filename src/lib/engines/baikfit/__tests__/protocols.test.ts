import { describe, it, expect } from 'vitest';
import { loadKnowledgeBase } from '@/lib/kbLoader';
import { translations, type Locale } from '@/lib/i18n/translations';

type Guide = 'inseam' | 'torso' | 'acromion' | 'arm' | 'crank' | 'saddle' | 'bar';

const KEY_PHRASES: Record<Locale, Record<Guide, RegExp[]>> = {
  en: {
    inseam: [/cycling shorts/i, /15 cm/, /carpenter/i, /sit-bone/i, /0\.883/, /30°–35°/, /heel on the pedal/i],
    torso: [/cycling shorts/i, /top edge of the book/i, /sternal notch/i],
    acromion: [/distal bony prominences/i, /scapula/i, /do not measure/i, /deltoid/i, /1:1/, /390–410/, /320–380/, /420 mm/],
    arm: [/tip of the acromion/i, /slightly bent/i, /clenched fist/i],
    crank: [/inside face of the crank arm/i, /pedal thread/i, /172\.5/, /center of the bottom bracket spindle/i, /center of the pedal spindle/i],
    saddle: [/along the seat tube line/i, /center of the bottom bracket \(BB\) spindle/i, /top of the saddle/i, /70 mm width point/i],
    bar: [/center to center/i, /C-C/, /top of the brake hoods/i, /drops/i],
  },
  cs: {
    inseam: [/cyklistických/i, /15 cm/, /vodováh/i, /sedacích kostí/i, /0,883/, /30°–35°/, /patou na pedálu/i],
    torso: [/cyklistických/i, /horní hrany knihy/i, /sternální jamk/i],
    acromion: [/distální/i, /lopatky/i, /neměř/i, /delt/i, /1:1/, /390–410/, /320–380/, /420mm/],
    arm: [/špičku akromi/i, /mírně pokrčen/i, /sevřené pěsti/i],
    crank: [/vnitřní stran/i, /závit/i, /172,5/, /střed(u)? osy středového složení/i, /střed(u)? osy pedálu/i],
    saddle: [/podél sedlové trubky/i, /střed(u)? osy středového složení/i, /vrcholu sedla/i, /70 mm/],
    bar: [/osa k ose/i, /C-C/, /horní části brzdových pák/i, /spodní/i],
  },
};

function guideText(locale: Locale, guide: Guide): string {
  const w = translations[locale].wizard;
  const parts = {
    inseam: [...w.inseamSteps, w.inseamClinicalNote],
    torso: [...w.torsoSteps, w.torsoClinicalNote],
    acromion: [...w.acromionSteps, w.acromionClinicalNote, w.acromionGuideText],
    arm: [...w.armSteps, w.armClinicalNote, w.armGuideText],
    crank: [...w.crankSteps, w.crankGuideText],
    saddle: [...w.saddleSteps, w.saddleGuideText],
    bar: [...w.barSteps, w.barGuideText],
  };
  return parts[guide].join(' ');
}

describe.each(['en', 'cs'] as const)('measurement protocols follow KB 2.1 to 2.3 (%s)', (locale) => {
  it.each(['inseam', 'torso', 'acromion', 'arm', 'crank', 'saddle', 'bar'] as const)('should contain the KB phrases of the %s guide', (guide) => {
    const text = guideText(locale, guide);
    for (const phrase of KEY_PHRASES[locale][guide]) {
      expect(text, String(phrase)).toMatch(phrase);
    }
  });
});

describe('the KB still states the protocol facts the guides rely on', () => {
  const kb = loadKnowledgeBase('baikfit');

  it.each([
    'heels 15 cm apart',
    'carpenter',
    'sit-bone pressure',
    'sternal notch',
    'distal bony prominences',
    'Do NOT measure external arm/deltoid musculature width',
    '390–410 mm',
    '320–380 mm',
    'slightly bent arm to the center of a clenched fist',
    'INSIDE face of the crank arm near the pedal threads',
    'Measure distance from center of Bottom Bracket spindle to center of pedal spindle',
    'along the seat tube line from the center of the Bottom Bracket (BB) spindle to the top of the saddle at the 70 mm width point',
    'Center-to-Center / C-C',
    'across the top of the brake hoods or drops',
  ])('should contain "%s"', (phrase) => {
    expect(kb).toContain(phrase);
  });
});
