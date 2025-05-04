/**
 * Type definitions for the theme.js file
 */

declare module '@/theme' {
  export interface Colors {
    teal: string;
    pink: string;
    cyan: string;
    lime: string;
    black: string;
    darkGray: string;
    gray: string;
    lightGray: string;
    white: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    primaryGradient: string;
    secondaryGradient: string;
  }

  export interface FontWeight {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  }

  export interface FontSize {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  }

  export interface LineHeight {
    none: string;
    tight: string;
    normal: string;
    relaxed: string;
  }

  export interface FontFamily {
    sans: string;
    heading: string;
  }

  export interface Typography {
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontSize: FontSize;
    lineHeight: LineHeight;
  }

  export interface Spacing {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    [key: string]: string;
  }

  export interface BorderRadius {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  }

  export interface Shadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  }

  export interface ZIndex {
    hide: number;
    auto: string;
    base: number;
    docked: number;
    dropdown: number;
    sticky: number;
    banner: number;
    overlay: number;
    modal: number;
    popover: number;
    skipLink: number;
    toast: number;
    tooltip: number;
  }

  export interface TransitionEasing {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
  }

  export interface TransitionDuration {
    fast: string;
    normal: string;
    slow: string;
  }

  export interface Transitions {
    easing: TransitionEasing;
    duration: TransitionDuration;
  }

  export interface Breakpoints {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  }

  export interface ButtonSizeVariant {
    fontSize: string;
    height: string;
    paddingX: string;
  }

  export interface ButtonStyleVariant {
    background: string;
    color: string;
    hoverBackground?: string;
    border?: string;
  }

  export interface ComponentsConfig {
    button: {
      borderRadius: string;
      fontWeight: number;
      sizes: {
        sm: ButtonSizeVariant;
        md: ButtonSizeVariant;
        lg: ButtonSizeVariant;
      };
      variants: {
        primary: ButtonStyleVariant;
        secondary: ButtonStyleVariant;
        accent: ButtonStyleVariant;
        gradient: ButtonStyleVariant;
        outline: ButtonStyleVariant;
        ghost: ButtonStyleVariant;
      };
    };
    card: {
      borderRadius: string;
      padding: string;
      shadow: string;
    };
    input: {
      borderRadius: string;
      height: string;
      padding: string;
      fontSize: string;
    };
  }

  export interface Theme {
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    shadows: Shadows;
    zIndex: ZIndex;
    transitions: Transitions;
    breakpoints: Breakpoints;
    components: ComponentsConfig;
  }

  export const colors: Colors;
  export const typography: Typography;
  export const spacing: Spacing;
  export const borderRadius: BorderRadius;
  export const shadows: Shadows;
  export const zIndex: ZIndex;
  export const transitions: Transitions;
  export const breakpoints: Breakpoints;
  export const components: ComponentsConfig;

  const theme: Theme;
  export default theme;
}