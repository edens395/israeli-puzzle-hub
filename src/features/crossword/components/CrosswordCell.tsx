import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { tapLight } from '../../../services/haptics';
import { playPaperTap } from '../../../services/soundEffects';
import { CrosswordCellState } from '../types/crossword';

export interface CrosswordCellProps {
  cell: CrosswordCellState;
  size: number;
  isSelected?: boolean;
  isInActiveWord?: boolean;
  onSelect: (row: number, col: number) => void;
}

const CrosswordCellComponent: React.FC<CrosswordCellProps> = ({
  cell,
  size,
  isSelected = false,
  isInActiveWord = false,
  onSelect,
}) => {
  const { theme } = useTheme();
  const { row, col, userLetter, isBlocked, clueNumber, isError, isRevealed } = cell;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Spring bounce animation when userLetter changes
  useEffect(() => {
    if (userLetter !== '') {
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
    }
  }, [scaleAnim, userLetter]);

  if (isBlocked) {
    return (
      <View
        style={[
          styles.blockedCell,
          { width: size, height: size, backgroundColor: theme.colors.textPrimary, borderColor: theme.colors.border },
        ]}
      />
    );
  }

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
        isInActiveWord && { backgroundColor: theme.colors.activeWordBg },
        isSelected && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong, borderWidth: 2 },
        isError && { backgroundColor: theme.colors.errorBg },
        isRevealed && { backgroundColor: theme.colors.successBg },
      ]}
      onPress={() => {
        tapLight();
        onSelect(row, col);
      }}
    >
      {/* Top-Right Clue Number for Hebrew RTL Corner */}
      {clueNumber !== undefined && clueNumber > 0 && (
        <Text
          style={[
            styles.clueNumberText,
            { fontSize: Math.max(9, size * 0.22), color: isSelected ? '#1A1A1C' : theme.colors.textSecondary },
          ]}
        >
          {clueNumber}
        </Text>
      )}

      {/* Main Hebrew Letter with Spring Bounce */}
      {userLetter !== '' && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text
            style={[
              styles.letterText,
              { fontSize: size * 0.55, color: isSelected ? '#1A1A1C' : isError ? theme.colors.errorText : theme.colors.textPrimary },
            ]}
          >
            {userLetter}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

function areEqual(prevProps: CrosswordCellProps, nextProps: CrosswordCellProps) {
  return (
    prevProps.size === nextProps.size &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isInActiveWord === nextProps.isInActiveWord &&
    prevProps.cell.userLetter === nextProps.cell.userLetter &&
    prevProps.cell.isBlocked === nextProps.cell.isBlocked &&
    prevProps.cell.isError === nextProps.cell.isError &&
    prevProps.cell.isRevealed === nextProps.cell.isRevealed
  );
}

export const CrosswordCell = memo(CrosswordCellComponent, areEqual);

const styles = StyleSheet.create({
  blockedCell: {
    borderWidth: 0.5,
  },
  cellContainer: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clueNumberText: {
    position: 'absolute',
    top: 2,
    right: 3,
    fontWeight: '800',
    includeFontPadding: false,
  },
  letterText: {
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
