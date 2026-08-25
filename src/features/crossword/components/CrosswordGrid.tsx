import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { CellPosition, ClueItem, CrosswordCellState } from '../types/crossword';
import { CrosswordCell } from './CrosswordCell';

export interface CrosswordGridProps {
  grid: CrosswordCellState[][];
  selectedCell: CellPosition | null;
  activeClue: ClueItem | null;
  onSelectCell: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  selectedCell,
  activeClue,
  onSelectCell,
}) => {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  const [containerWidth, setContainerWidth] = useState<number>(340);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  }, []);

  const cellSize = useMemo(() => {
    const available = Math.max(200, containerWidth - 24);
    return Math.max(28, Math.min(60, Math.floor(available / cols)));
  }, [cols, containerWidth]);

  // Set of position keys in active clue: "r-c"
  const activeWordPositionsSet = useMemo(() => {
    const set = new Set<string>();
    if (activeClue) {
      activeClue.cellPositions.forEach((pos) => {
        set.add(`${pos.row}-${pos.col}`);
      });
    }
    return set;
  }, [activeClue]);

  return (
    <View style={styles.outerContainer} onLayout={handleContainerLayout}>
      <View
        style={[
          styles.gridContainer,
          { width: cellSize * cols + 2, height: cellSize * rows + 2 },
        ]}
      >
        {grid.map((rowCells, rIdx) => (
          <View key={`cw-row-${rIdx}`} style={styles.gridRow}>
            {rowCells.map((cellState, cIdx) => {
              const isSelected =
                selectedCell?.row === rIdx && selectedCell?.col === cIdx;
              const isInActiveWord = activeWordPositionsSet.has(`${rIdx}-${cIdx}`);

              return (
                <CrosswordCell
                  key={`cw-cell-${rIdx}-${cIdx}`}
                  cell={cellState}
                  size={cellSize}
                  isSelected={isSelected}
                  isInActiveWord={isInActiveWord}
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
    paddingVertical: 8,
  },
  gridContainer: {
    backgroundColor: '#020617',
    borderWidth: 2,
    borderColor: '#475569',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
  },
});
