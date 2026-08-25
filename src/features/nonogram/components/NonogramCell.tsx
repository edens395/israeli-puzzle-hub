import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CellState } from '../types/nonogram';

export interface NonogramCellProps {
  state: CellState;
  size: number;
  row: number;
  col: number;
  isRowCompleted?: boolean;
  isColCompleted?: boolean;
  isRight5x5Border?: boolean;
  isBottom5x5Border?: boolean;
}

const NonogramCellComponent: React.FC<NonogramCellProps> = ({
  state,
  size,
  isRowCompleted = false,
  isColCompleted = false,
  isRight5x5Border = false,
  isBottom5x5Border = false,
}) => {
  const isLineCompleted = isRowCompleted || isColCompleted;

  return (
    <View
      style={[
        styles.cellContainer,
        { width: size, height: size },
        isRight5x5Border && styles.borderRightThick,
        isBottom5x5Border && styles.borderBottomThick,
        isLineCompleted && styles.completedCellBg,
      ]}
    >
      {state === CellState.FILLED && (
        <View style={[styles.filledBlock, isLineCompleted && styles.filledBlockCompleted]} />
      )}

      {state === CellState.CROSS && (
        <Text style={[styles.crossText, { fontSize: size * 0.55 }]}>✕</Text>
      )}
    </View>
  );
};

// Strict memo comparator function to prevent re-renders of untouched cells during drag
function areEqual(prevProps: NonogramCellProps, nextProps: NonogramCellProps) {
  return (
    prevProps.state === nextProps.state &&
    prevProps.size === nextProps.size &&
    prevProps.isRowCompleted === nextProps.isRowCompleted &&
    prevProps.isColCompleted === nextProps.isColCompleted &&
    prevProps.isRight5x5Border === nextProps.isRight5x5Border &&
    prevProps.isBottom5x5Border === nextProps.isBottom5x5Border
  );
}

export const NonogramCell = memo(NonogramCellComponent, areEqual);

const styles = StyleSheet.create({
  cellContainer: {
    borderWidth: 0.5,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderRightThick: {
    borderRightWidth: 2,
    borderRightColor: '#64748B',
  },
  borderBottomThick: {
    borderBottomWidth: 2,
    borderBottomColor: '#64748B',
  },
  completedCellBg: {
    backgroundColor: '#1E293B',
  },
  filledBlock: {
    width: '90%',
    height: '90%',
    backgroundColor: '#38BDF8', // Vivid cyan filled block
    borderRadius: 3,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  filledBlockCompleted: {
    backgroundColor: '#0284C7',
  },
  crossText: {
    color: '#94A3B8',
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
