import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  areHebrewLettersEqual,
  formatHebrewLetterForPosition,
  isValidHebrewLetter,
} from '../../wordpuzzle/logic/hebrewUtils';
import {
  CellPosition,
  ClueItem,
  CrosswordCellState,
  CrosswordDirection,
  CrosswordPuzzle,
  UseCrosswordEngineOptions,
  UseCrosswordEngineReturn,
} from '../types/crossword';

// QWERTY to Israeli Hebrew Physical Keyboard Mapping
const QWERTY_TO_HEBREW_MAP: Record<string, string> = {
  t: 'א',
  c: 'ב',
  d: 'ג',
  s: 'ד',
  v: 'ה',
  u: 'ו',
  z: 'ז',
  j: 'ח',
  y: 'ט',
  h: 'י',
  f: 'כ',
  l: 'ך',
  k: 'ל',
  n: 'מ',
  o: 'ם',
  b: 'נ',
  i: 'ן',
  x: 'ס',
  g: 'ע',
  p: 'פ',
  ';': 'ף',
  m: 'צ',
  '.': 'ץ',
  e: 'ק',
  r: 'ר',
  a: 'ש',
  ',': 'ת',
};

export function useCrosswordEngine(
  initialPuzzle: CrosswordPuzzle,
  options: UseCrosswordEngineOptions = {}
): UseCrosswordEngineReturn {
  const { autoAdvanceOnType = true, onSolve } = options;

  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(initialPuzzle);
  const [selectedCell, setSelectedCellState] = useState<CellPosition | null>(() => {
    for (let r = 0; r < initialPuzzle.rows; r++) {
      for (let c = initialPuzzle.cols - 1; c >= 0; c--) {
        if (!initialPuzzle.grid[r][c].isBlocked) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  });
  const [selectedDirection, setSelectedDirectionState] = useState<CrosswordDirection>('across');

  // Sync state if initialPuzzle prop changes
  useEffect(() => {
    setPuzzle(initialPuzzle);
    for (let r = 0; r < initialPuzzle.rows; r++) {
      for (let c = initialPuzzle.cols - 1; c >= 0; c--) {
        if (!initialPuzzle.grid[r][c].isBlocked) {
          setSelectedCellState({ row: r, col: c });
          return;
        }
      }
    }
  }, [initialPuzzle]);

  // Derive active clue passing through selectedCell
  const activeClue = useMemo<ClueItem | null>(() => {
    if (!selectedCell) return null;

    const cell = puzzle.grid[selectedCell.row]?.[selectedCell.col];
    if (!cell || cell.isBlocked) return null;

    const clueId =
      selectedDirection === 'across' ? cell.acrossClueId : cell.downClueId;
    const fallbackClueId =
      selectedDirection === 'across' ? cell.downClueId : cell.acrossClueId;

    const targetId = clueId || fallbackClueId;
    if (!targetId) return null;

    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    return allClues.find((c) => c.id === targetId) || null;
  }, [puzzle.clues, puzzle.grid, selectedCell, selectedDirection]);

  // Select cell / toggle direction on double tap
  const selectCell = useCallback(
    (row: number, col: number) => {
      const cell = puzzle.grid[row]?.[col];
      if (!cell || cell.isBlocked) return;

      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        setSelectedDirectionState((prev) => (prev === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCellState({ row, col });

        if (selectedDirection === 'across' && !cell.acrossClueId && cell.downClueId) {
          setSelectedDirectionState('down');
        } else if (
          selectedDirection === 'down' &&
          !cell.downClueId &&
          cell.acrossClueId
        ) {
          setSelectedDirectionState('across');
        }
      }
    },
    [puzzle.grid, selectedCell, selectedDirection]
  );

  // Type letter with Sofiot auto-formatting, auto-advance, & auto-solve check
  const typeLetter = useCallback(
    (rawChar: string) => {
      // Normalize rawChar if coming from physical QWERTY key
      const charToUse =
        isValidHebrewLetter(rawChar)
          ? rawChar
          : QWERTY_TO_HEBREW_MAP[rawChar.toLowerCase()] || rawChar;

      if (!selectedCell || puzzle.isCompleted || !isValidHebrewLetter(charToUse)) {
        return;
      }

      const { row, col } = selectedCell;
      const cell = puzzle.grid[row][col];
      if (cell.isBlocked) return;

      const isEndOfWord =
        selectedDirection === 'across' ? !!cell.isAcrossEnd : !!cell.isDownEnd;

      const formattedLetter = formatHebrewLetterForPosition(charToUse, isEndOfWord);

      let isSolvedAfterType = false;

      setPuzzle((prev) => {
        const newGrid = prev.grid.map((r, rIdx) =>
          rIdx === row
            ? r.map((c, cIdx) =>
                cIdx === col
                  ? { ...c, userLetter: formattedLetter, isError: false }
                  : c
              )
            : [...r]
        );

        // Check if all non-blocked cells are filled & 100% correct
        let hasEmptyCells = false;
        let isAllCorrect = true;

        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            const current = newGrid[r][c];
            if (current.isBlocked) continue;
            if (current.userLetter === '') {
              hasEmptyCells = true;
              isAllCorrect = false;
              break;
            }
            if (!areHebrewLettersEqual(current.userLetter, current.solutionLetter)) {
              isAllCorrect = false;
            }
          }
          if (hasEmptyCells) break;
        }

        if (!hasEmptyCells && isAllCorrect) {
          isSolvedAfterType = true;
          return { ...prev, grid: newGrid, isCompleted: true };
        }

        return { ...prev, grid: newGrid };
      });

      if (isSolvedAfterType) {
        onSolve?.();
        return;
      }

      // Auto-advance to next cell in active clue
      if (autoAdvanceOnType && activeClue) {
        const positions = activeClue.cellPositions;
        const currentIndex = positions.findIndex(
          (p) => p.row === row && p.col === col
        );

        if (currentIndex >= 0 && currentIndex < positions.length - 1) {
          setSelectedCellState(positions[currentIndex + 1]);
        }
      }
    },
    [activeClue, autoAdvanceOnType, onSolve, puzzle.grid, puzzle.isCompleted, selectedCell, selectedDirection]
  );

  // Backspace handler
  const backspace = useCallback(() => {
    if (!selectedCell || puzzle.isCompleted) return;

    const { row, col } = selectedCell;
    const currentCell = puzzle.grid[row][col];

    if (currentCell.userLetter !== '') {
      setPuzzle((prev) => {
        const newGrid = prev.grid.map((r, rIdx) =>
          rIdx === row
            ? r.map((c, cIdx) =>
                cIdx === col ? { ...c, userLetter: '', isError: false } : c
              )
            : [...r]
        );
        return { ...prev, grid: newGrid };
      });
    } else if (activeClue) {
      const positions = activeClue.cellPositions;
      const currentIndex = positions.findIndex(
        (p) => p.row === row && p.col === col
      );

      if (currentIndex > 0) {
        const prevPos = positions[currentIndex - 1];
        setSelectedCellState(prevPos);

        setPuzzle((prev) => {
          const newGrid = prev.grid.map((r, rIdx) =>
            rIdx === prevPos.row
              ? r.map((c, cIdx) =>
                  cIdx === prevPos.col ? { ...c, userLetter: '', isError: false } : c
                )
              : [...r]
          );
          return { ...prev, grid: newGrid };
        });
      }
    }
  }, [activeClue, puzzle.grid, puzzle.isCompleted, selectedCell]);

  const setSelectedDirection = useCallback((direction: CrosswordDirection) => {
    setSelectedDirectionState(direction);
  }, []);

  const toggleDirection = useCallback(() => {
    setSelectedDirectionState((prev) => (prev === 'across' ? 'down' : 'across'));
  }, []);

  const selectNextClue = useCallback(() => {
    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    if (allClues.length === 0) return;

    const currentIndex = activeClue
      ? allClues.findIndex((c) => c.id === activeClue.id)
      : -1;
    const nextIndex = (currentIndex + 1) % allClues.length;
    const nextClue = allClues[nextIndex];

    setSelectedCellState({ row: nextClue.startRow, col: nextClue.startCol });
    setSelectedDirectionState(nextClue.direction);
  }, [activeClue, puzzle.clues]);

  const selectPrevClue = useCallback(() => {
    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    if (allClues.length === 0) return;

    const currentIndex = activeClue
      ? allClues.findIndex((c) => c.id === activeClue.id)
      : 0;
    const prevIndex = (currentIndex - 1 + allClues.length) % allClues.length;
    const prevClue = allClues[prevIndex];

    setSelectedCellState({ row: prevClue.startRow, col: prevClue.startCol });
    setSelectedDirectionState(prevClue.direction);
  }, [activeClue, puzzle.clues]);

  // Web physical keyboard listener
  useEffect(() => {
    if (typeof window === 'undefined' || puzzle.isCompleted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const targetTag = (event.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      const key = event.key;

      if (isValidHebrewLetter(key) || QWERTY_TO_HEBREW_MAP[key.toLowerCase()]) {
        typeLetter(key);
      } else if (key === 'Backspace' || key === 'Delete') {
        backspace();
      } else if (key === 'Tab') {
        event.preventDefault();
        selectNextClue();
      } else if (key === 'ArrowRight') {
        if (selectedCell) {
          const nextCol = Math.max(0, selectedCell.col - 1);
          if (!puzzle.grid[selectedCell.row][nextCol].isBlocked) {
            setSelectedCellState({ row: selectedCell.row, col: nextCol });
          }
        }
      } else if (key === 'ArrowLeft') {
        if (selectedCell) {
          const nextCol = Math.min(puzzle.cols - 1, selectedCell.col + 1);
          if (!puzzle.grid[selectedCell.row][nextCol].isBlocked) {
            setSelectedCellState({ row: selectedCell.row, col: nextCol });
          }
        }
      } else if (key === 'ArrowUp') {
        if (selectedCell) {
          const nextRow = Math.max(0, selectedCell.row - 1);
          if (!puzzle.grid[nextRow][selectedCell.col].isBlocked) {
            setSelectedCellState({ row: nextRow, col: selectedCell.col });
          }
        }
      } else if (key === 'ArrowDown') {
        if (selectedCell) {
          const nextRow = Math.min(puzzle.rows - 1, selectedCell.row + 1);
          if (!puzzle.grid[nextRow][selectedCell.col].isBlocked) {
            setSelectedCellState({ row: nextRow, col: selectedCell.col });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    backspace,
    puzzle.cols,
    puzzle.grid,
    puzzle.isCompleted,
    puzzle.rows,
    selectNextClue,
    selectedCell,
    typeLetter,
  ]);

  // Solution verification
  const checkSolution = useCallback(() => {
    const incorrectCells: CellPosition[] = [];
    let isFullyCorrect = true;

    const newGrid = puzzle.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (cell.isBlocked) return cell;

        const isMatch = areHebrewLettersEqual(
          cell.userLetter,
          cell.solutionLetter
        );

        if (!isMatch) {
          isFullyCorrect = false;
          if (cell.userLetter !== '') {
            incorrectCells.push({ row: rIdx, col: cIdx });
            return { ...cell, isError: true };
          }
        }
        return { ...cell, isError: false };
      })
    );

    setPuzzle((prev) => ({
      ...prev,
      grid: newGrid,
      isCompleted: isFullyCorrect,
    }));

    if (isFullyCorrect) {
      onSolve?.();
    }

    return { isCorrect: isFullyCorrect, incorrectCells };
  }, [onSolve, puzzle.grid]);

  // Hint tools
  const revealCell = useCallback((row: number, col: number) => {
    setPuzzle((prev) => {
      const cell = prev.grid[row]?.[col];
      if (!cell || cell.isBlocked) return prev;

      const newGrid = prev.grid.map((r, rIdx) =>
        rIdx === row
          ? r.map((c, cIdx) =>
              cIdx === col
                ? {
                    ...c,
                    userLetter: c.solutionLetter,
                    isRevealed: true,
                    isError: false,
                  }
                : c
            )
          : [...r]
      );
      return { ...prev, grid: newGrid };
    });
  }, []);

  const revealWord = useCallback(
    (clueId: string) => {
      const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
      const targetClue = allClues.find((c) => c.id === clueId);
      if (!targetClue) return;

      setPuzzle((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        targetClue.cellPositions.forEach((pos) => {
          const targetCell = newGrid[pos.row][pos.col];
          if (!targetCell.isBlocked) {
            newGrid[pos.row][pos.col] = {
              ...targetCell,
              userLetter: targetCell.solutionLetter,
              isRevealed: true,
              isError: false,
            };
          }
        });
        return { ...prev, grid: newGrid };
      });
    },
    [puzzle.clues]
  );

  const revealPuzzle = useCallback(() => {
    setPuzzle((prev) => {
      const newGrid = prev.grid.map((row) =>
        row.map((cell) =>
          cell.isBlocked
            ? cell
            : {
                ...cell,
                userLetter: cell.solutionLetter,
                isRevealed: true,
                isError: false,
              }
        )
      );
      return { ...prev, grid: newGrid, isCompleted: true };
    });
  }, []);

  const reset = useCallback(() => {
    setPuzzle((prev) => ({
      ...prev,
      grid: prev.grid.map((row) =>
        row.map((cell) =>
          cell.isBlocked
            ? cell
            : { ...cell, userLetter: '', isRevealed: false, isError: false }
        )
      ),
      isCompleted: false,
    }));
  }, []);

  return {
    puzzle,
    grid: puzzle.grid,
    selectedCell,
    selectedDirection,
    activeClue,
    isCompleted: puzzle.isCompleted,
    selectCell,
    typeLetter,
    backspace,
    setSelectedDirection,
    toggleDirection,
    selectNextClue,
    selectPrevClue,
    checkSolution,
    revealCell,
    revealWord,
    revealPuzzle,
    reset,
  };
}
