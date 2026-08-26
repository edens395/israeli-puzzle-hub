import { Nonogram } from '../models/puzzles.interface'; // Adjust based on your types
import { UpcomingPuzzleItem } from './generatorEngine';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjqugzspwyubkiysnxwk.supabase.co';
const ADMIN_SECRET = process.env.EXPO_PUBLIC_ADMIN_SECRET || '';

export interface GenerateNextNonogramResponse {
  success: boolean;
  date?: string;
  nonogram?: UpcomingPuzzleItem;
  error?: string;
}

export const adminApiService = {
  /**
   * Calls the secure Supabase Edge Function to generate the next daily Nonogram.
   * Authentication is handled via Bearer token matching the server's ADMIN_SECRET.
   */
  async generateNextNonogram(): Promise<GenerateNextNonogramResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-next-nonogram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_SECRET}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data as GenerateNextNonogramResponse;
    } catch (error: any) {
      console.error('API Error generating next nonogram:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to backend service',
      };
    }
  },
};
