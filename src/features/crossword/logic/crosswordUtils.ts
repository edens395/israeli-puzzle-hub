import {
  CellPosition,
  ClueItem,
  CrosswordCellState,
  CrosswordDirection,
  CrosswordPuzzle,
} from '../types/crossword';

export interface RawCrosswordClueInput {
  id: string;
  number: number;
  direction: CrosswordDirection;
  text: string;
  answer: string;
  startRow: number;
  startCol: number;
}

/**
 * Constructs a CrosswordPuzzle matrix from raw clue definitions with RTL word vector calculation.
 */
export function createCrosswordBoard(
  id: string,
  title: string,
  rows: number,
  cols: number,
  rawClues: RawCrosswordClueInput[]
): CrosswordPuzzle {
  const grid: CrosswordCellState[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      solutionLetter: '',
      userLetter: '',
      isBlocked: true, // Default blocked square until populated
    }))
  );

  const processedAcross: ClueItem[] = [];
  const processedDown: ClueItem[] = [];

  rawClues.forEach((raw) => {
    const { id: clueId, number: clueNum, direction, text, answer, startRow, startCol } = raw;
    const length = answer.length;
    const cellPositions: CellPosition[] = [];

    // Across words in Hebrew RTL flow Right-to-Left (column index decreases if col 0 is left)
    const deltaRow = direction === 'down' ? 1 : 0;
    const deltaCol = direction === 'across' ? -1 : 0;

    let r = startRow;
    let c = startCol;

    for (let i = 0; i < length; i++) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) break;

      cellPositions.push({ row: r, col: c });

      const cell = grid[r][c];
      cell.isBlocked = false;
      cell.solutionLetter = answer[i];

      if (i === 0) {
        // Assign clue number to corner
        cell.clueNumber = cell.clueNumber ? Math.min(cell.clueNumber, clueNum) : clueNum;
      }

      if (direction === 'across') {
        cell.acrossClueId = clueId;
        if (i === length - 1) cell.isAcrossEnd = true;
      } else {
        cell.downClueId = clueId;
        if (i === length - 1) cell.isDownEnd = true;
      }

      r += deltaRow;
      c += deltaCol;
    }

    const item: ClueItem = {
      id: clueId,
      number: clueNum,
      direction,
      text,
      answer,
      startRow,
      startCol,
      length,
      cellPositions,
    };

    if (direction === 'across') {
      processedAcross.push(item);
    } else {
      processedDown.push(item);
    }
  });

  return {
    id,
    title,
    rows,
    cols,
    clues: {
      across: processedAcross,
      down: processedDown,
    },
    grid,
    isCompleted: false,
    elapsedSeconds: 0,
  };
}

// Preset verified 5x5 Hebrew Mini-Tashbetz Puzzles
export const SAMPLE_CROSSWORD_PUZZLES: CrosswordPuzzle[] = [
  createCrosswordBoard('mini-tashbetz-1', 'מיני-תשחץ #1 • ירושלים ושלום', 5, 5, [
    {
      id: 'a1',
      number: 1,
      direction: 'across',
      text: 'ברכת פגישה ופרידה בעברית 🤝',
      answer: 'שלום',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'a2',
      number: 2,
      direction: 'across',
      text: 'צמח צבעוני בגינה 🌸',
      answer: 'פרח',
      startRow: 2,
      startCol: 4,
    },
    {
      id: 'a3',
      number: 3,
      direction: 'across',
      text: 'מאירה בשמיים ביום ☀️',
      answer: 'שמש',
      startRow: 4,
      startCol: 3,
    },
    {
      id: 'd1',
      number: 1,
      direction: 'down',
      text: 'תוקעים בו בראש השנה 📯',
      answer: 'שופר',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'd2',
      number: 4,
      direction: 'down',
      text: 'חלק גוף עליון / מנהיג 👑',
      answer: 'ראש',
      startRow: 2,
      startCol: 3,
    },
  ]),

  createCrosswordBoard('mini-tashbetz-2', 'מיני-תשחץ #2 • כוכבים וברקים', 5, 5, [
    {
      id: 'a1',
      number: 1,
      direction: 'across',
      text: 'זורח בשמי הלילה ⭐',
      answer: 'כוכב',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'a2',
      number: 2,
      direction: 'across',
      text: 'אור חזק בסופה ⚡',
      answer: 'ברק',
      startRow: 2,
      startCol: 4,
    },
    {
      id: 'a3',
      number: 3,
      direction: 'across',
      text: 'מאכל מתוק של ראש השנה 🍯',
      answer: 'דבש',
      startRow: 4,
      startCol: 3,
    },
    {
      id: 'd1',
      number: 1,
      direction: 'down',
      text: 'חברו הטוב של האדם 🐶',
      answer: 'כלב',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'd2',
      number: 4,
      direction: 'down',
      text: 'זז לפי המנגינה 💃',
      answer: 'רקד',
      startRow: 2,
      startCol: 3,
    },
  ]),

  createCrosswordBoard('mini-tashbetz-3', 'מיני-תשחץ #3 • שבת מנוחה', 5, 5, [
    {
      id: 'a1',
      number: 1,
      direction: 'across',
      text: 'היום השביעי בשבוע 🕯️',
      answer: 'שבת',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'a2',
      number: 2,
      direction: 'across',
      text: 'ידיד קרוב ונאמן 🤝',
      answer: 'חבר',
      startRow: 2,
      startCol: 4,
    },
    {
      id: 'a3',
      number: 3,
      direction: 'across',
      text: 'דרך עירונית לנסיעה 🛣️',
      answer: 'רחוב',
      startRow: 4,
      startCol: 3,
    },
    {
      id: 'd1',
      number: 1,
      direction: 'down',
      text: 'מאושר וטוב לב 😄',
      answer: 'שמח',
      startRow: 0,
      startCol: 4,
    },
    {
      id: 'd2',
      number: 4,
      direction: 'down',
      text: 'חפירה עמוקה באדמה 🕳️',
      answer: 'בור',
      startRow: 0,
      startCol: 3,
    },
    {
      id: 'd3',
      number: 5,
      direction: 'down',
      text: 'אוויר בתנועה / נשמה 🌬️',
      answer: 'רוח',
      startRow: 2,
      startCol: 2,
    },
  ]),
];
