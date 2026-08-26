import { validateNonogramSolvability } from '../features/nonogram/logic/nonogramSolver';
import { SolutionGrid } from '../features/nonogram/types/nonogram';
import { dailyPuzzleService } from './dailyPuzzleService';
import { generateNonogramFromOnlineImage } from './imageToNonogramService';
import { supabase } from './supabaseClient';

export interface GenerationLogItem {
  id: string;
  date_string: string;
  status: 'success' | 'failed';
  message: string;
  puzzle_title?: string;
  grid_size?: string;
  duration_ms?: number;
  created_at: string;
}

export interface UpcomingPuzzleItem {
  id: string;
  date_string: string;
  title: string;
  width: number;
  height: number;
  solution: SolutionGrid;
  row_clues: number[][];
  col_clues: number[][];
}

export const generatorEngine = {
  /**
   * Finds the first future date starting from today that does NOT have a puzzle in Supabase
   */
  async getNextMissingDate(): Promise<string> {
    try {
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const { data } = await supabase
          .from('daily_puzzles')
          .select('id')
          .eq('date_string', dateStr)
          .eq('category', 'nonogram')
          .maybeSingle();

        if (!data) {
          return dateStr;
        }
      }
      
      const fallback = new Date(today);
      fallback.setDate(today.getDate() + 60);
      return fallback.toISOString().split('T')[0];
    } catch (e) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  },

  /**
   * Generates and publishes a daily Nonogram from an online pixelated image for a target date
   */
  async generatePuzzleForDate(targetDate: Date | string): Promise<{ success: boolean; message: string; puzzle?: UpcomingPuzzleItem }> {
    const startTime = Date.now();
    const dateObj = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const dateStr = dateObj.toISOString().split('T')[0];

    try {
      // Pixelate online image into solvable Nonogram solution grid
      const imageResult = await generateNonogramFromOnlineImage(dateStr);
      const width = imageResult.width;
      const height = imageResult.height;
      const gridSizeStr = `${width}x${height}`;

      // Verify logical solvability
      const { isSolvable } = validateNonogramSolvability(imageResult.solution);

      if (!isSolvable) {
        const duration = Date.now() - startTime;
        await this.logExecution(dateStr, 'failed', 'Pixelated image failed solvability verification check', imageResult.title, gridSizeStr, duration);
        return { success: false, message: 'Unsolvable puzzle generated' };
      }

      // Publish to Supabase
      const result = await dailyPuzzleService.publishDailyPuzzle(dateStr, imageResult.title, imageResult.solution, 'nonogram');
      const duration = Date.now() - startTime;

      if (result.success) {
        await this.logExecution(dateStr, 'success', `Pixelated online image into Nonogram: ${imageResult.title}`, imageResult.title, gridSizeStr, duration);
        return {
          success: true,
          message: `חידת "${imageResult.title}" (${gridSizeStr}) פוקסלה מתמונה ופורסמה בהצלחה עבור ${dateStr}!`,
          puzzle: {
            id: `puzzle_${dateStr}`,
            date_string: dateStr,
            title: imageResult.title,
            width,
            height,
            solution: imageResult.solution,
            row_clues: [],
            col_clues: [],
          },
        };
      } else {
        const errMsg = result.error || 'Database insert failed (RLS policy)';
        await this.logExecution(dateStr, 'failed', `Insert failed: ${errMsg}`, imageResult.title, gridSizeStr, duration);
        return { success: false, message: `שגיאה בהכנסה למסד הנתונים: ${errMsg}` };
      }
    } catch (e: any) {
      const duration = Date.now() - startTime;
      await this.logExecution(dateStr, 'failed', `Exception: ${e?.message || e}`, 'Error', 'N/A', duration);
      return { success: false, message: e?.message || 'Generation exception occurred' };
    }
  },

  /**
   * Records execution log into Supabase table `puzzle_generation_logs`
   */
  async logExecution(
    dateString: string,
    status: 'success' | 'failed',
    message: string,
    puzzleTitle?: string,
    gridSize?: string,
    durationMs?: number
  ): Promise<void> {
    try {
      await supabase.from('puzzle_generation_logs').insert({
        date_string: dateString,
        status,
        message,
        puzzle_title: puzzleTitle,
        grid_size: gridSize,
        duration_ms: durationMs,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed writing execution log to Supabase', e);
    }
  },

  /**
   * Fetches latest generation logs for Admin Dashboard
   */
  async fetchGenerationLogs(limit: number = 30): Promise<GenerationLogItem[]> {
    try {
      const { data, error } = await supabase
        .from('puzzle_generation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data;
    } catch (e) {
      return [];
    }
  },

  /**
   * Fetches upcoming 30-day scheduled Nonograms from Supabase
   */
  async fetchUpcomingPuzzles(daysAhead: number = 30): Promise<UpcomingPuzzleItem[]> {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*')
        .gte('date_string', todayStr)
        .order('date_string', { ascending: true })
        .limit(daysAhead);

      if (error || !data) return [];
      return data;
    } catch (e) {
      return [];
    }
  },
};
