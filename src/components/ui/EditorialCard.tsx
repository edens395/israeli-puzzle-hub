import React from 'react';
import { Pressable, StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface EditorialCardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'flat' | 'tinted';
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  children,
  onPress,
  variant = 'flat',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'tinted':
        return theme.colors.bgSecondary;
      case 'elevated':
      case 'flat':
      default:
        return theme.colors.bgCard;
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.85, backgroundColor: theme.colors.bgSecondary },
        ]}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
});
