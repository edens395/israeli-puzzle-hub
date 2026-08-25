import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  areHebrewLettersEqual,
  areHebrewWordsEqual,
  formatHebrewLetterForPosition,
  isValidHebrewLetter,
  normalizeHebrewLetter,
  stripHebrewNikud,
  toSofitForm,
} from '../logic/hebrewUtils';
import { createWordPuzzle } from '../logic/wordPuzzleUtils';

describe('Hebrew Language & Sofiot Normalization Engine', () => {
  describe('stripHebrewNikud', () => {
    it('removes vowel diacritics from Hebrew text', () => {
      expectNikudStripped('מֶלֶךְ', 'מלך');
      expectNikudStripped('שָׁלוֹם', 'שלום');
    });
  });

  describe('normalizeHebrewLetter', () => {
    it('normalizes Sofit forms to standard base forms', () => {
      assert.equal(normalizeHebrewLetter('ך'), 'כ');
      assert.equal(normalizeHebrewLetter('ם'), 'מ');
      assert.equal(normalizeHebrewLetter('ן'), 'נ');
      assert.equal(normalizeHebrewLetter('ף'), 'פ');
      assert.equal(normalizeHebrewLetter('ץ'), 'צ');
    });

    it('leaves standard letters unchanged', () => {
      assert.equal(normalizeHebrewLetter('א'), 'א');
      assert.equal(normalizeHebrewLetter('ב'), 'ב');
      assert.equal(normalizeHebrewLetter('כ'), 'כ');
    });
  });

  describe('toSofitForm', () => {
    it('converts base letters to Sofit forms', () => {
      assert.equal(toSofitForm('כ'), 'ך');
      assert.equal(toSofitForm('מ'), 'ם');
      assert.equal(toSofitForm('נ'), 'ן');
      assert.equal(toSofitForm('פ'), 'ף');
      assert.equal(toSofitForm('צ'), 'ץ');
    });

    it('leaves non-Sofit letters unchanged', () => {
      assert.equal(toSofitForm('א'), 'א');
      assert.equal(toSofitForm('ד'), 'ד');
    });
  });

  describe('formatHebrewLetterForPosition', () => {
    it('converts base letter to Sofit form when at the end of a word', () => {
      assert.equal(formatHebrewLetterForPosition('כ', true), 'ך');
      assert.equal(formatHebrewLetterForPosition('מ', true), 'ם');
    });

    it('normalizes Sofit letter to base form when in the middle of a word', () => {
      assert.equal(formatHebrewLetterForPosition('ך', false), 'כ');
      assert.equal(formatHebrewLetterForPosition('ם', false), 'מ');
    });
  });

  describe('areHebrewLettersEqual', () => {
    it('returns true when comparing regular and Sofit forms of the same letter', () => {
      assert.equal(areHebrewLettersEqual('כ', 'ך'), true);
      assert.equal(areHebrewLettersEqual('ך', 'כ'), true);
      assert.equal(areHebrewLettersEqual('מ', 'ם'), true);
      assert.equal(areHebrewLettersEqual('נ', 'ן'), true);
      assert.equal(areHebrewLettersEqual('פ', 'ף'), true);
      assert.equal(areHebrewLettersEqual('צ', 'ץ'), true);
    });

    it('returns false for different Hebrew letters', () => {
      assert.equal(areHebrewLettersEqual('א', 'ב'), false);
      assert.equal(areHebrewLettersEqual('כ', 'מ'), false);
    });
  });

  describe('areHebrewWordsEqual', () => {
    it('validates words with Sofit tolerance', () => {
      assert.equal(areHebrewWordsEqual('מלך', 'מלכ'), true);
      assert.equal(areHebrewWordsEqual('שלום', 'שלומ'), true);
    });
  });

  describe('isValidHebrewLetter', () => {
    it('identifies Hebrew letters correctly', () => {
      assert.equal(isValidHebrewLetter('א'), true);
      assert.equal(isValidHebrewLetter('ץ'), true);
      assert.equal(isValidHebrewLetter('A'), false);
      assert.equal(isValidHebrewLetter('1'), false);
    });
  });

  describe('createWordPuzzle Mini-Tashbetz matrix setup', () => {
    it('correctly builds matrix with RTL across word flow', () => {
      const puzzle = createWordPuzzle('mini-1', 'מיני תשבץ 1', 3, 3, [
        {
          id: 'w-across-1',
          number: 1,
          clue: 'שליט (3 אותיות)',
          answer: 'מלך',
          startRow: 0,
          startCol: 2, // Starts at col 2, flows RTL to 1 and 0
          orientation: 'across',
        },
        {
          id: 'w-down-1',
          number: 1,
          clue: 'תבלין לבן מהים (3 אותיות)',
          answer: 'מלח',
          startRow: 0,
          startCol: 2, // Starts at (0, 2), flows down to (1, 2) and (2, 2)
          orientation: 'down',
        },
      ]);

      assert.equal(puzzle.rows, 3);
      assert.equal(puzzle.cols, 3);
      assert.equal(puzzle.grid[0][2].solutionLetter, 'מ');
      assert.equal(puzzle.grid[0][1].solutionLetter, 'ל');
      assert.equal(puzzle.grid[0][0].solutionLetter, 'ך');
      assert.equal(puzzle.grid[0][0].isAcrossEnd, true);

      assert.equal(puzzle.grid[1][2].solutionLetter, 'ל');
      assert.equal(puzzle.grid[2][2].solutionLetter, 'ח');
      assert.equal(puzzle.grid[2][2].isDownEnd, true);
    });
  });
});

function expectNikudStripped(input: string, expected: string) {
  assert.equal(stripHebrewNikud(input), expected);
}
