/**
 * enterN Design System - Theme Configuration
 * 
 * This file centralizes all design tokens and theme variables used throughout the application.
 * Use this as the single source of truth for brand colors, spacing, typography, etc.
 * 
 * Usage:
 * import { colors, spacing, typography, etc. } from '@/theme'
 * 
 * @typedef {Object} Colors
 * @typedef {Object} Typography
 * @typedef {Object} Spacing
 * @typedef {Object} Theme
 */

// Brand Colors - Main palette 
export const colors = {
  // Primary brand colors
  teal: '#0097B1',
  pink: '#FF66C4',
  cyan: '#5CE1E6',
  lime: '#C8FD04',
  
  // Monochrome
  black: '#000000',
  darkGray: '#767979',
  gray: '#B6B6B6',
  lightGray: '#F1F1F1',
  white: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gradients
  primaryGradient: 'linear-gradient(135deg, #FF66C4, #5CE1E6)',
  secondaryGradient: 'linear-gradient(135deg, #5CE1E6, #C8FD04)',
}

// Typography scale
export const typography = {
  fontFamily: {
    sans: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
}

// Spacing system
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  md: '0.25rem',     // 4px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
}

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
}

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
}

// Transitions
export const transitions = {
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
}

// Layout breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Component-specific design tokens
export const components = {
  button: {
    borderRadius: borderRadius.lg,
    fontWeight: typography.fontWeight.medium,
    
    // Size variants
    sizes: {
      sm: {
        fontSize: typography.fontSize.sm,
        height: '2rem',
        paddingX: spacing[3],
      },
      md: {
        fontSize: typography.fontSize.base,
        height: '2.5rem',
        paddingX: spacing[4],
      },
      lg: {
        fontSize: typography.fontSize.lg,
        height: '3rem',
        paddingX: spacing[6],
      },
    },
    
    // Style variants
    variants: {
      primary: {
        background: colors.teal,
        color: colors.white,
        hoverBackground: '#007D94', // Darker teal
      },
      secondary: {
        background: colors.pink,
        color: colors.white,
        hoverBackground: '#E634A3', // Darker pink
      },
      accent: {
        background: colors.cyan,
        color: colors.black,
        hoverBackground: '#33C8CD', // Darker cyan
      },
      gradient: {
        background: colors.primaryGradient,
        color: colors.white,
      },
      outline: {
        border: `2px solid ${colors.teal}`,
        color: colors.teal,
      },
      ghost: {
        color: colors.black,
        hoverBackground: colors.lightGray,
      },
    },
  },
  
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    shadow: shadows.md,
  },
  
  input: {
    borderRadius: borderRadius.md,
    height: '2.5rem',
    padding: spacing[3],
    fontSize: typography.fontSize.base,
  },
}

// Export theme as default
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  components,
}

export default theme;