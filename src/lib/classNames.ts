/** Joins class name fragments, skipping empty values (avoids stray spaces in the class attribute). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
