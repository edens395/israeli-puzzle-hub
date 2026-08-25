export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentGold: string;
  selectionBg: string;
  selectionText: string;
  activeWordBg: string;
  errorBg: string;
  errorText: string;
  successBg: string;
  successText: string;
}

export interface ThemeFonts {
  serif: string;
  sans: string;
}

export type ThemeMode = 'newsprint' | 'dark' | 'classic';

export interface AppTheme {
  name: string;
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

export type ThemePalette = AppTheme;

export const FONTS: ThemeFonts = {
  serif: 'Heebo, Rubik, Assistant, -apple-system, BlinkMacSystemFont, sans-serif',
  sans: 'System, -apple-system, Heebo, Rubik, Assistant, sans-serif',
};

export const THEMES: Record<string, AppTheme> = {
  newsprint: {
    name: 'נייר עיתון (Newsprint 🗞️)',
    mode: 'newsprint',
    fonts: FONTS,
    radii: { xs: 4, sm: 6, md: 10, lg: 16, xl: 24, full: 9999 },
    colors: {
      bgPrimary: '#F8F6F0', // Warm eggshell / newsprint paper canvas
      bgSecondary: '#EFECE6', // Muted secondary paper tint
      bgCard: '#FFFFFF', // Pure crisp white card background
      bgHighlight: '#F9DF6E', // NYT warm selection yellow
      textPrimary: '#1A1A1C', // Deep print charcoal ink
      textSecondary: '#6E6E73', // Muted slate secondary text
      textMuted: '#A1A1A6', // Soft caption text
      border: '#E5E0D8', // Fine 1px newsprint border
      borderStrong: '#1A1A1C', // Sharp border
      accent: '#E0A922', // Editorial newsprint gold accent
      accentGold: '#D97706', // Rich amber flame accent
      selectionBg: '#E3EEFD', // Soft editorial blue selection
      selectionText: '#1B5299', // Editorial blue text
      activeWordBg: 'rgba(227, 238, 253, 0.45)', // 45% tint for active word
      errorBg: '#FDE8E8', // Soft blush error wash
      errorText: '#C53030', // Editorial red
      successBg: '#E6F4EA', // Mint green success wash
      successText: '#137333', // Deep green text
    },
  },
  dark: {
    name: 'מצב כהה (Midnight Print 🌙)',
    mode: 'dark',
    fonts: FONTS,
    radii: { xs: 4, sm: 6, md: 10, lg: 16, xl: 24, full: 9999 },
    colors: {
      bgPrimary: '#121214', // Deep midnight canvas
      bgSecondary: '#1A1A1E', // Secondary dark surface
      bgCard: '#1E1E22', // Dark card container
      bgHighlight: '#6B5910', // Dark yellow highlight
      textPrimary: '#F5F5F7', // Crisp light print text
      textSecondary: '#A1A1A6', // Muted secondary text
      textMuted: '#6E6E73', // Muted text
      border: '#2E2E34', // Subtle dark border
      borderStrong: '#6E6E73', // Stronger dark border
      accent: '#F9DF6E', // Warm NYT yellow text accent
      accentGold: '#F59E0B', // Bright amber streak
      selectionBg: '#1E3A5F', // Dark blue selection
      selectionText: '#90CAF9', // Light blue text
      activeWordBg: 'rgba(30, 58, 95, 0.5)', // Dark active word tint
      errorBg: '#3B1919', // Dark red error
      errorText: '#EF4444', // Bright red
      successBg: '#132E1B', // Dark green success
      successText: '#34D399', // Bright green
    },
  },
  classic: {
    name: 'קלאסי (Classic ✨)',
    mode: 'classic',
    fonts: FONTS,
    radii: { xs: 4, sm: 6, md: 10, lg: 16, xl: 24, full: 9999 },
    colors: {
      bgPrimary: '#0B1120',
      bgSecondary: '#1E293B',
      bgCard: '#0F172A',
      bgHighlight: '#0284C7',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      border: '#334155',
      borderStrong: '#64748B',
      accent: '#38BDF8',
      accentGold: '#F59E0B',
      selectionBg: '#0369A1',
      selectionText: '#FFFFFF',
      activeWordBg: 'rgba(3, 105, 161, 0.4)',
      errorBg: '#391418',
      errorText: '#FCA5A5',
      successBg: '#064E3B',
      successText: '#6EE7B7',
    },
  },
};
