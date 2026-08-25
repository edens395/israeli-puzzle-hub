import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { inSameBox } from '../logic/sudokuUtils';
import { CellPosition, SudokuCellState } from '../types/sudoku';
import { SudokuCell } from './SudokuCell';

export interface SudokuGridProps {
  grid: SudokuCellState[][];
  selectedCell: CellPosition | null;
  onSelectCell: (row: number, col: number) => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  selectedCell,
  onSelectCell,
}) => {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = useState<number>(340);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  }, []);

  const cellSize = useMemo(() => {
    const available = Math.max(240, containerWidth - 24);
    return Math.floor(available / 9);
  }, [containerWidth]);

  const selectedValue = useMemo(() => {
    if (!selectedCell) return 0;
    return grid[selectedCell.row]?.[selectedCell.col]?.value || 0;
  }, [grid, selectedCell]);

  return (
    <View style={styles.outerContainer} onLayout={handleContainerLayout}>
      <View
        style={[
          styles.gridContainer,
          {
            width: cellSize * 9 + 4,
            height: cellSize * 9 + 4,
            backgroundColor: theme.colors.bgCard,
            borderColor: theme.colors.borderStrong,
          },
        ]}
      >
        {grid.map((rowCells, rIdx) => (
          <View key={`sudoku-row-${rIdx}`} style={styles.gridRow}>
            {rowCells.map((cellState, cIdx) => {
              const isSelected =
                selectedCell?.row === rIdx && selectedCell?.col === cIdx;
              const isRelated =
                !!selectedCell &&
                (selectedCell.row === rIdx ||
                  selectedCell.col === cIdx ||
                  inSameBox(selectedCell.row, selectedCell.col, rIdx, cIdx));
              const isSameNumber =
                selectedValue > 0 &&
                cellState.value > 0 &&
                cellState.value === selectedValue;

              return (
                <SudokuCell
                  key={`sudoku-cell-${rIdx}-${cIdx}`}
                  cell={cellState}
                  size={cellSize}
                  isSelected={isSelected}
                  isRelated={isRelated}
                  isSameNumber={isSameNumber}
                  onSelect={onSelectCell}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gridContainer: {
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
});
