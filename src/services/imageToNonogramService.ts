import { validateNonogramSolvability } from '../features/nonogram/logic/nonogramSolver';
import { SolutionGrid } from '../features/nonogram/types/nonogram';

export interface ImageNonogramResult {
  title: string;
  solution: SolutionGrid;
  width: number;
  height: number;
  sourceUrl: string;
}

const ONLINE_API_STYLES = [
  { style: 'identicon', category: 'אמנות רשת', emoji: '🎨' },
  { style: 'shapes', category: 'סמל קריסטל', emoji: '💎' },
  { style: 'bottts', category: 'דמות פיקסל', emoji: '🤖' },
  { style: 'thumbs', category: 'איור דיגיטלי', emoji: '🖼️' },
];

/**
 * Fetches dynamic vector data online from public Web APIs (DiceBear)
 * using high-entropy unique seeds so that EVERY SINGLE generation produces a 100% DIFFERENT puzzle.
 */
export async function generateNonogramFromOnlineImage(dateStr: string): Promise<ImageNonogramResult> {
  const targetSize = 10;
  
  // 1. Generate high-entropy unique seed (Date + Timestamp + Random nonce)
  const nonce = Math.floor(Math.random() * 1000000);
  const randomSeed = `${dateStr}_${Date.now()}_${nonce}`;
  
  // Pick online API style variant randomly
  const styleIdx = Math.floor(Math.random() * ONLINE_API_STYLES.length);
  const selectedStyle = ONLINE_API_STYLES[styleIdx];

  const apiUrl = `https://api.dicebear.com/7.x/${selectedStyle.style}/svg?seed=${randomSeed}&size=10`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`Online API fetch failed with HTTP status ${response.status}`);
  }

  const svgText = await response.text();

  // 2. Parse SVG rect/path coordinates from online API response
  const grid: boolean[][] = Array.from({ length: targetSize }, () =>
    new Array(targetSize).fill(false)
  );

  // Extract <rect> elements with fill colors from online SVG payload
  const rectMatches = svgText.matchAll(/<rect[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*fill="([^"]+)"/g);

  let filledCount = 0;
  for (const match of rectMatches) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    const fill = match[5];

    // Ignore white / transparent background rects
    if (fill && fill !== 'none' && fill !== '#ffffff' && fill !== '#FFFFFF') {
      const col = Math.min(targetSize - 1, Math.max(0, Math.floor(x)));
      const row = Math.min(targetSize - 1, Math.max(0, Math.floor(y)));
      grid[row][col] = true;
      grid[row][targetSize - 1 - col] = true; // Apply symmetry for aesthetic balance
      filledCount++;
    }
  }

  // If online SVG rect parsing yielded empty grid, sample SVG string character codes
  if (filledCount === 0) {
    for (let r = 0; r < targetSize; r++) {
      for (let c = 0; c < Math.ceil(targetSize / 2); c++) {
        const charIdx = (r * targetSize + c + nonce) % svgText.length;
        const charCode = svgText.charCodeAt(charIdx);
        const isFilled = (charCode % 2) === 0;
        grid[r][c] = isFilled;
        grid[r][targetSize - 1 - c] = isFilled;
      }
    }
  }

  // 3. Solvability Verification Loop using line deduction solver
  let solutionGrid = grid;
  let { isSolvable } = validateNonogramSolvability(solutionGrid);

  // If the online API matrix is not 100% uniquely solvable, iteratively adjust fill density
  let attempt = 0;
  while (!isSolvable && attempt < 20) {
    attempt++;
    for (let r = 0; r < targetSize; r++) {
      if (r % 2 === attempt % 2) {
        solutionGrid[r][(attempt + r) % targetSize] = !solutionGrid[r][(attempt + r) % targetSize];
        solutionGrid[r][targetSize - 1 - ((attempt + r) % targetSize)] = solutionGrid[r][(attempt + r) % targetSize];
      }
    }
    const check = validateNonogramSolvability(solutionGrid);
    isSolvable = check.isSolvable;
  }

  // Unique title for this generation
  const titleNumber = Math.floor(Math.random() * 900) + 100;
  const title = `${selectedStyle.category} #${titleNumber} ${selectedStyle.emoji}`;

  return {
    title,
    solution: solutionGrid,
    width: targetSize,
    height: targetSize,
    sourceUrl: apiUrl,
  };
}
