import { DailyEditionData, PuzzleCategory, PuzzleProgress, UserStats } from '../storage/puzzleRepository';
import { deviceIdService } from './deviceIdService';
import { supabase } from './supabaseClient';

export interface CloudPuzzleSyncPayload {
  device_id: string;
  date_string: string;
  category: PuzzleCategory;
  status: string;
  completion_percent: number;
  elapsed_seconds: number;
  saved_grid_state?: any;
  updated_at: string;
}

export interface CloudUserStatsPayload {
  device_id: string;
  current_streak: number;
  longest_streak: number;
  total_puzzles_completed: number;
  category_counts: Record<PuzzleCategory, number>;
  updated_at: string;
}

export const cloudDatabaseService = {
  /**
   * Syncs single puzzle progress payload to Supabase keyed by device_id
   */
  async syncPuzzleProgress(progress: PuzzleProgress): Promise<boolean> {
    try {
      const deviceId = await deviceIdService.getDeviceId();
      console.log('🌐 Syncing puzzle progress to Supabase for device:', deviceId, progress);
      
      // 1. Ensure user device entry exists in `user_devices`
      const { error: deviceErr } = await supabase.from('user_devices').upsert({
        device_id: deviceId,
        last_active_at: new Date().toISOString(),
      }, { onConflict: 'device_id' });

      if (deviceErr) {
        console.warn('⚠️ Supabase user_devices upsert message:', deviceErr.message);
      }

      // 2. Upsert puzzle progress into `puzzle_progress`
      const payload: CloudPuzzleSyncPayload = {
        device_id: deviceId,
        date_string: typeof progress.dateString === 'string'
          ? progress.dateString
          : progress.dateString.toISOString().split('T')[0],
        category: progress.category,
        status: progress.status,
        completion_percent: progress.completionPercent,
        elapsed_seconds: progress.elapsedSeconds,
        saved_grid_state: progress.savedGridState,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('puzzle_progress')
        .upsert(payload, { onConflict: 'device_id,date_string,category' });

      if (error) {
        console.warn('❌ Supabase puzzle_progress sync error:', error.message, error.details);
        return false;
      }

      console.log('✅ Supabase puzzle progress saved successfully!');
      return true;
    } catch (e) {
      console.warn('Background Supabase puzzle progress sync deferred:', e);
      return false;
    }
  },

  /**
   * Syncs user stats payload to Supabase keyed by device_id
   */
  async syncUserStats(stats: UserStats): Promise<boolean> {
    try {
      const deviceId = await deviceIdService.getDeviceId();
      console.log('🌐 Syncing user stats to Supabase for device:', deviceId);

      const payload: CloudUserStatsPayload = {
        device_id: deviceId,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        total_puzzles_completed: stats.totalPuzzlesCompleted,
        category_counts: stats.categoryCounts,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_stats')
        .upsert(payload, { onConflict: 'device_id' });

      if (error) {
        console.warn('❌ Supabase user_stats sync error:', error.message);
        return false;
      }

      console.log('✅ Supabase user stats saved successfully!');
      return true;
    } catch (e) {
      console.warn('Background Supabase user stats sync deferred:', e);
      return false;
    }
  },

  /**
   * Fetches remote progress snapshot for this device ID from Supabase
   */
  async fetchRemoteProgress(dateString: string): Promise<any | null> {
    try {
      const deviceId = await deviceIdService.getDeviceId();
      const { data, error } = await supabase
        .from('puzzle_progress')
        .select('*')
        .eq('device_id', deviceId)
        .eq('date_string', dateString);

      if (error || !data) return null;
      return data;
    } catch (e) {
      return null;
    }
  },
};
