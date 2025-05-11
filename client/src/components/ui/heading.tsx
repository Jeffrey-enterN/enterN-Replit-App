import React from "react";
import { cn } from "@/lib/utils";
import { headingVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Heading component for consistent typography across the application
 * Supports different levels (h1-h6), text alignment, and color variants
 */
export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({
  className,
  level,
  align,
  color,
  as,
  ...props
}: HeadingProps) {
  const Comp = as || (level as any) || "h2";

  return (
    <Comp
      className={cn(headingVariants({ level, align, color }), className)}
      {...props}
    />
  );
}

export default Heading;