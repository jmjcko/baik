/** Brand, model and year as the form fields show them (the year as text, so that an empty box can mean "not given"). */
export interface BikeName {
  brand: string;
  model: string;
  year: string;
}

const YEAR_TOKEN = /^20[0-3]\d$/;

/**
 * "Cube Attain 2027" becomes brand Cube, model Attain, year 2027: the year is a four digit token, the brand is the first
 * word, the model is the rest. It is a first guess that the owner can correct (a brand of two words needs a correction).
 */
export function parseBikeName(text: string): BikeName {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const at = words.findLastIndex((word) => YEAR_TOKEN.test(word));
  const year = at === -1 ? '' : words[at];
  const rest = words.filter((_, index) => index !== at);
  return { brand: rest[0] ?? '', model: rest.slice(1).join(' '), year };
}
