import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  checkIsSolved,
  parseSudokuString,
  removeNoteFromPeers,
  validateSudokuConflicts,
} from '../logic/sudokuUtils';
import {
  CellPosition,
  HistoryStep,
  SudokuBoard,
  SudokuCellState,
  SudokuInputMode,
  UseSudokuEngineOptions,
  UseSudokuEngineReturn,
} from '../types/sudoku';

export function useSudokuEngine(
  initialBoard: SudokuBoard,
  options: UseSudokuEngineOptions = {}
): UseSudokuEngineReturn {
  const { autoRemoveNotesOnInsert = true, onSolve } = options;

  const [board, setBoard] = useState<SudokuBoard>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>({
    row: 0,
    col: 0,
  });
  const [inputMode, setInputModeState] = useState<SudokuInputMode>('NORMAL');
  const [undoStack, setUndoStack] = useState<HistoryStep[]>([]);

  // Update internal board state when difficulty tier or initialBoard prop changes
  useEffect(() => {
    setBoard(initialBoard);
    setSelectedCell({ row: 0, col: 0 });
    setUndoStack([]);
  }, [initialBoard]);

  // Count occurrences of each number (1..9) across the grid
  const numberCounts = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
    };
    board.grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.value >= 1 && cell.value <= 9) {
          counts[cell.value] = (counts[cell.value] || 0) + 1;
        }
      });
    });
    return counts;
  }, [board.grid]);

  // Execute grid mutation with real-time conflict checking & solve detection
  const updateGridState = useCallback(
    (newGrid: SudokuCellState[][], historyStep?: HistoryStep) => {
      const { conflictMap } = validateSudokuConflicts(newGrid);

      const gridWithErrors = newGrid.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          isError: conflictMap[r][c],
        }))
      );

      const isSolved = checkIsSolved(gridWithErrors);

      setBoard((prev) => {
        const wasCompleted = prev.isCompleted;
        if (!wasCompleted && isSolved) {
          onSolve?.();
        }
        return {
          ...prev,
          grid: gridWithErrors,
          isCompleted: isSolved,
        };
      });

      if (historyStep) {
        setUndoStack((stack) => [...stack, historyStep]);
      }
    },
    [onSolve]
  );

  // Cell selection
  const selectCell = useCallback((row: number, col: number) => {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      setSelectedCell({ row, col });
    }
  }, []);

  // Number input insertion (Normal mode vs Pencil Notes mode)
  const insertNumber = useCallback(
    (num: number) => {
      if (!selectedCell || board.isCompleted || num < 1 || num > 9) return;

      const { row, col } = selectedCell;
      const targetCell = board.grid[row][col];
      if (targetCell.isGiven) return;

      if (inputMode === 'NOTES') {
        // Toggle candidate pencil note
        const existingNotes = targetCell.notes;
        const newNotes = existingNotes.includes(num)
          ? existingNotes.filter((n) => n !== num)
          : [...existingNotes, num].sort((a, b) => a - b);

        const newGrid = board.grid.map((r, rIdx) =>
          rIdx === row
            ? r.map((c, cIdx) =>
                cIdx === col ? { ...c, notes: newNotes } : c
              )
            : [...r]
        );

        const historyStep: HistoryStep = {
          row,
          col,
          prevValue: targetCell.value,
          nextValue: targetCell.value,
          prevNotes: targetCell.notes,
          nextNotes: newNotes,
        };

        updateGridState(newGrid, historyStep);
      } else {
        // Normal number input
        const nextValue = targetCell.value === num ? 0 : num;

        let newGrid = board.grid.map((r, rIdx) =>
          rIdx === row
            ? r.map((c, cIdx) =>
                cIdx === col ? { ...c, value: nextValue, notes: [] } : c
              )
            : [...r]
        );

        // Auto-remove candidate note from peers in same row, col, and box
        if (nextValue > 0 && autoRemoveNotesOnInsert) {
          newGrid = removeNoteFromPeers(newGrid, row, col, nextValue);
        }

        const historyStep: HistoryStep = {
          row,
          col,
          prevValue: targetCell.value,
          nextValue,
          prevNotes: targetCell.notes,
          nextNotes: [],
        };

        updateGridState(newGrid, historyStep);
      }
    },
    [autoRemoveNotesOnInsert, board.grid, board.isCompleted, inputMode, selectedCell, updateGridState]
  );

  // Erase cell content
  const erase = useCallback(() => {
    if (!selectedCell || board.isCompleted) return;

    const { row, col } = selectedCell;
    const targetCell = board.grid[row][col];
    if (targetCell.isGiven) return;

    const newGrid = board.grid.map((r, rIdx) =>
      rIdx === row
        ? r.map((c, cIdx) =>
            cIdx === col ? { ...c, value: 0, notes: [] } : c
          )
        : [...r]
    );

    const historyStep: HistoryStep = {
      row,
      col,
      prevValue: targetCell.value,
      nextValue: 0,
      prevNotes: targetCell.notes,
      nextNotes: [],
    };

    updateGridState(newGrid, historyStep);
  }, [board.grid, board.isCompleted, selectedCell, updateGridState]);

  // Mode switching
  const setInputMode = useCallback((mode: SudokuInputMode) => {
    setInputModeState(mode);
  }, []);

  const toggleInputMode = useCallback(() => {
    setInputModeState((prev) => (prev === 'NORMAL' ? 'NOTES' : 'NORMAL'));
  }, []);

  // Undo action
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastStep = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));

    const newGrid = board.grid.map((r, rIdx) =>
      rIdx === lastStep.row
        ? r.map((c, cIdx) =>
            cIdx === lastStep.col
              ? { ...c, value: lastStep.prevValue, notes: lastStep.prevNotes }
              : c
          )
        : [...r]
    );

    updateGridState(newGrid);
  }, [board.grid, undoStack, updateGridState]);

  // Hint action (reveals target solution value for selected cell)
  const getHint = useCallback(() => {
    if (board.isCompleted) return;

    let targetPos = selectedCell;
    if (
      !targetPos ||
      board.grid[targetPos.row][targetPos.col].isGiven ||
      board.grid[targetPos.row][targetPos.col].value ===
        board.grid[targetPos.row][targetPos.col].solutionValue
    ) {
      // Find first un-filled or incorrect cell
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = board.grid[r][c];
          if (!cell.isGiven && cell.value !== cell.solutionValue) {
            targetPos = { row: r, col: c };
            break;
          }
        }
        if (targetPos) break;
      }
    }

    if (!targetPos) return;
    const { row, col } = targetPos;
    const cell = board.grid[row][col];

    let newGrid = board.grid.map((r, rIdx) =>
      rIdx === row
        ? r.map((c, cIdx) =>
            cIdx === col
              ? { ...c, value: cell.solutionValue, isGiven: true, notes: [] }
              : c
          )
        : [...r]
    );

    if (autoRemoveNotesOnInsert) {
      newGrid = removeNoteFromPeers(newGrid, row, col, cell.solutionValue);
    }

    setSelectedCell(targetPos);
    updateGridState(newGrid);
  }, [autoRemoveNotesOnInsert, board.grid, board.isCompleted, selectedCell, updateGridState]);

  // Board reset
  const reset = useCallback(() => {
    const { grid } = parseSudokuString(board.initialString, board.solutionString);
    setBoard((prev) => ({
      ...prev,
      grid,
      isCompleted: false,
    }));
    setUndoStack([]);
  }, [board.initialString, board.solutionString]);

  return {
    board,
    grid: board.grid,
    selectedCell,
    inputMode,
    isCompleted: board.isCompleted,
    canUndo: undoStack.length > 0,
    numberCounts,
    selectCell,
    insertNumber,
    erase,
    setInputMode,
    toggleInputMode,
    undo,
    getHint,
    reset,
  };
}
