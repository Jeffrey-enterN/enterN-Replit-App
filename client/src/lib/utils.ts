/**
 * Design System Utilities
 * 
 * This file contains utility functions that help implement the design system
 * consistently across the application.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to combine Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Design System Spacing Constants
 * 
 * Use these to ensure consistent spacing between elements
 */
export const spacing = {
  xs: 'space-y-1 space-x-1',
  sm: 'space-y-2 space-x-2',
  md: 'space-y-4 space-x-4',
  lg: 'space-y-6 space-x-6',
  xl: 'space-y-8 space-x-8',
  '2xl': 'space-y-12 space-x-12',
}

/**
 * Common card styles
 */
export const cardStyles = {
  default: 'bg-card text-card-foreground rounded-lg border shadow-sm',
  interactive: 'bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow-md transition-all duration-200',
  elevated: 'bg-card text-card-foreground rounded-lg border shadow-md',
  highlight: 'bg-card text-card-foreground rounded-lg border-2 border-primary shadow-brand-sm',
}

/**
 * Animation classes for common patterns
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  pulse: 'animate-pulse',
}

/**
 * Format a date with consistent styling
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  try {
    // If date is null or undefined, return a fallback value
    if (!date) return 'N/A';
    
    // Convert string or number to Date object if needed
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'N/A';
  }
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | number | null | undefined): string {
  try {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (err) {
    return '';
  }
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Common status badge variants
 */
export const statusVariants = {
  active: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  inactive: 'bg-muted text-muted-foreground',
  error: 'bg-destructive text-destructive-foreground',
  success: 'bg-success text-success-foreground',
}

/**
 * Layout utilities
 */
export const layouts = {
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexColumn: 'flex flex-col',
  flexColumnCenter: 'flex flex-col items-center justify-center',
  grid2Cols: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  grid3Cols: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  grid4Cols: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
}
