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
  isCompleted,
  onSetInputMode,
  onUndo,
  onRedo,
  onReset,
}) => {
  const { theme, isDark } = useTheme();

  // Active tool highlight colors (Only applied when puzzle is NOT completed)
  const isFillActive = !isCompleted && inputMode === 'FILL';
  const isCrossActive = !isCompleted && inputMode === 'CROSS';

  const activeBg = isDark ? '#F8FAFC' : '#1E293B';
  const activeText = isDark ? '#0F172A' : '#FFFFFF';
  const inactiveText = theme.colors.textSecondary;

  return (
    <View
      style={styles.container}
      pointerEvents={isCompleted ? 'none' : 'auto'}
    >
      {/* Completed Status Banner */}
      {isCompleted && (
        <View
          style={[
            styles.completedBanner,
            { backgroundColor: theme.colors.successBg, borderColor: theme.colors.successText },
          ]}
        >
          <Text style={[styles.completedBannerText, { color: theme.colors.successText }]}>
            ✓ חידה זו נפתרה (צפייה בפתרון בלבד)
          </Text>
        </View>
      )}

      {/* Tool Selector: Clean Monochrome Segmented Button (Fill vs Cross) */}
      <View
        style={[
          styles.toolSegmentContainer,
          { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
          isCompleted && styles.disabledContainer,
        ]}
      >
        {/* Fill Button */}
        <Pressable
          style={[
            styles.toolButton,
            isFillActive && { backgroundColor: activeBg },
            isCompleted && styles.disabledButton,
          ]}
          onPress={() => !isCompleted && onSetInputMode('FILL')}
          disabled={isCompleted}
        >
          <View
            style={[
              styles.toolIconSquare,
              { backgroundColor: isFillActive ? activeText : inactiveText },
              isCompleted && { opacity: 0.3 },
            ]}
          />
          <Text
            style={[
              styles.toolText,
              { color: isFillActive ? activeText : inactiveText },
              isFillActive && { fontWeight: '800' },
              isCompleted && styles.disabledText,
            ]}
          >
            מילוי (משבצת)
          </Text>
        </Pressable>

        {/* Cross X Button */}
        <Pressable
          style={[
            styles.toolButton,
            isCrossActive && { backgroundColor: activeBg },
            isCompleted && styles.disabledButton,
          ]}
          onPress={() => !isCompleted && onSetInputMode('CROSS')}
          disabled={isCompleted}
        >
          <Text
            style={[
              styles.toolText,
              { color: isCrossActive ? activeText : inactiveText },
              isCrossActive && { fontWeight: '800' },
              isCompleted && styles.disabledText,
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
            (!canUndo || isCompleted) && styles.disabledButton,
          ]}
          onPress={onUndo}
          disabled={!canUndo || isCompleted}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }, (!canUndo || isCompleted) && styles.disabledText]}>
            ↩ בטל
          </Text>
        </Pressable>

        {/* Redo Button */}
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            (!canRedo || isCompleted) && styles.disabledButton,
          ]}
          onPress={onRedo}
          disabled={!canRedo || isCompleted}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }, (!canRedo || isCompleted) && styles.disabledText]}>
            ↪ בצע שוב
          </Text>
        </Pressable>

        {/* Reset Button */}
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            isCompleted && styles.disabledButton,
          ]}
          onPress={onReset}
          disabled={isCompleted}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }, isCompleted && styles.disabledText]}>
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
  completedBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBannerText: {
    fontSize: 13,
    fontWeight: '700',
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
  disabledContainer: {
    opacity: 0.45,
  },
  disabledButton: {
    opacity: 0.35,
  },
  disabledText: {
    opacity: 0.35,
  },
});
