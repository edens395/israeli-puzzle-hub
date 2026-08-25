import { createInitialBoard } from '../logic/nonogramUtils';
import { NonogramBoard, SolutionGrid } from '../types/nonogram';

// 5x5 Heart Pattern (לב)
const heartSolution: SolutionGrid = [
  [false, true, false, true, false],
  [true, true, true, true, true],
  [true, true, true, true, true],
  [false, true, true, true, false],
  [false, false, true, false, false],
];

// 10x10 Star of David (מגן דוד)
const starSolution: SolutionGrid = [
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
];

// 10x10 Menorah (מנורה)
const menorahSolution: SolutionGrid = [
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
];

export const SAMPLE_PUZZLES: NonogramBoard[] = [
  createInitialBoard('puzzle-heart', 'לב (5x5)', heartSolution),
  createInitialBoard('puzzle-star', 'מגן דוד (10x10)', starSolution),
  createInitialBoard('puzzle-menorah', 'מנורת שבעת הקנים (10x10)', menorahSolution),
];
