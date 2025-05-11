/**
 * Design Tokens
 * 
 * This file centralizes all design tokens used throughout the application.
 * Changes to these tokens will propagate across the entire UI.
 */

/**
 * Brand Colors
 */
export const brandColors = {
  teal: 'var(--brand-teal)',
  pink: 'var(--brand-pink)',
  cyan: 'var(--brand-cyan)',
  lime: 'var(--brand-lime)',
  black: 'var(--brand-black)',
  darkGray: 'var(--brand-darkgray)',
  gray: 'var(--brand-gray)',
  lightGray: 'var(--brand-lightgray)',
  white: 'var(--brand-white)',
}

/**
 * Semantic Colors
 */
export const semanticColors = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
  muted: 'var(--muted)',
}

/**
 * Typography Scales
 */
export const typography = {
  fontFamily: {
    sans: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
}

/**
 * Spacing Scale
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
}

/**
 * Border Radius
 */
export const borderRadius = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  DEFAULT: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  full: '9999px',
}

/**
 * Shadows
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  'brand-sm': '0 2px 8px 0 rgba(0, 151, 177, 0.15)',
  'brand-md': '0 4px 12px 0 rgba(0, 151, 177, 0.25)',
  'brand-lg': '0 8px 20px 0 rgba(0, 151, 177, 0.3)',
  'accent-sm': '0 2px 8px 0 rgba(255, 102, 196, 0.15)',
  'accent-md': '0 4px 12px 0 rgba(255, 102, 196, 0.25)',
  'accent-lg': '0 8px 20px 0 rgba(255, 102, 196, 0.3)',
  none: 'none',
}

/**
 * Z-Index Scale
 */
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
}

/**
 * Common Animation Timing
 */
export const animation = {
  duration: {
    fast: '150ms',
    default: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
}

/**
 * Breakpoints
 */
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

/**
 * Common Layout Patterns
 */
export const layoutPatterns = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 md:py-16 lg:py-20',
  card: 'bg-card text-card-foreground rounded-lg border shadow-sm p-6',
  sectionHeader: 'text-3xl font-bold tracking-tight mb-8',
}

/**
 * Gradient Presets
 */
export const gradients = {
  primary: 'bg-gradient-to-r from-brand-pink to-brand-cyan',
  secondary: 'bg-gradient-to-r from-brand-cyan to-brand-lime',
  dark: 'bg-gradient-to-r from-gray-800 to-gray-900',
}