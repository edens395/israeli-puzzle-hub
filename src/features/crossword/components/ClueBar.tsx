import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { ClueItem, CrosswordDirection } from '../types/crossword';

export interface ClueBarProps {
  activeClue: ClueItem | null;
  selectedDirection: CrosswordDirection;
  onNextClue: () => void;
  onPrevClue: () => void;
  onToggleDirection: () => void;
}

export const ClueBar: React.FC<ClueBarProps> = ({
  activeClue,
  selectedDirection,
  onNextClue,
  onPrevClue,
  onToggleDirection,
}) => {
  const { theme } = useTheme();
  const directionText = selectedDirection === 'across' ? 'מאוזן' : 'מאונך';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgCard,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Previous Clue Arrow (RTL Right Button) */}
      <Pressable
        style={[
          styles.arrowButton,
          { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border },
        ]}
        onPress={onPrevClue}
      >
        <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>▶</Text>
      </Pressable>

      {/* Center Clue Information Banner */}
      <Pressable style={styles.clueContentContainer} onPress={onToggleDirection}>
        <View style={styles.clueBadgeRow}>
          <View style={[styles.clueBadge, { backgroundColor: theme.colors.bgHighlight }]}>
            <Text style={styles.clueBadgeText}>
              {directionText} {activeClue ? activeClue.number : ''}
            </Text>
          </View>
          {activeClue && (
            <Text style={[styles.clueLengthText, { color: theme.colors.textSecondary }]}>
              ({activeClue.length} אותיות)
            </Text>
          )}
        </View>

        <Text style={[styles.cluePromptText, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {activeClue ? activeClue.text : 'לחץ על משבצת להצגת ההגדרה'}
        </Text>
      </Pressable>

      {/* Next Clue Arrow (RTL Left Button) */}
      <Pressable
        style={[
          styles.arrowButton,
          { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border },
        ]}
        onPress={onNextClue}
      >
        <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>◀</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    gap: 8,
    marginVertical: 4,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '700',
  },
  clueContentContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clueBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  clueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clueBadgeText: {
    color: '#1A1A1C',
    fontSize: 11,
    fontWeight: '800',
  },
  clueLengthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cluePromptText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
});
