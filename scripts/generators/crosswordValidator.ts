import { areHebrewLettersEqual } from '../../src/features/wordpuzzle/logic/hebrewUtils';

export interface RawCrosswordClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  startRow: number;
  startCol: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that intersecting cells between Across and Down clues match symmetrically with Hebrew Sofiot tolerance.
 */
export function validateCrosswordIntersections(
  clues: RawCrosswordClue[]
): ValidationResult {
  const cellMap = new Map<string, { letter: string; clueId: string }>();
  const errors: string[] = [];

  clues.forEach((clue) => {
    const { id: clueId, direction, answer, startRow, startCol } = clue;
    const length = answer.length;

    const deltaRow = direction === 'down' ? 1 : 0;
    const deltaCol = direction === 'across' ? -1 : 0;

    let r = startRow;
    let c = startCol;

    for (let i = 0; i < length; i++) {
      const posKey = `${r},${c}`;
      const letter = answer[i];

      if (cellMap.has(posKey)) {
        const existing = cellMap.get(posKey)!;
        if (!areHebrewLettersEqual(existing.letter, letter)) {
          errors.push(
            `Conflict at grid cell (${r}, ${c}): Clue '${existing.clueId}' has letter '${existing.letter}' but clue '${clueId}' has letter '${letter}'`
          );
        }
      } else {
        cellMap.set(posKey, { letter, clueId });
      }

      r += deltaRow;
      c += deltaCol;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
