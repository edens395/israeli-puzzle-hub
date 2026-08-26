import { readFileSync } from 'fs';

// Let's copy the code from the edge function and test the templates

type SolutionGrid = boolean[][];
type Clue = number[];

function calculateLineClue(line: boolean[]): Clue {
  const clue: number[] = [];
  let currentBlock = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i]) {
      currentBlock++;
    } else if (currentBlock > 0) {
      clue.push(currentBlock);
      currentBlock = 0;
    }
  }
  if (currentBlock > 0) clue.push(currentBlock);
  return clue.length > 0 ? clue : [0];
}

function calculateRowClues(solution: SolutionGrid): Clue[] {
  return solution.map((row) => calculateLineClue(row));
}

function calculateColClues(solution: SolutionGrid): Clue[] {
  if (solution.length === 0) return [];
  const width = solution[0].length;
  const colClues: Clue[] = [];
  for (let col = 0; col < width; col++) {
    const colLine: boolean[] = [];
    for (let row = 0; row < solution.length; row++) {
      colLine.push(solution[row][col]);
    }
    colClues.push(calculateLineClue(colLine));
  }
  return colClues;
}

function validateNonogramSolvability(solution: SolutionGrid): { isSolvable: boolean; complexity: number } {
  const height = solution.length;
  const width = solution[0].length;
  const rowClues = calculateRowClues(solution);
  const colClues = calculateColClues(solution);

  let grid: number[][] = Array(height).fill(0).map(() => Array(width).fill(-1));
  let changed = true;
  let iterations = 0;

  function matchesLine(candidate: number[], line: number[]): boolean {
    for (let i = 0; i < candidate.length; i++) {
      if (line[i] !== -1 && candidate[i] !== line[i]) return false;
    }
    return true;
  }

  function solveLineDeduction(line: number[], clues: number[]): number[] {
    const length = line.length;
    const validPossibilities: number[][] = [];

    function generate(index: number, clueIdx: number, current: number[]) {
      if (clueIdx === clues.length) {
        const rest = Array(length - index).fill(0);
        const full = current.concat(rest);
        if (matchesLine(full, line)) validPossibilities.push(full);
        return;
      }
      const clue = clues[clueIdx];
      const minRemaining = clues.slice(clueIdx + 1).reduce((a, b) => a + b + 1, 0);

      for (let start = index; start <= length - clue - minRemaining; start++) {
        const leadingZeros = Array(start - index).fill(0);
        const filled = Array(clue).fill(1);
        const isLastClue = clueIdx === clues.length - 1;
        const separator = isLastClue ? [] : [0];
        const nextCurrent = current.concat(leadingZeros).concat(filled).concat(separator);
        if (matchesLine(nextCurrent, line)) {
          generate(nextCurrent.length, clueIdx + 1, nextCurrent);
        }
      }
    }

    generate(0, 0, []);
    if (validPossibilities.length === 0) return line;

    const result = [...line];
    for (let i = 0; i < length; i++) {
      const firstVal = validPossibilities[0][i];
      const allMatch = validPossibilities.every(p => p[i] === firstVal);
      if (allMatch) result[i] = firstVal;
    }
    return result;
  }

  while (changed && iterations < 50) {
    changed = false;
    iterations++;
    for (let r = 0; r < height; r++) {
      const line = grid[r];
      const clues = rowClues[r];
      const newLine = solveLineDeduction(line, clues);
      for (let c = 0; c < width; c++) {
        if (newLine[c] !== line[c]) { grid[r][c] = newLine[c]; changed = true; }
      }
    }
    for (let c = 0; c < width; c++) {
      const line = grid.map(row => row[c]);
      const clues = colClues[c];
      const newLine = solveLineDeduction(line, clues);
      for (let r = 0; r < height; r++) {
        if (newLine[r] !== grid[r][c]) { grid[r][c] = newLine[r]; changed = true; }
      }
    }
  }

  const isSolvable = grid.every(row => row.every(cell => cell !== -1));
  return { isSolvable, complexity: iterations };
}

const PUZZLE_BANK = [
  {
    title: 'לב ❤️',
    solution: [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ],
  },
  {
    title: 'מגן דוד ✡️',
    solution: [
      [false, false, false, true, true, true, true, false, false, false],
      [false, false, true, false, false, false, false, true, false, false],
      [false, true, false, false, false, false, false, false, true, false],
      [true, true, true, true, true, true, true, true, true, true],
      [false, true, false, false, false, false, false, false, true, false],
      [false, true, false, false, false, false, false, false, true, false],
      [true, true, true, true, true, true, true, true, true, true],
      [false, true, false, false, false, false, false, false, true, false],
      [false, false, true, false, false, false, false, true, false, false],
      [false, false, false, true, true, true, true, false, false, false],
    ],
  },
  {
    title: 'מנורת שבעת הקנים 🕎',
    solution: [
      [true, false, true, false, true, false, true, false, true, false],
      [true, false, true, false, true, false, true, false, true, false],
      [true, true, true, true, true, true, true, true, true, false],
      [true, false, false, false, true, false, false, false, true, false],
      [false, true, true, true, true, true, true, true, false, false],
      [false, false, false, false, true, false, false, false, false, false],
      [false, false, false, false, true, false, false, false, false, false],
      [false, false, false, true, true, true, false, false, false, false],
      [false, false, false, true, true, true, false, false, false, false],
      [false, false, true, true, true, true, true, false, false, false],
    ],
  },
  {
    title: 'סירת מפרש ⛵',
    solution: [
      [false, false, false, false, true, false, false, false, false, false],
      [false, false, false, true, true, false, false, false, false, false],
      [false, false, true, true, true, false, false, false, false, false],
      [false, true, true, true, true, false, false, false, false, false],
      [true, true, true, true, true, false, false, false, false, false],
      [false, false, false, false, true, false, false, false, false, false],
      [true, true, true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, true, true, false, false],
      [false, false, false, true, true, true, true, false, false, false],
    ],
  },
  {
    title: 'תפוח 🍎',
    solution: [
      [false, false, false, false, true, true, false, false, false, false],
      [false, false, false, true, false, false, false, false, false, false],
      [false, true, true, false, false, true, true, true, false, false],
      [true, true, true, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true, true, false],
      [false, true, true, true, true, true, true, true, false, false],
      [false, false, true, true, true, true, true, false, false, false],
      [false, false, false, true, false, true, false, false, false, false],
    ],
  },
  {
    title: 'בית 🏠',
    solution: [
      [false, false, false, false, true, true, false, false, false, false],
      [false, false, false, true, true, true, true, false, false, false],
      [false, false, true, true, true, true, true, true, false, false],
      [false, true, true, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, true, true, false],
      [false, true, true, false, false, true, true, true, true, false],
      [false, true, true, false, false, true, true, true, true, false],
      [false, true, true, true, true, true, true, true, true, false],
      [false, true, true, true, true, true, true, true, true, false],
    ],
  },
  {
    title: 'עוגן ⚓',
    solution: [
      [false, false, false, false, true, true, false, false, false, false],
      [false, false, false, true, false, false, true, false, false, false],
      [false, false, false, false, true, true, false, false, false, false],
      [false, false, true, true, true, true, true, true, false, false],
      [false, false, false, false, true, true, false, false, false, false],
      [false, false, false, false, true, true, false, false, false, false],
      [true, false, false, false, true, true, false, false, false, true],
      [true, true, false, false, true, true, false, false, true, true],
      [false, true, true, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, true, true, false, false],
    ],
  },
  {
    title: 'חללית 🚀',
    solution: [
      [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, true, true, true, false, false, false, false, false, false],
      [false, false, false, false, false, false, true, true, true, false, false, false, false, false, false],
      [false, false, false, false, false, true, true, true, true, true, false, false, false, false, false],
      [false, false, false, false, false, true, true, false, true, true, false, false, false, false, false],
      [false, false, false, false, false, true, true, true, true, true, false, false, false, false, false],
      [false, false, false, false, true, true, true, true, true, true, true, false, false, false, false],
      [false, false, false, false, true, true, true, true, true, true, true, false, false, false, false],
      [false, false, false, true, true, true, true, true, true, true, true, true, false, false, false],
      [false, false, true, true, true, true, true, true, true, true, true, true, true, false, false],
      [false, true, true, false, true, true, true, true, true, true, true, false, true, true, false],
      [true, true, false, false, true, true, true, true, true, true, true, false, false, true, true],
      [true, false, false, false, false, true, true, true, true, true, false, false, false, false, true],
      [false, false, false, false, false, false, true, true, true, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, true, false, false, false, false, false, false],
    ],
  },
  {
    title: 'כתר מלכות 👑',
    solution: [
      [true, false, false, false, false, false, true, true, true, false, false, false, false, false, true],
      [true, true, false, false, false, true, true, true, true, true, false, false, false, true, true],
      [true, true, true, false, true, true, true, true, true, true, true, false, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, true, true, true, true, true, true, true, false, false],
      [false, false, false, true, true, true, true, true, true, true, true, true, false, false, false],
      [false, false, false, true, true, true, true, true, true, true, true, true, false, false, false],
      [false, false, false, true, false, true, false, true, false, true, false, true, false, false, false],
      [false, false, true, true, true, true, true, true, true, true, true, true, true, false, false],
      [false, false, true, true, true, true, true, true, true, true, true, true, true, false, false],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    ],
  },
  {
    title: 'חתול 🐱',
    solution: [
      [true, true, false, false, false, false, false, false, true, true],
      [true, true, true, false, false, false, false, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, false, true, true, true, true, true, true, false, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, false, true, true, false, true, true, true],
      [false, true, true, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, true, true, false, false],
      [false, false, true, true, false, false, true, true, false, false],
      [false, false, true, true, false, false, true, true, false, false],
    ],
  },
];

for (const puzzle of PUZZLE_BANK) {
  const result = validateNonogramSolvability(puzzle.solution);
  console.log(`${puzzle.title}: solvable=${result.isSolvable}, complexity=${result.complexity}`);
}
