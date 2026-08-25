/**
 * Hebrew Linguistics & Sofiot Normalization Engine
 */

// Bidirectional maps for Hebrew regular vs Sofit (final) letter forms
const BASE_TO_SOFIT_MAP: Record<string, string> = {
  כ: 'ך',
  מ: 'ם',
  נ: 'ן',
  פ: 'ף',
  צ: 'ץ',
};

const SOFIT_TO_BASE_MAP: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
};

/**
 * Removes Nikud (Hebrew vowel diacritics \u0591-\u05C7) from a string.
 */
export function stripHebrewNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

/**
 * Normalizes a Hebrew letter to its standard base (non-Sofit) form.
 * e.g., 'ך' -> 'כ', 'ם' -> 'מ', 'ן' -> 'נ', 'ף' -> 'פ', 'ץ' -> 'צ'
 */
export function normalizeHebrewLetter(char: string): string {
  const cleanChar = stripHebrewNikud(char);
  return SOFIT_TO_BASE_MAP[cleanChar] || cleanChar;
}

/**
 * Converts a base Hebrew letter to its Sofit (final) form if available.
 * e.g., 'כ' -> 'ך', 'מ' -> 'ם', 'נ' -> 'ן', 'פ' -> 'ף', 'צ' -> 'ץ'
 */
export function toSofitForm(char: string): string {
  const cleanChar = stripHebrewNikud(char);
  return BASE_TO_SOFIT_MAP[cleanChar] || cleanChar;
}

/**
 * Checks if a character is a valid Hebrew letter (including Sofiot).
 */
export function isValidHebrewLetter(char: string): boolean {
  if (!char || char.length === 0) return false;
  const cleanChar = stripHebrewNikud(char);
  const code = cleanChar.charCodeAt(0);
  // Hebrew Unicode range \u05D0 (א) to \u05EA (ת)
  return code >= 0x05d0 && code <= 0x05ea;
}

/**
 * Context-aware formatter that adjusts a typed Hebrew letter based on whether it sits at the end of a word.
 */
export function formatHebrewLetterForPosition(
  char: string,
  isEndOfWord: boolean
): string {
  if (!isValidHebrewLetter(char)) return char;

  const baseChar = normalizeHebrewLetter(char);
  return isEndOfWord ? toSofitForm(baseChar) : baseChar;
}

/**
 * Compares two Hebrew letters for equality, treating Sofit and standard forms as equivalent.
 * e.g., 'כ' === 'ך' -> true
 */
export function areHebrewLettersEqual(char1: string, char2: string): boolean {
  if (!char1 || !char2) return false;
  return normalizeHebrewLetter(char1) === normalizeHebrewLetter(char2);
}

/**
 * Compares two Hebrew words for equality with Sofit tolerance and Nikud stripping.
 */
export function areHebrewWordsEqual(word1: string, word2: string): boolean {
  const clean1 = stripHebrewNikud(word1);
  const clean2 = stripHebrewNikud(word2);

  if (clean1.length !== clean2.length) return false;

  for (let i = 0; i < clean1.length; i++) {
    if (!areHebrewLettersEqual(clean1[i], clean2[i])) {
      return false;
    }
  }

  return true;
}
