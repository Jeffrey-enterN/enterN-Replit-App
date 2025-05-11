import React from "react";
import { cn } from "@/lib/utils";
import { flexVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Flex component for creating consistent flexbox layouts
 * Controls direction, alignment, justification, wrapping, and spacing
 */
export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

export function Flex({
  className,
  direction,
  align,
  justify,
  wrap,
  gap,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        flexVariants({ direction, align, justify, wrap, gap }),
        className
      )}
      {...props}
    />
  );
}

export default Flex;