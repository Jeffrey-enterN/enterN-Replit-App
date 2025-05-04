import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Define heading variants with consistent styling options
const headingVariants = cva(
  "font-heading text-foreground scroll-m-20",
  {
    variants: {
      level: {
        h1: "text-4xl font-bold tracking-tight lg:text-5xl",
        h2: "text-3xl font-semibold tracking-tight",
        h3: "text-2xl font-semibold tracking-tight",
        h4: "text-xl font-semibold tracking-tight",
        h5: "text-lg font-semibold tracking-tight",
        h6: "text-base font-semibold tracking-tight",
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
      transform: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
        normal: "normal-case",
      },
      gradient: {
        primary: "text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan",
        secondary: "text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-lime",
        none: "",
      }
    },
    defaultVariants: {
      level: "h2",
      weight: undefined, // use the default from the level
      align: "left",
      transform: "normal",
      gradient: "none",
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  /**
   * The heading content
   */
  children: React.ReactNode;
}

/**
 * Heading component for consistent typography
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, level = "h2", weight, align, transform, gradient, className, ...props }, ref) => {
    // Get the correct heading variant classes
    const headingClasses = cn(
      headingVariants({ level, weight, align, transform, gradient }),
      className
    );
    
    // Render the appropriate heading element based on level
    switch (level) {
      case "h1":
        return <h1 ref={ref} className={headingClasses} {...props}>{children}</h1>;
      case "h2":
        return <h2 ref={ref} className={headingClasses} {...props}>{children}</h2>;
      case "h3":
        return <h3 ref={ref} className={headingClasses} {...props}>{children}</h3>;
      case "h4":
        return <h4 ref={ref} className={headingClasses} {...props}>{children}</h4>;
      case "h5":
        return <h5 ref={ref} className={headingClasses} {...props}>{children}</h5>;
      case "h6":
        return <h6 ref={ref} className={headingClasses} {...props}>{children}</h6>;
      default:
        return <h2 ref={ref} className={headingClasses} {...props}>{children}</h2>;
    }
  }
);

Heading.displayName = "Heading";

export default Heading;