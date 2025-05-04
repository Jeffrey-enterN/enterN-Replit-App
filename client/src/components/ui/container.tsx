import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import theme from '@/theme';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The content to be rendered within the container
   */
  children: React.ReactNode;
  
  /**
   * Maximum width of the container
   * @default "max-w-7xl"
   */
  maxWidth?: string;
  
  /**
   * Whether to add default padding
   * @default true
   */
  padded?: boolean;
  
  /**
   * Whether the container should be centered
   * @default true
   */
  centered?: boolean;
  
  /**
   * Extra classes to apply
   */
  className?: string;
}

/**
 * Container component for consistent layout and spacing
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, maxWidth = "max-w-7xl", padded = true, centered = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          maxWidth,
          padded && "px-4 sm:px-6 lg:px-8",
          centered && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default Container;