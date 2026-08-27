import { validateNonogramSolvability } from '../features/nonogram/logic/nonogramSolver';
import { SolutionGrid } from '../features/nonogram/types/nonogram';

export interface ProceduralPuzzle {
  title: string;
  solution: SolutionGrid;
  width: number;
  height: number;
}

// Pixel art shape templates & procedural variation generators


/**
 * Generates a unique, solvable procedural Nonogram for a target date
 */
// Simple PRNG
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateSymmetricFallbackGrid(seed: number, size: number = 15): SolutionGrid {
  const random = mulberry32(seed);
  let grid: SolutionGrid = [];
  let attempts = 0;
  
  while (attempts < 200) {
    attempts++;
    grid = [];
    for (let r = 0; r < size; r++) {
      let row = new Array(size).fill(false);
      for (let c = 0; c < Math.ceil(size / 2); c++) {
        const val = random() > 0.4;
        row[c] = val;
        row[size - 1 - c] = val; // symmetric
      }
      grid.push(row);
    }
    
    if (validateNonogramSolvability(grid).isSolvable) {
      return grid;
    }
  }
  
  // If we really can't find one, return a basic cross (always solvable)
  grid = Array(size).fill(0).map(() => Array(size).fill(false));
  for (let i = 0; i < size; i++) {
    grid[i][Math.floor(size/2)] = true;
    grid[Math.floor(size/2)][i] = true;
  }
  return grid;
}

export function generateProceduralPuzzleForDate(dateStr: string): ProceduralPuzzle {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const size = (seed % 2 === 0) ? 15 : 20;
  const solution = generateSymmetricFallbackGrid(seed, size);

  return {
    title: `תבנית ${size}x${size} אבסטרקטית 🧩`,
    solution,
    width: size,
    height: size,
  };
}
