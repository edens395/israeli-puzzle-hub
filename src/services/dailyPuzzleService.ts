import { createInitialBoard } from '../features/nonogram/logic/nonogramUtils';
import { NonogramBoard, SolutionGrid } from '../features/nonogram/types/nonogram';
import { getTodayDateString } from '../storage/puzzleRepository';
import { generatorEngine } from './generatorEngine';
import { supabase } from './supabaseClient';

/**
 * Adds 1 calendar day to a YYYY-MM-DD date string without timezone shifts
 */
export function addOneCalendarDay(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;

  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + 1);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${dd}`;
}

/**
 * Subtracts 1 calendar day from a YYYY-MM-DD date string without timezone shifts
 */
export function subtractOneCalendarDay(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;

  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 1);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${dd}`;
}

export const dailyPuzzleService = {
  /**
   * Fetches daily Nonogram puzzle for a specific date (defaults to today) from Supabase.
   * If no puzzle exists for this date, automatically generates and publishes a new dynamic Nonogram on the fly!
   */
  async getDailyNonogram(dateInput: Date | string = new Date()): Promise<NonogramBoard | null> {
    try {
      const dateStr = getTodayDateString(dateInput);

      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*')
        .eq('date_string', dateStr)
        .eq('category', 'nonogram')
        .maybeSingle();

      if (data) {
        const solution: SolutionGrid = data.solution;
        const board = createInitialBoard(data.id || `nonogram_${dateStr}`, data.title, solution);
        return board;
      }

      // If missing from Supabase, dynamically generate and publish a fresh, unique Nonogram on the fly for dateStr!
      console.log(`✨ Generating dynamic Nonogram on the fly for date ${dateStr}...`);
      const genRes = await generatorEngine.generatePuzzleForDate(dateStr);
      if (genRes.success && genRes.puzzle) {
        return createInitialBoard(genRes.puzzle.id, genRes.puzzle.title, genRes.puzzle.solution);
      }

      return null;
    } catch (e) {
      console.warn('Failed fetching daily Nonogram from Supabase:', e);
      return null;
    }
  },

  /**
   * Inserts or upserts a daily puzzle into Supabase
   */
  async publishDailyPuzzle(
    dateString: string,
    title: string,
    solution: SolutionGrid,
    category: string = 'nonogram'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const width = solution[0]?.length || 5;
      const height = solution.length;
      
      const board = createInitialBoard(`puzzle_${dateString}`, title, solution);

      const payload = {
        date_string: dateString,
        category,
        title,
        width,
        height,
        solution,
        row_clues: board.rowClues,
        col_clues: board.colClues,
        created_at: new Date().toISOString(),
      };

      // 1. Try Upsert with onConflict date_string
      let { error } = await supabase
        .from('daily_puzzles')
        .upsert(payload, { onConflict: 'date_string' });

      // 2. If onConflict specifies no constraint, fallback to standard Insert
      if (error && error.message.includes('onConflict')) {
        const insertRes = await supabase.from('daily_puzzles').insert(payload);
        error = insertRes.error;
      }

      if (error) {
        console.warn('❌ Failed publishing puzzle to Supabase:', error.message, error.details);
        return { success: false, error: error.message };
      }

      console.log('✅ Daily puzzle successfully published to Supabase:', dateString, title);
      return { success: true };
    } catch (e: any) {
      console.warn('Error publishing daily puzzle:', e);
      return { success: false, error: e?.message || 'Unknown error' };
    }
  },

  /**
   * Scans all scheduled future Nonograms in Supabase, removes any duplicates,
   * and re-indexes them sequentially starting from today to eliminate all date gaps.
   */
  async repairAllPuzzleGaps(): Promise<boolean> {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: allPuzzles, error } = await supabase
        .from('daily_puzzles')
        .select('*')
        .gte('date_string', todayStr)
        .eq('category', 'nonogram')
        .order('date_string', { ascending: true });

      if (error || !allPuzzles || allPuzzles.length === 0) return true;

      // Deduplicate puzzles by title & solution matrix key
      const uniquePuzzles: typeof allPuzzles = [];
      const seenKeys = new Set<string>();

      for (const p of allPuzzles) {
        const key = `${p.title}_${JSON.stringify(p.solution)}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniquePuzzles.push(p);
        }
      }

      // Check if re-indexing is needed
      let startDateStr = uniquePuzzles[0].date_string;
      let currDateStr = startDateStr;
      let needsReindex = allPuzzles.length !== uniquePuzzles.length;

      for (let i = 0; i < uniquePuzzles.length; i++) {
        if (uniquePuzzles[i].date_string !== currDateStr) {
          needsReindex = true;
          break;
        }
        currDateStr = addOneCalendarDay(currDateStr);
      }

      if (!needsReindex) return true;

      console.log('🔄 Re-indexing future puzzles to compress gaps and remove duplicates...');

      // Delete all future puzzles currently in Supabase
      const dateStringsToDelete = allPuzzles.map(p => p.date_string);
      for (const ds of dateStringsToDelete) {
        await supabase.from('daily_puzzles').delete().eq('date_string', ds);
      }

      // Re-insert unique puzzles with continuous day-by-day dates
      let assignDateStr = startDateStr;
      for (const puzzle of uniquePuzzles) {
        await this.publishDailyPuzzle(assignDateStr, puzzle.title, puzzle.solution, puzzle.category || 'nonogram');
        assignDateStr = addOneCalendarDay(assignDateStr);
      }

      return true;
    } catch (e) {
      console.warn('Error during repairAllPuzzleGaps:', e);
      return false;
    }
  },

  /**
   * Deletes a daily puzzle at targetDateString, deduplicates the table,
   * and re-indexes all remaining puzzles to fill the gap.
   */
  async deleteAndShiftDailyPuzzles(targetDateString: string): Promise<boolean> {
    try {
      // 1. Delete target puzzle at targetDateString
      const { error: deleteErr } = await supabase
        .from('daily_puzzles')
        .delete()
        .eq('date_string', targetDateString);

      if (deleteErr) {
        console.warn('Failed deleting puzzle:', deleteErr.message);
        return false;
      }

      // 2. Automatically deduplicate and compress all remaining puzzle gaps
      await this.repairAllPuzzleGaps();

      return true;
    } catch (e) {
      console.warn('Error during delete and shift operation:', e);
      return false;
    }
  },

  /**
   * Deletes a daily puzzle from Supabase by date_string
   */
  async deleteDailyPuzzle(dateString: string): Promise<boolean> {
    return this.deleteAndShiftDailyPuzzles(dateString);
  },

  /**
   * Fetches all published daily puzzles from Supabase for dates <= today, ordered by date_string descending
   */
  async getPastDailyPuzzles(category: string = 'nonogram'): Promise<Array<{
    id: string;
    date_string: string;
    category: string;
    title: string;
    solution: any;
  }>> {
    try {
      const todayStr = getTodayDateString(new Date());
      let query = supabase
        .from('daily_puzzles')
        .select('*')
        .lte('date_string', todayStr)
        .order('date_string', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch (e) {
      console.warn('Error fetching past daily puzzles:', e);
      return [];
    }
  },
};
