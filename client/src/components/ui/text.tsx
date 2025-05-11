import React from "react";
import { cn } from "@/lib/utils";
import { textVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Text component for consistently styled paragraphs and text blocks
 * Controls font size, weight, alignment, and colors
 */
export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

export function Text({
  className,
  size,
  weight,
  align,
  color,
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ size, weight, align, color }), className)}
      {...props}
    />
  );
}

export default Text;