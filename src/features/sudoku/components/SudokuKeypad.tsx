import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { SudokuInputMode } from '../types/sudoku';

export interface SudokuKeypadProps {
  inputMode: SudokuInputMode;
  canUndo: boolean;
  numberCounts: Record<number, number>;
  onInsertNumber: (num: number) => void;
  onErase: () => void;
  onToggleInputMode: () => void;
  onUndo: () => void;
  onHint: () => void;
}

export const SudokuKeypad: React.FC<SudokuKeypadProps> = ({
  inputMode,
  canUndo,
  numberCounts,
  onInsertNumber,
  onErase,
  onToggleInputMode,
  onUndo,
  onHint,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Top Action Control Toolbar */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            !canUndo && styles.disabledButton,
          ]}
          onPress={onUndo}
          disabled={!canUndo}
        >
          <Text style={[styles.actionIcon, { color: theme.colors.textPrimary }, !canUndo && styles.disabledText]}>↩</Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }, !canUndo && styles.disabledText]}>בטל</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
          onPress={onErase}
        >
          <Text style={[styles.actionIcon, { color: theme.colors.textPrimary }]}>⌫</Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>מחק</Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            inputMode === 'NOTES' && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong },
          ]}
          onPress={onToggleInputMode}
        >
          <Text style={[styles.actionIcon, inputMode === 'NOTES' && { color: '#1A1A1C' }]}>
            ✏️
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }, inputMode === 'NOTES' && { color: '#1A1A1C', fontWeight: '800' }]}>
            {inputMode === 'NOTES' ? 'הערות: פעיל' : 'הערות'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
          onPress={onHint}
        >
          <Text style={{ fontSize: 18 }}>💡</Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>רמז</Text>
        </Pressable>
      </View>

      {/* 1-9 Number Keypad */}
      <View style={styles.keypadRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = numberCounts[num] || 0;
          const isMaxedOut = count >= 9;

          return (
            <Pressable
              key={`keypad-${num}`}
              style={[
                styles.numKey,
                { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
                isMaxedOut && { opacity: 0.4, backgroundColor: theme.colors.bgSecondary },
              ]}
              onPress={() => onInsertNumber(num)}
            >
              <Text style={[styles.numKeyText, { color: theme.colors.textPrimary }, isMaxedOut && { color: theme.colors.textMuted }]}>
                {num}
              </Text>
              {count > 0 && count < 9 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.bgSecondary }]}>
                  <Text style={[styles.countBadgeText, { color: theme.colors.textSecondary }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 70,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.5,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  numKey: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  numKeyText: {
    fontSize: 20,
    fontWeight: '800',
  },
  countBadge: {
    position: 'absolute',
    top: 2,
    right: 3,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
