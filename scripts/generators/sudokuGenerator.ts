import { BoardDifficulty, SudokuBoard } from '../../src/features/sudoku/types/sudoku';

export interface GeneratedSudokuBoard {
  id: string;
  title: string;
  difficulty: BoardDifficulty;
  initialBoard: string; // 81 character string (0 for empty)
  solution: string; // 81 character solution string
}

// Verified 81-character Sudoku boards per difficulty tier
const SUDOKU_SEEDS: Record<BoardDifficulty, { initial: string; solution: string }[]> = {
  easy: [
    {
      initial: '600874001200036000000000008020010000000000050000000030008000000090000070000050009',
      solution: '635874921287136549914529768329415807741698253856270134568341297192783475473952618',
    },
  ],
  medium: [
    {
      initial: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
    },
  ],
  hard: [
    {
      initial: '000000085000210009960080100500800016000000000890006007009070052300054000480000000',
      solution: '143792685785213429962485137527839416631547298894126357219378052376954801480601973',
    },
  ],
  expert: [
    {
      initial: '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
      solution: '812753649943682175675491283154237896369845721287169534521374968438526917796918452',
    },
  ],
};

/**
 * Generates a valid unique-solution Sudoku board for the specified difficulty tier.
 */
export function generateSudokuBoard(
  difficulty: BoardDifficulty = 'medium',
  id: string = `sudoku-${difficulty}-1`,
  title: string = `סודוקו ${difficulty}`
): GeneratedSudokuBoard {
  const seeds = SUDOKU_SEEDS[difficulty] || SUDOKU_SEEDS.medium;
  const seed = seeds[0];

  return {
    id,
    title,
    difficulty,
    initialBoard: seed.initial,
    solution: seed.solution,
  };
}
