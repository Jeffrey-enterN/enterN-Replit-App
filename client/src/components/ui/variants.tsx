/**
 * UI Component Variants
 * 
 * This file contains pre-defined variants for common UI components to ensure
 * consistent styling across the application.
 */

import { cva } from 'class-variance-authority';

/**
 * Container variants
 */
export const containerVariants = cva(
  "w-full mx-auto px-4",
  {
    variants: {
      size: {
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
        default: "max-w-7xl",
      },
      padding: {
        none: "px-0",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
        xl: "px-12",
        default: "px-4 sm:px-6 lg:px-8",
      },
    },
    defaultVariants: {
      size: "default",
      padding: "default",
    },
  }
);

/**
 * Section variants
 */
export const sectionVariants = cva(
  "w-full",
  {
    variants: {
      padding: {
        none: "",
        sm: "py-4",
        md: "py-8",
        lg: "py-12",
        xl: "py-16",
        "2xl": "py-24",
        default: "py-8 md:py-12 lg:py-16",
      },
      background: {
        default: "bg-background",
        muted: "bg-muted",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        card: "bg-card text-card-foreground",
        gradient: "bg-gradient-to-r from-brand-pink to-brand-cyan text-white",
      },
    },
    defaultVariants: {
      padding: "default",
      background: "default",
    },
  }
);

/**
 * Card variants
 */
export const cardVariants = cva(
  "rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border shadow-sm",
        muted: "bg-muted text-muted-foreground border border-muted",
        interactive: "bg-card text-card-foreground border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer",
        elevated: "bg-card text-card-foreground border shadow-md",
        highlight: "bg-card text-card-foreground border-2 border-primary shadow-brand-sm",
        accent: "bg-accent/10 text-foreground border border-accent/20",
        gradient: "bg-gradient-to-r from-brand-pink to-brand-cyan text-white",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-5",
        lg: "p-7",
        default: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

/**
 * Text heading variants
 */
export const headingVariants = cva(
  "font-heading font-bold leading-tight tracking-tight text-foreground",
  {
    variants: {
      level: {
        h1: "text-3xl sm:text-4xl md:text-5xl",
        h2: "text-2xl sm:text-3xl md:text-4xl",
        h3: "text-xl sm:text-2xl md:text-3xl",
        h4: "text-lg sm:text-xl md:text-2xl",
        h5: "text-base sm:text-lg md:text-xl",
        h6: "text-sm sm:text-base md:text-lg",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      color: {
        default: "text-foreground",
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted-foreground",
        gradient: "text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan",
      },
    },
    defaultVariants: {
      level: "h2",
      align: "left",
      color: "default",
    },
  }
);

/**
 * Text paragraph variants
 */
export const textVariants = cva(
  "text-foreground",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      color: {
        default: "text-foreground",
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted-foreground",
        success: "text-success",
        warning: "text-warning",
        error: "text-destructive",
      },
    },
    defaultVariants: {
      size: "base",
      weight: "normal",
      align: "left",
      color: "default",
    },
  }
);

/**
 * Badge variants (extending existing badge)
 */
export const badgeExtendedVariants = cva(
  "inline-flex items-center rounded-full",
  {
    variants: {
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        outline: "border border-border bg-transparent text-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        error: "bg-destructive text-destructive-foreground",
        info: "bg-info text-info-foreground",
        muted: "bg-muted text-muted-foreground",
        gradient: "bg-gradient-to-r from-brand-pink to-brand-cyan text-white",
      },
      status: {
        active: "bg-success text-success-foreground",
        pending: "bg-warning text-warning-foreground",
        inactive: "bg-muted text-muted-foreground",
        error: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

/**
 * Grid layout variants
 */
export const gridVariants = cva(
  "grid w-full gap-4",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        auto: "grid-cols-1 auto-cols-fr auto-rows-fr",
        responsive: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      cols: "responsive",
      gap: "md",
    },
  }
);

/**
 * Flex layout variants
 */
export const flexVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        col: "flex-col",
        rowReverse: "flex-row-reverse",
        colReverse: "flex-col-reverse",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      wrap: {
        wrap: "flex-wrap",
        nowrap: "flex-nowrap",
        reverse: "flex-wrap-reverse",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      direction: "row",
      align: "start",
      justify: "start",
      wrap: "nowrap",
      gap: "none",
    },
  }
);