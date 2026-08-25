import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../../context/ThemeContext';
import { CellState, Clue, Grid } from '../types/nonogram';

export interface NonogramGridProps {
  grid: Grid;
  rowClues: Clue[];
  colClues: Clue[];
  completedRows: boolean[];
  completedCols: boolean[];
  onCellTap: (row: number, col: number) => void;
  onDragStart: (row: number, col: number) => void;
  onDragMove: (row: number, col: number) => void;
  onDragEnd: () => void;
}

export const NonogramGrid: React.FC<NonogramGridProps> = ({
  grid,
  rowClues,
  colClues,
  completedRows,
  completedCols,
  onCellTap,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const { theme } = useTheme();
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  const maxRowClueLength = useMemo(
    () => Math.max(1, ...rowClues.map((c) => c.length)),
    [rowClues]
  );
  const maxColClueLength = useMemo(
    () => Math.max(1, ...colClues.map((c) => c.length)),
    [colClues]
  );

  const [containerWidth, setContainerWidth] = useState<number>(340);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  }, []);

  const rowClueAreaWidth = useMemo(() => maxRowClueLength * 24 + 12, [maxRowClueLength]);
  const availableMatrixWidth = useMemo(
    () => Math.max(200, containerWidth - rowClueAreaWidth - 16),
    [containerWidth, rowClueAreaWidth]
  );
  const cellSize = useMemo(
    () => Math.max(16, Math.min(36, Math.floor(availableMatrixWidth / width))),
    [availableMatrixWidth, width]
  );

  const colClueAreaHeight = useMemo(
    () => maxColClueLength * Math.max(16, cellSize * 0.55) + 10,
    [maxColClueLength, cellSize]
  );

  const resolveCellCoordinates = useCallback(
    (x: number, y: number): { row: number; col: number } | null => {
      if (cellSize <= 0 || width <= 0 || height <= 0) return null;

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < height && col >= 0 && col < width) {
        return { row, col };
      }
      return null;
    },
    [cellSize, height, width]
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd((e) => {
          const coords = resolveCellCoordinates(e.x, e.y);
          if (coords) {
            onCellTap(coords.row, coords.col);
          }
        }),
    [onCellTap, resolveCellCoordinates]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onStart((e) => {
          const coords = resolveCellCoordinates(e.x, e.y);
          if (coords) {
            onDragStart(coords.row, coords.col);
          }
        })
        .onUpdate((e) => {
          const coords = resolveCellCoordinates(e.x, e.y);
          if (coords) {
            onDragMove(coords.row, coords.col);
          }
        })
        .onEnd(() => {
          onDragEnd();
        })
        .onFinalize(() => {
          onDragEnd();
        }),
    [onDragEnd, onDragMove, onDragStart, resolveCellCoordinates]
  );

  const combinedGesture = useMemo(
    () => Gesture.Race(tapGesture, panGesture),
    [panGesture, tapGesture]
  );

  return (
    <View style={styles.mainContainer} onLayout={handleContainerLayout}>
      <View style={{ width: width * cellSize + rowClueAreaWidth, alignSelf: 'center' }}>
        
        {/* Top Header Row: [Corner Spacer on LEFT] [Col Clues on RIGHT] */}
        <View style={styles.topRowHeader}>
          {/* Top-Left Corner Spacer Box */}
          <View
            style={[
              styles.cornerBox,
              {
                width: rowClueAreaWidth,
                height: colClueAreaHeight,
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          />

          {/* Top Column Clues on RIGHT */}
          <View style={[styles.colCluesContainer, { width: width * cellSize, height: colClueAreaHeight }]}>
            {colClues.map((clue, colIdx) => {
              const isCompleted = completedCols[colIdx];
              return (
                <View
                  key={`col-clue-${colIdx}`}
                  style={[
                    styles.colClueColumn,
                    {
                      width: cellSize,
                      height: colClueAreaHeight,
                      backgroundColor: theme.colors.bgSecondary,
                      borderColor: theme.colors.border,
                    },
                    isCompleted && { opacity: 0.5 },
                    (colIdx + 1) % 5 === 0 && colIdx < width - 1 && { borderRightWidth: 2, borderRightColor: theme.colors.borderStrong },
                  ]}
                >
                  {clue.map((num, nIdx) => (
                    <Text
                      key={`col-${colIdx}-num-${nIdx}`}
                      style={[
                        styles.clueText,
                        { fontSize: Math.max(10, cellSize * 0.45), color: theme.colors.textPrimary },
                        isCompleted && styles.completedClueText,
                      ]}
                    >
                      {num}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        {/* Main Grid Row: [Row Clues on LEFT] [Cell Matrix on RIGHT] */}
        <View style={styles.matrixAndRowCluesContainer}>
          {/* Side Row Clues on the LEFT */}
          <View style={[styles.rowCluesContainer, { width: rowClueAreaWidth }]}>
            {rowClues.map((clue, rowIdx) => {
              const isCompleted = completedRows[rowIdx];
              return (
                <View
                  key={`row-clue-${rowIdx}`}
                  style={[
                    styles.rowClueRow,
                    {
                      height: cellSize,
                      width: rowClueAreaWidth,
                      backgroundColor: theme.colors.bgSecondary,
                      borderColor: theme.colors.border,
                    },
                    isCompleted && { opacity: 0.5 },
                    (rowIdx + 1) % 5 === 0 && rowIdx < height - 1 && { borderBottomWidth: 2, borderBottomColor: theme.colors.borderStrong },
                  ]}
                >
                  {clue.map((num, nIdx) => (
                    <Text
                      key={`row-${rowIdx}-num-${nIdx}`}
                      style={[
                        styles.clueText,
                        { fontSize: Math.max(10, cellSize * 0.45), color: theme.colors.textPrimary },
                        isCompleted && styles.completedClueText,
                      ]}
                    >
                      {num}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>

          {/* Interactive Cell Matrix on the RIGHT */}
          <GestureDetector gesture={combinedGesture}>
            <View
              style={[
                styles.matrixContainer,
                {
                  width: width * cellSize,
                  height: height * cellSize,
                  backgroundColor: theme.colors.bgCard,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              {grid.map((rowCells, rIdx) => (
                <View key={`row-${rIdx}`} style={styles.matrixRow}>
                  {rowCells.map((cellState, cIdx) => (
                    <View
                      key={`cell-${rIdx}-${cIdx}`}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: theme.colors.bgCard,
                          borderColor: theme.colors.border,
                        },
                        cellState === CellState.FILLED && { backgroundColor: theme.colors.textPrimary, borderColor: theme.colors.textPrimary },
                        cellState === CellState.CROSS && { backgroundColor: theme.colors.bgSecondary },
                        (cIdx + 1) % 5 === 0 && cIdx < width - 1 && { borderRightWidth: 2, borderRightColor: theme.colors.borderStrong },
                        (rIdx + 1) % 5 === 0 && rIdx < height - 1 && { borderBottomWidth: 2, borderBottomColor: theme.colors.borderStrong },
                      ]}
                    >
                      {cellState === CellState.CROSS && (
                        <Text style={[styles.crossText, { fontSize: cellSize * 0.6, color: theme.colors.errorText }]}>
                          ✕
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </GestureDetector>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  topRowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cornerBox: {
    borderWidth: 1,
  },
  colCluesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  colClueColumn: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingBottom: 4,
    gap: 6,
  },
  matrixAndRowCluesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowCluesContainer: {
    flexDirection: 'column',
  },
  rowClueRow: {
    flexDirection: 'row', // Left-to-right order for row clues on the left side
    justifyContent: 'flex-end', // Align numbers right against the grid
    alignItems: 'center',
    borderWidth: 0.5,
    paddingRight: 6,
    gap: 8, // Distinct horizontal gap between clue numbers
  },
  completedClueText: {
    textDecorationLine: 'line-through',
  },
  clueText: {
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    minWidth: 12,
  },
  matrixContainer: {
    borderWidth: 2,
  },
  matrixRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossText: {
    fontWeight: '900',
    includeFontPadding: false,
  },
});
