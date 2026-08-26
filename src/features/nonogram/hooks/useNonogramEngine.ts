import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  autoCrossLineInGrid,
  checkColCompleted,
  checkIsSolved,
  checkRowCompleted,
  createEmptyGrid,
  getLineInterpolatedCells,
  getNextCellState,
} from '../logic/nonogramUtils';
import { CellState } from '../types/nonogram';
import type {
  CellChange,
  CellPosition,
  Grid,
  HistoryStep,
  InputMode,
  NonogramBoard,
  UseNonogramEngineOptions,
  UseNonogramEngineReturn,
} from '../types/nonogram';

export function useNonogramEngine(
  initialBoard: NonogramBoard,
  options: UseNonogramEngineOptions = {}
): UseNonogramEngineReturn {
  const { autoCrossCompletedLines = false, enableHistory = true, initialGrid, onSolve } = options;

  // Primary board & matrix state
  const [board, setBoard] = useState<NonogramBoard>(() => {
    if (initialGrid) {
      const isSolved = checkIsSolved(initialGrid, initialBoard.solution);
      return { ...initialBoard, grid: initialGrid, isCompleted: isSolved };
    }
    return initialBoard;
  });

  // Sync internal board state when initialBoard or initialGrid changes externally
  useEffect(() => {
    if (initialGrid) {
      const isSolved = checkIsSolved(initialGrid, initialBoard.solution);
      setBoard({ ...initialBoard, grid: initialGrid, isCompleted: isSolved });
    } else {
      setBoard(initialBoard);
    }
    setUndoStack([]);
    setRedoStack([]);
  }, [initialBoard, initialGrid]);
  const [inputMode, setInputModeState] = useState<InputMode>('FILL');

  const setGridState = useCallback((newGrid: Grid, isCompletedOverride?: boolean) => {
    setBoard((prev) => {
      const isSolved =
        typeof isCompletedOverride === 'boolean'
          ? isCompletedOverride
          : checkIsSolved(newGrid, prev.solution);
      return { ...prev, grid: newGrid, isCompleted: isSolved };
    });
  }, []);

  // Drag interaction transient state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartCellRef = useRef<CellPosition | null>(null);
  const lastDragCellRef = useRef<CellPosition | null>(null);
  const dragTargetStateRef = useRef<CellState | null>(null);
  const currentDragStrokeRef = useRef<CellChange[]>([]);

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<HistoryStep[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryStep[]>([]);

  // Derived state: row & col completion masks
  const { completedRows, completedCols } = useMemo(() => {
    const { grid, solution, height, width } = board;
    const rows = Array.from({ length: height }, (_, r) =>
      checkRowCompleted(grid, solution, r)
    );
    const cols = Array.from({ length: width }, (_, c) =>
      checkColCompleted(grid, solution, c)
    );
    return { completedRows: rows, completedCols: cols };
  }, [board]);

  // Execute board state update with completion check
  const updateBoardWithGrid = useCallback(
    (
      newGrid: CellState[][],
      historyStep?: HistoryStep
    ) => {
      setBoard((prev) => {
        let finalGrid = newGrid;
        const isSolved = checkIsSolved(finalGrid, prev.solution);

        // Optional auto-cross logic for lines completed by user's action
        if (autoCrossCompletedLines && !isSolved) {
          const autoCrossChanges: CellChange[] = [];
          
          for (let r = 0; r < prev.height; r++) {
            if (checkRowCompleted(finalGrid, prev.solution, r)) {
              const { newGrid: updatedGrid, updatedCells } = autoCrossLineInGrid(
                finalGrid,
                'row',
                r
              );
              finalGrid = updatedGrid;
              updatedCells.forEach((pos) => {
                autoCrossChanges.push({
                  row: pos.row,
                  col: pos.col,
                  prev: CellState.EMPTY,
                  next: CellState.CROSS,
                });
              });
            }
          }

          for (let c = 0; c < prev.width; c++) {
            if (checkColCompleted(finalGrid, prev.solution, c)) {
              const { newGrid: updatedGrid, updatedCells } = autoCrossLineInGrid(
                finalGrid,
                'col',
                c
              );
              finalGrid = updatedGrid;
              updatedCells.forEach((pos) => {
                autoCrossChanges.push({
                  row: pos.row,
                  col: pos.col,
                  prev: CellState.EMPTY,
                  next: CellState.CROSS,
                });
              });
            }
          }

          if (historyStep && autoCrossChanges.length > 0) {
            historyStep.changes.push(...autoCrossChanges);
          }
        }

        const wasAlreadyCompleted = prev.isCompleted;
        const nextIsCompleted = isSolved;

        if (!wasAlreadyCompleted && nextIsCompleted) {
          onSolve?.();
        }

        return {
          ...prev,
          grid: finalGrid,
          isCompleted: nextIsCompleted,
        };
      });

      if (enableHistory && historyStep && historyStep.changes.length > 0) {
        setUndoStack((stack) => [...stack, historyStep]);
        setRedoStack([]);
      }
    },
    [autoCrossCompletedLines, enableHistory, onSolve]
  );

  // Direct cell tap handler
  const handleCellTap = useCallback(
    (row: number, col: number) => {
      if (board.isCompleted) return;

      const currentCellState = board.grid[row][col];
      const targetState = getNextCellState(currentCellState, inputMode);

      const newGrid = board.grid.map((r, rIdx) =>
        rIdx === row
          ? r.map((c, cIdx) => (cIdx === col ? targetState : c))
          : [...r]
      );

      const historyStep: HistoryStep = {
        changes: [
          {
            row,
            col,
            prev: currentCellState,
            next: targetState,
          },
        ],
      };

      updateBoardWithGrid(newGrid, historyStep);
    },
    [board, inputMode, updateBoardWithGrid]
  );

  // Drag stroke start
  const handleDragStart = useCallback(
    (row: number, col: number) => {
      if (board.isCompleted) return;

      const startState = board.grid[row][col];
      const targetState = getNextCellState(startState, inputMode);

      dragStartCellRef.current = { row, col };
      lastDragCellRef.current = { row, col };
      dragTargetStateRef.current = targetState;
      currentDragStrokeRef.current = [];

      setIsDragging(true);

      // Apply to first cell
      const newGrid = board.grid.map((r, rIdx) =>
        rIdx === row
          ? r.map((c, cIdx) => (cIdx === col ? targetState : c))
          : [...r]
      );

      currentDragStrokeRef.current.push({
        row,
        col,
        prev: startState,
        next: targetState,
      });

      setBoard((prev) => ({ ...prev, grid: newGrid }));
    },
    [board, inputMode]
  );

  // Drag stroke motion interpolation
  const handleDragMove = useCallback(
    (row: number, col: number) => {
      if (!isDragging || !lastDragCellRef.current || dragTargetStateRef.current === null) {
        return;
      }

      const lastCell = lastDragCellRef.current;
      if (lastCell.row === row && lastCell.col === col) {
        return;
      }

      const targetState = dragTargetStateRef.current;
      const interpolatedCells = getLineInterpolatedCells(lastCell, { row, col });

      let gridModified = false;
      const currentGrid = board.grid;

      // Copy grid for mutation
      const newGrid = currentGrid.map((r) => [...r]);

      for (const cell of interpolatedCells) {
        const { row: r, col: c } = cell;
        if (r >= 0 && r < board.height && c >= 0 && c < board.width) {
          const existingState = newGrid[r][c];
          if (existingState !== targetState) {
            newGrid[r][c] = targetState;
            currentDragStrokeRef.current.push({
              row: r,
              col: c,
              prev: existingState,
              next: targetState,
            });
            gridModified = true;
          }
        }
      }

      lastDragCellRef.current = { row, col };

      if (gridModified) {
        setBoard((prev) => ({ ...prev, grid: newGrid }));
      }
    },
    [board.grid, board.height, board.width, isDragging]
  );

  // Drag stroke end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    dragStartCellRef.current = null;
    lastDragCellRef.current = null;
    dragTargetStateRef.current = null;

    const strokeChanges = currentDragStrokeRef.current;
    currentDragStrokeRef.current = [];

    if (strokeChanges.length > 0) {
      const historyStep: HistoryStep = { changes: strokeChanges };
      updateBoardWithGrid(board.grid, historyStep);
    }
  }, [board.grid, isDragging, updateBoardWithGrid]);

  // Mode switching
  const setInputMode = useCallback((mode: InputMode) => {
    setInputModeState(mode);
  }, []);

  const toggleInputMode = useCallback(() => {
    setInputModeState((prev) => (prev === 'FILL' ? 'CROSS' : 'FILL'));
  }, []);

  // Manual auto-cross for completed line
  const autoCrossLine = useCallback(
    (type: 'row' | 'col', index: number) => {
      if (board.isCompleted) return;
      const { newGrid, updatedCells } = autoCrossLineInGrid(board.grid, type, index);
      if (updatedCells.length > 0) {
        const historyStep: HistoryStep = {
          changes: updatedCells.map((pos) => ({
            row: pos.row,
            col: pos.col,
            prev: CellState.EMPTY,
            next: CellState.CROSS,
          })),
        };
        updateBoardWithGrid(newGrid, historyStep);
      }
    },
    [board.grid, board.isCompleted, updateBoardWithGrid]
  );

  // Undo action
  const undo = useCallback(() => {
    if (board.isCompleted || !enableHistory || undoStack.length === 0) return;

    const lastStep = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));

    setBoard((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      for (const change of lastStep.changes) {
        newGrid[change.row][change.col] = change.prev;
      }
      return {
        ...prev,
        grid: newGrid,
        isCompleted: checkIsSolved(newGrid, prev.solution),
      };
    });

    setRedoStack((stack) => [...stack, lastStep]);
  }, [board.isCompleted, enableHistory, undoStack]);

  // Redo action
  const redo = useCallback(() => {
    if (board.isCompleted || !enableHistory || redoStack.length === 0) return;

    const nextStep = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));

    setBoard((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      for (const change of nextStep.changes) {
        newGrid[change.row][change.col] = change.next;
      }
      return {
        ...prev,
        grid: newGrid,
        isCompleted: checkIsSolved(newGrid, prev.solution),
      };
    });

    setUndoStack((stack) => [...stack, nextStep]);
  }, [board.isCompleted, enableHistory, redoStack]);

  // Board reset
  const reset = useCallback(() => {
    if (board.isCompleted) return;
    setBoard((prev) => ({
      ...prev,
      grid: createEmptyGrid(prev.height, prev.width),
      isCompleted: false,
    }));
    setUndoStack([]);
    setRedoStack([]);
  }, [board.isCompleted]);

  return {
    board,
    grid: board.grid,
    inputMode,
    isDragging,
    isCompleted: board.isCompleted,
    completedRows,
    completedCols,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    handleCellTap,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setInputMode,
    toggleInputMode,
    autoCrossLine,
    undo,
    redo,
    reset,
    setGridState,
  };
}
