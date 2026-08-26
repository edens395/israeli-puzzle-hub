import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";

// CORS headers for browser/app access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------
// Logic Functions (ported from existing logic to avoid deps)
// ---------------------------------------------------------

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

function addOneCalendarDay(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

// Same bank from generateSqlInsert.ts
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

// ---------------------------------------------------------
// Main Handler
// ---------------------------------------------------------

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('Authorization') || '';
    const expectedSecret = Deno.env.get('ADMIN_SECRET');

    if (!expectedSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfiguration: ADMIN_SECRET not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Initialize Supabase Client (Service Role for admin overrides)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Find Next Missing Date
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: upcoming, error: upcomingError } = await supabase
      .from('daily_puzzles')
      .select('date_string, title')
      .gt('date_string', todayStr)
      .eq('category', 'nonogram')
      .order('date_string', { ascending: true });

    if (upcomingError) {
      throw new Error(`DB Error: ${upcomingError.message}`);
    }

    let nextMissingDate = addOneCalendarDay(todayStr); // Start at tomorrow
    const recentTitles = new Set<string>();

    if (upcoming && upcoming.length > 0) {
      for (const puzzle of upcoming) {
        if (puzzle.date_string === nextMissingDate) {
          nextMissingDate = addOneCalendarDay(nextMissingDate);
        } else {
          // Gap found!
          break;
        }
        recentTitles.add(puzzle.title);
      }
    }

    // 4. Select Source Image
    let availableTemplates = PUZZLE_BANK.filter(p => !recentTitles.has(p.title));
    if (availableTemplates.length === 0) {
      // If we've scheduled all templates recently, just fallback to the full bank
      availableTemplates = PUZZLE_BANK;
    }

    // Filter to ensure we only pick templates that are actually solvable by line deduction
    availableTemplates = availableTemplates.filter(template => {
      return validateNonogramSolvability(template.solution).isSolvable;
    });

    if (availableTemplates.length === 0) {
      throw new Error("No uniquely solvable templates available.");
    }

    // Pick random template
    const templateIndex = Math.floor(Math.random() * availableTemplates.length);
    const template = availableTemplates[templateIndex];
    
    // Deep copy solution grid
    const solution = template.solution.map(row => [...row]);
    const width = solution[0].length;
    const height = solution.length;

    // 5. Calculate clues
    const rowClues = calculateRowClues(solution);
    const colClues = calculateColClues(solution);

    // 6. Insert Puzzle
    const payload = {
      date_string: nextMissingDate,
      category: 'nonogram',
      title: template.title,
      width,
      height,
      solution,
      row_clues: rowClues,
      col_clues: colClues
    };

    // ON CONFLICT DO NOTHING to prevent race conditions
    // Using Postgres UPSERT syntax via Supabase RPC or Insert
    // But direct insertion with unique constraint handles this.
    const { data: inserted, error: insertError } = await supabase
      .from('daily_puzzles')
      .insert(payload)
      .select()
      .maybeSingle();

    if (insertError) {
      // Code 23505 is Unique Violation in Postgres
      if (insertError.code === '23505') {
        throw new Error(`Conflict: A puzzle for ${nextMissingDate} was just created by another process.`);
      }
      throw new Error(`Failed to save puzzle: ${insertError.message}`);
    }

    if (!inserted) {
      // Race condition occurred, and ON CONFLICT DO NOTHING returned null
      throw new Error(`Conflict: Puzzle for ${nextMissingDate} already exists.`);
    }

    // 7. Log Success
    await supabase.from('puzzle_generation_logs').insert({
      date_string: nextMissingDate,
      status: 'success',
      message: `Generated via Edge Function: ${template.title}`,
      puzzle_title: template.title,
      grid_size: `${width}x${height}`
    });

    return new Response(
      JSON.stringify({
        success: true,
        date: nextMissingDate,
        nonogram: {
          id: inserted.id.toString(),
          title: inserted.title,
          width: inserted.width,
          height: inserted.height,
          rowClues: inserted.row_clues,
          colClues: inserted.col_clues,
          solution: inserted.solution
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Generation Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
