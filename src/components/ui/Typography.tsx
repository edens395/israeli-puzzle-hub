import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'serif' | 'sans';
  color?: string;
}

export const Heading: React.FC<TypographyProps> = ({
  children,
  variant = 'serif',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.heading,
        {
          color: color || theme.colors.textPrimary,
          fontFamily: variant === 'serif' ? theme.fonts.serif : theme.fonts.sans,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Title: React.FC<TypographyProps> = ({
  children,
  variant = 'serif',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.title,
        {
          color: color || theme.colors.textPrimary,
          fontFamily: variant === 'serif' ? theme.fonts.serif : theme.fonts.sans,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Subheading: React.FC<TypographyProps> = ({
  children,
  variant = 'sans',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.subheading,
        {
          color: color || theme.colors.textSecondary,
          fontFamily: variant === 'serif' ? theme.fonts.serif : theme.fonts.sans,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const BodyText: React.FC<TypographyProps> = ({
  children,
  variant = 'sans',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.body,
        {
          color: color || theme.colors.textPrimary,
          fontFamily: variant === 'serif' ? theme.fonts.serif : theme.fonts.sans,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Caption: React.FC<TypographyProps> = ({
  children,
  variant = 'sans',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.caption,
        {
          color: color || theme.colors.textMuted,
          fontFamily: variant === 'serif' ? theme.fonts.serif : theme.fonts.sans,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'right',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
});
