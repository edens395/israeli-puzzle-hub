import { useCallback, useMemo, useState } from 'react';
import {
  areHebrewLettersEqual,
  formatHebrewLetterForPosition,
  isValidHebrewLetter,
} from '../logic/hebrewUtils';
import {
  CellPosition,
  Orientation,
  UseWordPuzzleEngineOptions,
  UseWordPuzzleEngineReturn,
  WordCell,
  WordClue,
  WordPuzzle,
} from '../types/wordPuzzle';

export function useWordPuzzleEngine(
  initialPuzzle: WordPuzzle,
  options: UseWordPuzzleEngineOptions = {}
): UseWordPuzzleEngineReturn {
  const { autoAdvanceOnType = true, onSolve } = options;

  const [puzzle, setPuzzle] = useState<WordPuzzle>(initialPuzzle);
  const [selectedCell, setSelectedCellState] = useState<CellPosition | null>(() => {
    // Default selection to first non-blocked cell
    for (let r = 0; r < initialPuzzle.rows; r++) {
      for (let c = 0; c < initialPuzzle.cols; c++) {
        if (!initialPuzzle.grid[r][c].isBlocked) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  });
  const [selectedDirection, setSelectedDirectionState] = useState<Orientation>('across');

  // Find active clue passing through selectedCell in selectedDirection
  const activeClue = useMemo<WordClue | null>(() => {
    if (!selectedCell) return null;

    const cell = puzzle.grid[selectedCell.row]?.[selectedCell.col];
    if (!cell || cell.isBlocked) return null;

    const wordId =
      selectedDirection === 'across' ? cell.acrossWordId : cell.downWordId;
    const fallbackWordId =
      selectedDirection === 'across' ? cell.downWordId : cell.acrossWordId;

    const targetId = wordId || fallbackWordId;
    if (!targetId) return null;

    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    return allClues.find((c) => c.id === targetId) || null;
  }, [puzzle.clues, puzzle.grid, selectedCell, selectedDirection]);

  // Handle cell tap / selection
  const selectCell = useCallback(
    (row: number, col: number) => {
      const cell = puzzle.grid[row]?.[col];
      if (!cell || cell.isBlocked) return;

      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        // Toggle direction if tapping already selected cell
        setSelectedDirectionState((prev) => (prev === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCellState({ row, col });

        // Auto-switch direction if current direction has no clue at this cell
        if (selectedDirection === 'across' && !cell.acrossWordId && cell.downWordId) {
          setSelectedDirectionState('down');
        } else if (
          selectedDirection === 'down' &&
          !cell.downWordId &&
          cell.acrossWordId
        ) {
          setSelectedDirectionState('across');
        }
      }
    },
    [puzzle.grid, selectedCell, selectedDirection]
  );

  // Type Hebrew letter into selected cell with Sofiot auto-formatting & auto-advance
  const typeLetter = useCallback(
    (rawChar: string) => {
      if (!selectedCell || puzzle.isCompleted || !isValidHebrewLetter(rawChar)) {
        return;
      }

      const { row, col } = selectedCell;
      const cell = puzzle.grid[row][col];
      if (cell.isBlocked) return;

      // Determine if cell is the end of the word in current active direction
      const isEndOfWord =
        selectedDirection === 'across' ? !!cell.isAcrossEnd : !!cell.isDownEnd;

      // Format letter considering Sofiot rule for word end vs word middle
      const formattedLetter = formatHebrewLetterForPosition(rawChar, isEndOfWord);

      // Mutate grid cell
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
        return { ...prev, grid: newGrid };
      });

      // Auto-advance to next cell in active word
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
    [activeClue, autoAdvanceOnType, puzzle.isCompleted, puzzle.grid, selectedCell, selectedDirection]
  );

  // Backspace handler with reverse auto-navigation
  const backspace = useCallback(() => {
    if (!selectedCell || puzzle.isCompleted) return;

    const { row, col } = selectedCell;
    const currentCell = puzzle.grid[row][col];

    if (currentCell.userLetter !== '') {
      // Clear current cell letter
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
      // Cell is already empty -> move to previous cell in word and clear it
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
  }, [activeClue, puzzle.isCompleted, puzzle.grid, selectedCell]);

  // Direction switching
  const setSelectedDirection = useCallback((direction: Orientation) => {
    setSelectedDirectionState(direction);
  }, []);

  const toggleDirection = useCallback(() => {
    setSelectedDirectionState((prev) => (prev === 'across' ? 'down' : 'across'));
  }, []);

  // Jump focus to next or previous clue in puzzle
  const selectNextClue = useCallback(() => {
    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    if (allClues.length === 0) return;

    const currentIndex = activeClue
      ? allClues.findIndex((c) => c.id === activeClue.id)
      : -1;
    const nextIndex = (currentIndex + 1) % allClues.length;
    const nextClue = allClues[nextIndex];

    setSelectedCellState(nextClue.startCell);
    setSelectedDirectionState(nextClue.orientation);
  }, [activeClue, puzzle.clues]);

  const selectPrevClue = useCallback(() => {
    const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
    if (allClues.length === 0) return;

    const currentIndex = activeClue
      ? allClues.findIndex((c) => c.id === activeClue.id)
      : 0;
    const prevIndex = (currentIndex - 1 + allClues.length) % allClues.length;
    const prevClue = allClues[prevIndex];

    setSelectedCellState(prevClue.startCell);
    setSelectedDirectionState(prevClue.orientation);
  }, [activeClue, puzzle.clues]);

  // Solution checking function (Sofiot-aware validation)
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

  // Hint Tools
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
    (wordId: string) => {
      const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
      const targetClue = allClues.find((c) => c.id === wordId);
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
