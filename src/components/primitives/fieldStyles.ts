/** The look of every text field and every unselected choice of the app (story 53.1 and 53.2): a field is darker than its card in the dark theme, has an edge that can be seen and a thicker blue edge when it has focus. */
const EDGE = 'border-2 border-field-line bg-field text-ink placeholder:text-ink-2 focus:border-field-focus focus:outline-none disabled:opacity-50';

/** The usual field: 48 px high, as wide as its container. */
export const FIELD = `w-full h-12 rounded-xl px-4 text-sm ${EDGE}`;
/** A compact field of 40 px for tables, filters and the admin. */
export const FIELD_SM = `w-full h-10 rounded-lg px-3 text-sm ${EDGE}`;
/** The large field of 56 px for the name of a bike. */
export const FIELD_LG = `w-full h-14 rounded-xl px-4 text-base ${EDGE}`;
/** A field of 48 px whose width comes from its place (a date, a number next to a button): the caller sets the width. */
export const FIELD_FIT = `h-12 rounded-xl px-4 text-sm ${EDGE}`;
/** A text area; the caller sets the number of rows. */
export const FIELD_AREA = `w-full rounded-xl px-4 py-3 text-sm ${EDGE}`;
/** A choice that is not selected (a chip, a secondary button, an empty check box): the caller adds the text color. */
export const CHIP_OFF = 'border-2 border-field-line bg-field hover:border-field-focus';
