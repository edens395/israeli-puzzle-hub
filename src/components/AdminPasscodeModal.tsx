import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Caption, Heading } from './ui/Typography';
import { useTheme } from '../context/ThemeContext';

export interface AdminPasscodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Default Admin Passcode (Can be overridden via process.env.EXPO_PUBLIC_ADMIN_PIN)
const DEFAULT_ADMIN_PIN = process.env.EXPO_PUBLIC_ADMIN_PIN || '1337';

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useTheme();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleVerifyPin = () => {
    if (pinInput.trim() === DEFAULT_ADMIN_PIN) {
      setPinInput('');
      setErrorMessage('');
      onSuccess();
    } else {
      setErrorMessage('⚠️ קוד גישה שגוי. גישה נדחתה.');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <Heading variant="serif" style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            🔒 כניסת מנהל (Admin Access)
          </Heading>

          <Caption color={theme.colors.textSecondary} style={styles.modalSubtitle}>
            הזן קוד גישה סודי לצפייה בלוח הבקרה ולניהול מחולל ה-Nonogram
          </Caption>

          <TextInput
            style={[
              styles.pinInput,
              {
                backgroundColor: theme.colors.bgPrimary,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="קוד גישה סודי"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={true}
            keyboardType="number-pad"
            value={pinInput}
            onChangeText={(text) => {
              setPinInput(text);
              if (errorMessage) setErrorMessage('');
            }}
            onSubmitEditing={handleVerifyPin}
            autoFocus={true}
          />

          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <View style={styles.buttonsRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' }]}
              onPress={handleVerifyPin}
            >
              <Text style={[styles.btnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>אישור</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border, borderWidth: 1 }]}
              onPress={() => {
                setPinInput('');
                setErrorMessage('');
                onClose();
              }}
            >
              <Text style={[styles.btnText, { color: theme.colors.textPrimary }]}>ביטול</Text>
            </Pressable>
          </View>

          <Caption color={theme.colors.textMuted} style={styles.hintFooter}>
            ברירת מחדל: 1337 (ניתן לשינוי ב-EXPO_PUBLIC_ADMIN_PIN)
          </Caption>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  pinInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '800',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  hintFooter: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
