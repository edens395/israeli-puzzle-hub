import { calculateColClues, calculateRowClues } from '../src/features/nonogram/logic/nonogramUtils';
import { SolutionGrid } from '../src/features/nonogram/types/nonogram';

export interface PuzzleBankItem {
  title: string;
  solution: SolutionGrid;
}

// 10 Curated Pixel Art Drawings (5x5, 10x10, 15x15)
export const PUZZLE_BANK: PuzzleBankItem[] = [
  // Day 1 (Today): 5x5 Heart (לב ❤️)
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
  // Day 2: 10x10 Star of David (מגן דוד ✡️)
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
  // Day 3: 10x10 Menorah (מנורה 🕎)
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
  // Day 4: 10x10 Sailboat (סירה ⛵)
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
  // Day 5: 10x10 Apple (תפוח 🍎)
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
  // Day 6: 10x10 House (בית 🏠)
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
  // Day 7: 10x10 Anchor (עוגן ⚓)
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
  // Day 8: 15x15 Rocket (חללית 🚀)
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
  // Day 9: 15x15 Crown (כתר מלכות 👑)
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
  // Day 10: 10x10 Cat (חתול 🐱)
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

export function generateSqlStatements(): string {
  let sql = `-- ==========================================================\n`;
  sql += `-- AUTOMATED 10-DAY NONOGRAM PUZZLES INSERT SCRIPT FOR SUPABASE\n`;
  sql += `-- Includes 5x5, 10x10, and 15x15 varied pixel-art grids\n`;
  sql += `-- ==========================================================\n\n`;

  sql += `INSERT INTO public.daily_puzzles (date_string, category, title, width, height, solution, row_clues, col_clues)\nVALUES\n`;

  const valuesClauses: string[] = [];

  PUZZLE_BANK.forEach((item, index) => {
    const width = item.solution[0].length;
    const height = item.solution.length;
    const rowClues = calculateRowClues(item.solution);
    const colClues = calculateColClues(item.solution);

    const solutionJson = JSON.stringify(item.solution);
    const rowCluesJson = JSON.stringify(rowClues);
    const colCluesJson = JSON.stringify(colClues);

    // CURRENT_DATE + index days
    const dateExpr = index === 0 ? `CURRENT_DATE` : `CURRENT_DATE + INTERVAL '${index} days'`;

    valuesClauses.push(
      `  (${dateExpr}, 'nonogram', '${item.title}', ${width}, ${height}, '${solutionJson}'::jsonb, '${rowCluesJson}'::jsonb, '${colCluesJson}'::jsonb)`
    );
  });

  sql += valuesClauses.join(',\n');
  sql += `\nON CONFLICT (date_string) DO UPDATE SET\n`;
  sql += `  title = EXCLUDED.title,\n`;
  sql += `  width = EXCLUDED.width,\n`;
  sql += `  height = EXCLUDED.height,\n`;
  sql += `  solution = EXCLUDED.solution,\n`;
  sql += `  row_clues = EXCLUDED.row_clues,\n`;
  sql += `  col_clues = EXCLUDED.col_clues;\n`;

  return sql;
}

if (require.main === module) {
  console.log(generateSqlStatements());
}
