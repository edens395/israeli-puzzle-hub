import { dailyPuzzleService } from '../src/services/dailyPuzzleService';
import { PUZZLE_BANK } from './generateSqlInsert';

export async function seedDatabase(): Promise<void> {
  console.log('🚀 Starting daily puzzles database seed...');
  const today = new Date();

  for (let i = 0; i < PUZZLE_BANK.length; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];

    const puzzle = PUZZLE_BANK[i];
    console.log(`Publishing Day ${i + 1} (${dateStr}): ${puzzle.title} (${puzzle.solution[0].length}x${puzzle.solution.length})`);
    await dailyPuzzleService.publishDailyPuzzle(dateStr, puzzle.title, puzzle.solution, 'nonogram');
  }

  console.log('✅ Daily puzzles seed script execution finished!');
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
