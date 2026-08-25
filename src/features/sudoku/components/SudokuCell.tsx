import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { tapLight } from '../../../services/haptics';
import { playPaperTap, playPencilScratch } from '../../../services/soundEffects';
import { SudokuCellState } from '../types/sudoku';

export interface SudokuCellProps {
  cell: SudokuCellState;
  size: number;
  isSelected?: boolean;
  isRelated?: boolean;
  isSameNumber?: boolean;
  onSelect: (row: number, col: number) => void;
}

const SudokuCellComponent: React.FC<SudokuCellProps> = ({
  cell,
  size,
  isSelected = false,
  isRelated = false,
  isSameNumber = false,
  onSelect,
}) => {
  const { theme } = useTheme();
  const { row, col, value, isGiven, isError, notes } = cell;

  const isThickRight = col % 3 === 2 && col < 8;
  const isThickBottom = row % 3 === 2 && row < 8;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Spring bounce animation on value or notes update
  useEffect(() => {
    if (value > 0 && !isGiven) {
      tapLight();
      playPaperTap();
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (notes.length > 0) {
      playPencilScratch();
    }
  }, [isGiven, notes.length, scaleAnim, value]);

  return (
    <Pressable
      style={[
        styles.cellContainer,
        {
          width: size,
          height: size,
          backgroundColor: theme.colors.bgCard,
          borderColor: theme.colors.border,
        },
        isRelated && { backgroundColor: theme.colors.bgSecondary },
        isSameNumber && { backgroundColor: theme.colors.selectionBg },
        isSelected && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong, borderWidth: 2 },
        isError && { backgroundColor: theme.colors.errorBg },
        isThickRight && { borderRightWidth: 2.5, borderRightColor: theme.colors.borderStrong },
        isThickBottom && { borderBottomWidth: 2.5, borderBottomColor: theme.colors.borderStrong },
      ]}
      onPress={() => {
        tapLight();
        onSelect(row, col);
      }}
    >
      {value > 0 ? (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text
            style={[
              styles.largeNumberText,
              { fontSize: size * 0.55 },
              {
                color: isSelected
                  ? '#1A1A1C'
                  : isError
                  ? theme.colors.errorText
                  : isGiven
                  ? theme.colors.textPrimary
                  : theme.colors.selectionText,
              },
            ]}
          >
            {value}
          </Text>
        </Animated.View>
      ) : notes.length > 0 ? (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <View key={`note-${n}`} style={styles.noteCell}>
              {notes.includes(n) && (
                <Text style={[styles.noteText, { fontSize: size * 0.24, color: theme.colors.textSecondary }]}>
                  {n}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
};

function areEqual(prevProps: SudokuCellProps, nextProps: SudokuCellProps) {
  return (
    prevProps.size === nextProps.size &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isRelated === nextProps.isRelated &&
    prevProps.isSameNumber === nextProps.isSameNumber &&
    prevProps.cell.value === nextProps.cell.value &&
    prevProps.cell.isGiven === nextProps.cell.isGiven &&
    prevProps.cell.isError === nextProps.cell.isError &&
    prevProps.cell.notes.length === nextProps.cell.notes.length &&
    prevProps.cell.notes.every((n, i) => n === nextProps.cell.notes[i])
  );
}

export const SudokuCell = memo(SudokuCellComponent, areEqual);

const styles = StyleSheet.create({
  cellContainer: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeNumberText: {
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
  },
  notesGrid: {
    width: '90%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontWeight: '600',
    includeFontPadding: false,
  },
});
