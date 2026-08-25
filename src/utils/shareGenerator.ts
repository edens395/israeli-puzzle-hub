export type ShareCategory = 'nonogram' | 'sudoku' | 'tashbetz';

export interface ShareParams {
  category: ShareCategory;
  puzzleTitle: string;
  elapsedSeconds: number;
  streakDays: number;
  gridPreview?: boolean[][];
  difficulty?: string;
}

/**
 * Formats elapsed seconds into mm:ss string.
 */
export function formatSolveTime(sec: number): string {
  const mins = Math.floor(sec / 60);
  const remainderSecs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
}

/**
 * Converts a 2D boolean grid into a compact emoji string representation (max 5x5 for share preview).
 */
export function generateNonogramEmojiGrid(grid: boolean[][]): string {
  if (!grid || grid.length === 0) return '⬛⬛⬛⬛⬛';

  const rowsToTake = Math.min(5, grid.length);
  const colsToTake = Math.min(5, grid[0].length);

  const lines: string[] = [];
  for (let r = 0; r < rowsToTake; r++) {
    let line = '';
    for (let c = 0; c < colsToTake; c++) {
      line += grid[r][c] ? '⬛' : '⬜';
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Generates Wordle-style Hebrew text string for native social sharing.
 */
export function generateShareText(params: ShareParams): string {
  const { category, puzzleTitle, elapsedSeconds, streakDays, gridPreview, difficulty } = params;

  const categoryNames: Record<ShareCategory, string> = {
    nonogram: 'שחור ופתור',
    sudoku: 'סודוקו',
    tashbetz: 'מיני-תשחץ',
  };

  const formattedTime = formatSolveTime(elapsedSeconds);
  const categoryName = categoryNames[category];

  let body = '';

  if (category === 'nonogram' && gridPreview) {
    const emojiGrid = generateNonogramEmojiGrid(gridPreview);
    body = `\n${emojiGrid}\n`;
  } else if (category === 'sudoku') {
    const diffLabel = difficulty ? ` (${difficulty})` : '';
    body = `\n🧩 רמת קושי: ${diffLabel}\n🎯 100% דיוק ללא שגיאות!\n`;
  } else {
    body = `\n✍️ פתרון מלא בהגדרות עבריות!\n`;
  }

  return [
    `המוסף היומי 🗞️`,
    `${categoryName} - ${puzzleTitle} | ⏱️ ${formattedTime}`,
    body,
    `🔥 רצף יומי: ${streakDays} ימים`,
    ``,
    `פתרתי ב״המוסף - העיתון של המדינה״ 🧩`,
    `https://hamusaf.app`,
  ].join('\n');
}

/**
 * Invokes native mobile Share sheet with Hebrew puzzle achievement text.
 */
export async function shareAchievement(params: ShareParams): Promise<boolean> {
  const shareText = generateShareText(params);
  try {
    // Dynamic import to allow pure Node unit test execution without React Native bridge
    const { Share } = require('react-native');
    const result = await Share.share({
      message: shareText,
      title: 'הישג במוסף היומי 🗞️',
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.warn('Native share failed or unhandled in current environment', error);
    return false;
  }
}
