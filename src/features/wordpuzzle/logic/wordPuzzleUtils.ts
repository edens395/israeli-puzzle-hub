import {
  CellPosition,
  Orientation,
  WordCell,
  WordClue,
  WordPuzzle,
} from '../types/wordPuzzle';

export interface RawClueInput {
  id: string;
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  orientation: Orientation;
}

/**
 * Creates a fully initialized WordPuzzle matrix object from a list of raw clue definitions.
 */
export function createWordPuzzle(
  id: string,
  title: string,
  rows: number,
  cols: number,
  rawClues: RawClueInput[]
): WordPuzzle {
  // Initialize empty grid matrix
  const grid: WordCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      solutionLetter: '',
      userLetter: '',
      isBlocked: true, // Default to blocked until populated by a clue word
    }))
  );

  const processedAcrossClues: WordClue[] = [];
  const processedDownClues: WordClue[] = [];

  rawClues.forEach((raw) => {
    const { id: clueId, number: clueNum, clue, answer, startRow, startCol, orientation } = raw;
    const length = answer.length;
    const cellPositions: CellPosition[] = [];

    // In Hebrew Tashbetz, Across words flow Right-to-Left (column index decreases if matrix col 0 is Left),
    // OR Left-to-Right depending on grid coordinates. Here we follow standard cell coordinate steps:
    const deltaRow = orientation === 'down' ? 1 : 0;
    const deltaCol = orientation === 'across' ? -1 : 0; // RTL across flow: col decreases!

    let r = startRow;
    let c = startCol;

    for (let i = 0; i < length; i++) {
      cellPositions.push({ row: r, col: c });

      const cell = grid[r][c];
      cell.isBlocked = false;
      cell.solutionLetter = answer[i];

      if (i === 0) {
        cell.clueNumber = clueNum;
      }

      if (orientation === 'across') {
        cell.acrossWordId = clueId;
        cell.acrossIndex = i;
        if (i === length - 1) {
          cell.isAcrossEnd = true;
        }
      } else {
        cell.downWordId = clueId;
        cell.downIndex = i;
        if (i === length - 1) {
          cell.isDownEnd = true;
        }
      }

      r += deltaRow;
      c += deltaCol;
    }

    const wordClue: WordClue = {
      id: clueId,
      number: clueNum,
      clue,
      answer,
      startCell: { row: startRow, col: startCol },
      length,
      orientation,
      cellPositions,
    };

    if (orientation === 'across') {
      processedAcrossClues.push(wordClue);
    } else {
      processedDownClues.push(wordClue);
    }
  });

  return {
    id,
    title,
    rows,
    cols,
    clues: {
      across: processedAcrossClues,
      down: processedDownClues,
    },
    grid,
    isCompleted: false,
    elapsedSeconds: 0,
  };
}
