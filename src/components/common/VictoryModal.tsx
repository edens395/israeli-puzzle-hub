import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { gameWinCelebration } from '../../services/haptics';
import { playVictoryChime } from '../../services/soundEffects';
import {
  formatSolveTime,
  shareAchievement,
  ShareCategory,
} from '../../utils/shareGenerator';

export interface VictoryModalProps {
  visible: boolean;
  category: ShareCategory;
  puzzleTitle: string;
  elapsedSeconds: number;
  streakDays: number;
  gridPreview?: boolean[][];
  difficulty?: string;
  onClose: () => void;
  onBackToHub: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  category,
  puzzleTitle,
  elapsedSeconds,
  streakDays,
  gridPreview,
  difficulty,
  onClose,
  onBackToHub,
}) => {
  // Trigger celebratory success haptics & victory chime immediately when modal opens
  useEffect(() => {
    if (visible) {
      gameWinCelebration();
      playVictoryChime();
    }
  }, [visible]);

  if (!visible) return null;

  const categoryNames: Record<ShareCategory, string> = {
    nonogram: 'שחור ופתור',
    sudoku: 'סודוקו',
    tashbetz: 'מיני-תשחץ',
  };

  const handleShare = () => {
    shareAchievement({
      category,
      puzzleTitle,
      elapsedSeconds,
      streakDays,
      gridPreview,
      difficulty,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Top Celebration Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.modalIcon}>🏆</Text>
          </View>

          {/* Title & Category Header */}
          <Text style={styles.categoryBadgeText}>
            {categoryNames[category]} • {puzzleTitle}
          </Text>
          <Text style={styles.modalTitle}>
            {category === 'nonogram'
              ? `פתרת את האיור: ${puzzleTitle}! 🎉`
              : 'כל הכבוד! פתרת בהצלחה! 🎉'}
          </Text>

          {/* Stats Summary Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>{formatSolveTime(elapsedSeconds)}</Text>
              <Text style={styles.statLabel}>זמן פתרון</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonCol}>
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>שתף הישג 📤</Text>
            </Pressable>

            <Pressable style={styles.hubButton} onPress={onBackToHub}>
              <Text style={styles.hubButtonText}>חזרה למוסף היומי 🏠</Text>
            </Pressable>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>סגור ✕</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 38,
  },
  categoryBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  highlightStatBox: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  flameStatValue: {
    color: '#818CF8',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  buttonCol: {
    width: '100%',
    gap: 10,
  },
  shareButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  hubButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hubButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
