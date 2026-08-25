import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { InputMode } from '../types/nonogram';

export interface NonogramControlsProps {
  inputMode: InputMode;
  canUndo: boolean;
  canRedo: boolean;
  isCompleted: boolean;
  onSetInputMode: (mode: InputMode) => void;
  onToggleInputMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export const NonogramControls: React.FC<NonogramControlsProps> = ({
  inputMode,
  canUndo,
  canRedo,
  onSetInputMode,
  onUndo,
  onRedo,
  onReset,
}) => {
  const { theme, isDark } = useTheme();

  // Clean monochrome selected tool colors (No yellow)
  const activeBg = isDark ? '#F8FAFC' : '#1E293B';
  const activeText = isDark ? '#0F172A' : '#FFFFFF';
  const inactiveText = theme.colors.textSecondary;

  return (
    <View style={styles.container}>
      {/* Tool Selector: Clean Monochrome Segmented Button (Fill vs Cross) */}
      <View style={[styles.toolSegmentContainer, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
        <Pressable
          style={[
            styles.toolButton,
            inputMode === 'FILL' && { backgroundColor: activeBg },
          ]}
          onPress={() => onSetInputMode('FILL')}
        >
          <View
            style={[
              styles.toolIconSquare,
              { backgroundColor: inputMode === 'FILL' ? activeText : inactiveText },
            ]}
          />
          <Text
            style={[
              styles.toolText,
              { color: inputMode === 'FILL' ? activeText : inactiveText },
              inputMode === 'FILL' && { fontWeight: '800' },
            ]}
          >
            מילוי (משבצת)
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toolButton,
            inputMode === 'CROSS' && { backgroundColor: activeBg },
          ]}
          onPress={() => onSetInputMode('CROSS')}
        >
          <Text
            style={[
              styles.toolText,
              { color: inputMode === 'CROSS' ? activeText : inactiveText },
              inputMode === 'CROSS' && { fontWeight: '800' },
            ]}
          >
            סימון X
          </Text>
        </Pressable>
      </View>

      {/* Action Buttons Row (Undo, Redo, Reset) */}
      <View style={styles.actionsRow}>
        {/* Undo Button */}
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            !canUndo && styles.disabledButton,
          ]}
          onPress={onUndo}
          disabled={!canUndo}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }, !canUndo && styles.disabledText]}>
            ↩ בטל
          </Text>
        </Pressable>

        {/* Redo Button */}
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            !canRedo && styles.disabledButton,
          ]}
          onPress={onRedo}
          disabled={!canRedo}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }, !canRedo && styles.disabledText]}>
            ↪ בצע שוב
          </Text>
        </Pressable>

        {/* Reset Button (Neutral clean styling without red) */}
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
          onPress={onReset}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }]}>
            ↺ איפוס
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  toolSegmentContainer: {
    flexDirection: 'row-reverse',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  toolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  toolIconSquare: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.5,
  },
});
