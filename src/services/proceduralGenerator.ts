import { validateNonogramSolvability } from '../features/nonogram/logic/nonogramSolver';
import { SolutionGrid } from '../features/nonogram/types/nonogram';

export interface ProceduralPuzzle {
  title: string;
  solution: SolutionGrid;
  width: number;
  height: number;
}

// Pixel art shape templates & procedural variation generators
const DRAWING_TEMPLATES: { title: string; base: boolean[][] }[] = [
  {
    title: 'לב ❤️',
    base: [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ],
  },
  {
    title: 'מגן דוד ✡️',
    base: [
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
    base: [
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
    base: [
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
    base: [
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
    base: [
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
    base: [
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
    base: [
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
    base: [
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
    base: [
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

/**
 * Generates a unique, solvable procedural Nonogram for a target date
 */
export function generateProceduralPuzzleForDate(dateStr: string): ProceduralPuzzle {
  // Convert dateStr (e.g. '2026-09-02') into integer hash seed
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // Pick drawing template based on seed
  const templateIdx = seed % DRAWING_TEMPLATES.length;
  const template = DRAWING_TEMPLATES[templateIdx];

  // Make deep copy of solution
  let solution: SolutionGrid = template.base.map(row => [...row]);
  const width = solution[0].length;
  const height = solution.length;

  // Verify solvability
  const { isSolvable } = validateNonogramSolvability(solution);

  if (!isSolvable) {
    // If not solvable, fallback to 5x5 heart
    solution = DRAWING_TEMPLATES[0].base.map(r => [...r]);
    return {
      title: DRAWING_TEMPLATES[0].title,
      solution,
      width: 5,
      height: 5,
    };
  }

  return {
    title: template.title,
    solution,
    width,
    height,
  };
}
