import type { SizeSpec, StockBikeSpec } from './types';

/**
 * Series bikes with the published geometry and stock components of every size. Deterministic and checked by hand:
 * a number that the manufacturer does not publish is `null`, never an estimate. Every bike names its source and the
 * day the numbers were read; `stockBikeSpecs.test.ts` guards the shape and the plausibility of every value.
 *
 * Not published anywhere we could read, so `null` for every bike: the factory spacer height and the seat post offset.
 * Trek does not publish the crank length and the handlebar width of the Domane SL 6 Gen 4 on the page that was used.
 */

const READ_ON = '2026-10-24';
const MIRROR_NOTE = 'Numbers copied by Bike Insights from the manufacturer; the manufacturer page is the reference.';

/** One size; the arguments follow the order of the geometry tables: stack, reach, seat tube angle, then the stock parts. */
function size(stack: number, reach: number, angle: number, parts: Pick<SizeSpec, 'stockStemMm' | 'stockHandlebarMm' | 'stockCrankMm'>, extra: Pick<SizeSpec, 'topTubeMm' | 'headTubeMm'>): SizeSpec {
  return { frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: angle, ...extra, ...parts, stockSeatpostOffsetMm: null, stockSpacersMm: null };
}

const parts = (stem: number | null, bar: number | null, crank: number | null) => ({ stockStemMm: stem, stockHandlebarMm: bar, stockCrankMm: crank });
const frame = (topTubeMm: number, headTubeMm: number) => ({ topTubeMm, headTubeMm });

const canyonEnduraceCf8: StockBikeSpec = {
  id: 'canyon-endurace-cf-8-di2-2024',
  brand: 'Canyon',
  model: 'Endurace CF 8',
  build: 'CF 8 Di2',
  years: [2024],
  discipline: 'road',
  sizeOrder: ['XS', 'S', 'M', 'L', 'XL'],
  sizes: {
    XS: size(548, 370, 73.5, parts(80, 370, 170), frame(522, 128)),
    S: size(568, 375, 73.5, parts(90, 390, 172.5), frame(533, 145)),
    M: size(590, 378, 73.5, parts(100, 410, 172.5), frame(543, 164)),
    L: size(611, 387, 73.5, parts(110, 410, 175), frame(558, 186)),
    XL: size(637, 405, 73.5, parts(110, 430, 175), frame(584, 213)),
  },
  matchPhrases: ['canyon endurace cf8'],
  source: {
    name: 'Canyon geometry PDF via Bike Insights (2024 Endurace CF 8 Di2)',
    url: 'https://bikeinsights.com/bikes/5ece53fd9bf2b70017f6bf76-canyon-bicycles-endurace-cf?version=2024&build=8-di2',
    verifiedOn: READ_ON,
    note: `${MIRROR_NOTE} The 2023 table was not found, so only 2024 is listed.`,
  },
};

const specializedTarmacSl8: StockBikeSpec = {
  id: 'specialized-tarmac-sl8-expert-2024',
  brand: 'Specialized',
  model: 'Tarmac SL8',
  build: 'Expert',
  years: [2024],
  discipline: 'road',
  sizeOrder: ['52', '54', '56', '58'],
  sizes: {
    '52': size(527, 380, 74, parts(90, 400, 170), frame(531, 120)),
    '54': size(544, 384, 74, parts(100, 420, 172.5), frame(541, 137)),
    '56': size(565, 395, 73.5, parts(100, 420, 172.5), frame(563, 157)),
    '58': size(591, 402, 73.5, parts(110, 440, 175), frame(577, 184)),
  },
  matchPhrases: ['specialized tarmac sl8 expert'],
  source: {
    name: 'specialized.com (Tarmac SL8 Expert) via Bike Insights',
    url: 'https://bikeinsights.com/bikes/64d218305cc094001b34f10c-specialized-bicycles-tarmac-sl8',
    verifiedOn: READ_ON,
    note: `${MIRROR_NOTE} Stem, handlebar and crank are those of the Expert build; other builds differ.`,
  },
};

const trekDomaneSl6: StockBikeSpec = {
  id: 'trek-domane-sl-6-gen-4-2024',
  brand: 'Trek',
  model: 'Domane SL 6 Gen 4',
  build: 'SL 6 Gen 4',
  years: [2024],
  discipline: 'road',
  sizeOrder: ['52', '54', '56', '58'],
  sizes: {
    '52': size(561, 371, 74.2, parts(90, null, null), frame(530, 145)),
    '54': size(575, 374, 73.7, parts(90, null, null), frame(542, 160)),
    '56': size(591, 377, 73.3, parts(100, null, null), frame(554, 175)),
    '58': size(611, 380, 73, parts(100, null, null), frame(567, 195)),
  },
  matchPhrases: ['trek domane sl6 gen4'],
  source: {
    name: 'trekbikes.com (Domane SL 6 Gen 4) via Bike Insights',
    url: 'https://bikeinsights.com/bike-geometries/6a414c7474f204001b4f5ac1',
    verifiedOn: READ_ON,
    note: `${MIRROR_NOTE} Only the 2024 Gen 4 was found (the 2023 model is Gen 3 with other numbers). The handlebar width and the crank length are not on the page.`,
  },
};

const giantDefyAdvanced2: StockBikeSpec = {
  id: 'giant-defy-advanced-2-2023',
  brand: 'Giant',
  model: 'Defy Advanced 2',
  build: 'Advanced 2',
  years: [2023],
  discipline: 'road',
  sizeOrder: ['S', 'M', 'ML', 'L'],
  sizes: {
    S: size(546, 374, 74, parts(90, 400, 170), frame(530, 140)),
    M: size(567, 377, 73.5, parts(100, 420, 172.5), frame(545, 160)),
    ML: size(586, 381, 73, parts(100, 420, 172.5), frame(560, 185)),
    L: size(605, 390, 73, parts(110, 440, 175), frame(575, 205)),
  },
  matchPhrases: ['giant defy advanced2'],
  source: {
    name: 'giant-bicycles.com (Defy Advanced 2, 2023) via Bike Insights',
    url: 'https://bikeinsights.com/bike-geometries/633c881c6c648f0023bab50c',
    verifiedOn: READ_ON,
    note: `${MIRROR_NOTE} The page links a differently named Giant page, so the build name should be checked before relying on the stock parts.`,
  },
};

export const STOCK_BIKE_SPECS: readonly StockBikeSpec[] = [canyonEnduraceCf8, specializedTarmacSl8, trekDomaneSl6, giantDefyAdvanced2];
