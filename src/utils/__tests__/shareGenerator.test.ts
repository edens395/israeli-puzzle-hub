import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatSolveTime,
  generateNonogramEmojiGrid,
  generateShareText,
} from '../shareGenerator';

describe('Hebrew Share Generator Utility', () => {
  describe('formatSolveTime', () => {
    it('formats 0 seconds into 00:00', () => {
      assert.equal(formatSolveTime(0), '00:00');
    });

    it('formats 165 seconds into 02:45', () => {
      assert.equal(formatSolveTime(165), '02:45');
    });
  });

  describe('generateNonogramEmojiGrid', () => {
    it('converts boolean matrix into ⬛/⬜ emoji grid string', () => {
      const grid = [
        [true, false],
        [false, true],
      ];
      const emojiStr = generateNonogramEmojiGrid(grid);
      assert.equal(emojiStr, '⬛⬜\n⬜⬛');
    });
  });

  describe('generateShareText', () => {
    it('generates Nonogram share text with emoji grid and streak', () => {
      const text = generateShareText({
        category: 'nonogram',
        puzzleTitle: 'לב (5x5)',
        elapsedSeconds: 165,
        streakDays: 5,
        gridPreview: [
          [true, false],
          [false, true],
        ],
      });

      assert.ok(text.includes('המוסף היומי'));
      assert.ok(text.includes('שחור ופתור - לב (5x5)'));
      assert.ok(text.includes('02:45'));
      assert.ok(text.includes('⬛⬜'));
      assert.ok(text.includes('5 ימים'));
    });

    it('generates Sudoku share text with difficulty and streak', () => {
      const text = generateShareText({
        category: 'sudoku',
        puzzleTitle: 'בינוני #1',
        elapsedSeconds: 210,
        streakDays: 12,
        difficulty: 'בינוני',
      });

      assert.ok(text.includes('סודוקו - בינוני #1'));
      assert.ok(text.includes('03:30'));
      assert.ok(text.includes('12 ימים'));
    });
  });
});
