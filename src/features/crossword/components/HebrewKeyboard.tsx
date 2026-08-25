import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export interface HebrewKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onCheck?: () => void;
}

const ROW_1 = ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'];
const ROW_2 = ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'];
const ROW_3 = ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ץ'];

export const HebrewKeyboard: React.FC<HebrewKeyboardProps> = ({
  onKeyPress,
  onBackspace,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        {ROW_1.map((char) => (
          <Pressable
            key={`key-${char}`}
            style={[
              styles.keyButton,
              { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            ]}
            onPress={() => onKeyPress(char)}
          >
            <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{char}</Text>
          </Pressable>
        ))}
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {ROW_2.map((char) => (
          <Pressable
            key={`key-${char}`}
            style={[
              styles.keyButton,
              { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            ]}
            onPress={() => onKeyPress(char)}
          >
            <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{char}</Text>
          </Pressable>
        ))}
      </View>

      {/* Row 3 with Backspace */}
      <View style={styles.row}>
        {ROW_3.map((char) => (
          <Pressable
            key={`key-${char}`}
            style={[
              styles.keyButton,
              { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            ]}
            onPress={() => onKeyPress(char)}
          >
            <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{char}</Text>
          </Pressable>
        ))}

        {/* Backspace Key */}
        <Pressable
          style={[
            styles.keyButton,
            styles.specialKeyButton,
            { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border },
          ]}
          onPress={onBackspace}
        >
          <Text style={[styles.specialKeyText, { color: theme.colors.textPrimary }]}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keyButton: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keyText: {
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
  specialKeyButton: {
    flex: 1.2,
  },
  specialKeyText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
