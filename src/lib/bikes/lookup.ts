import { STOCK_BIKE_SPECS } from './stockBikeSpecs';
import type { StockBikeSpec } from './types';

export interface StockBikeMatch {
  bike: StockBikeSpec;
  /** The size named in the text (for example "Size M" or "54cm"), or null when none is named. */
  size: string | null;
}

/** Words that may follow the name of a bike without making it another bike. */
const NEUTRAL_WORDS = new Set(['di2', 'size', 'bike', 'cm', 'frame', 'road', 'disc']);
const YEAR = /^20\d\d$/;

/** Lowercase words without accents; a letter group and its number are joined ("CF 8" becomes "cf8"), a model year is not ("Garda 2026" stays two words). */
export function words(text: string): string[] {
  const plain = text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return plain.replace(/([a-z])\s+(\d+)(?!\d)/g, (whole, letter: string, number: string) => (YEAR.test(number) ? whole : letter + number)).split(/[^a-z0-9.]+/).filter(Boolean);
}

interface Split {
  before: string[];
  after: string[];
}

/** The words around the phrase, or null when the phrase is not in the text as whole words. */
function splitAt(textWords: string[], phrase: string): Split | null {
  const parts = phrase.split(' ');
  for (let start = 0; start + parts.length <= textWords.length; start++) {
    if (parts.every((part, offset) => textWords[start + offset] === part)) {
      return { before: textWords.slice(0, start), after: textWords.slice(start + parts.length) };
    }
  }
  return null;
}

const strip = (word: string) => word.replace(/cm$/, '');

/** A bike of the seed names its phrases; a bike of the community catalog has none, so its brand and model are the phrase. */
const phrasesOf = (bike: StockBikeSpec): readonly string[] => (bike.matchPhrases.length > 0 ? bike.matchPhrases : [words(`${bike.brand} ${bike.model}`).join(' ')]);

/** Conservative: any unknown word after the name ("AXS", "7", "Pro") could mean another build, so the bike is not matched. */
function isSameBike(bike: StockBikeSpec, rest: string[]): boolean {
  const sizes = bike.sizeOrder.map((label) => label.toLowerCase());
  return rest.every((word) => NEUTRAL_WORDS.has(word) || YEAR.test(word) || sizes.includes(strip(word)));
}

/**
 * The series bike that a free text names ("Canyon Endurace CF 8 Size M"), or null: the caller then falls back to the AI
 * extraction. Stock components differ by build, so only the exact build matches ("Endurace CF 7" and "CF 8 AXS" do not).
 */
export function findStockBike(text: string, bikes: readonly StockBikeSpec[] = STOCK_BIKE_SPECS): StockBikeMatch | null {
  const textWords = words(text);
  for (const bike of bikes) {
    const split = phrasesOf(bike).map((phrase) => splitAt(textWords, phrase)).find((found) => found !== null);
    if (!split || !isSameBike(bike, split.after)) continue;
    const named = [...bike.sizeOrder].reverse().find((label) => [...split.before, ...split.after].map(strip).includes(label.toLowerCase()));
    return { bike, size: named ?? null };
  }
  return null;
}
