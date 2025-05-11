import React from "react";
import { cn } from "@/lib/utils";
import { gridVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Grid component for creating consistent grid layouts
 * Controls number of columns and gap spacing at different breakpoints
 */
export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function Grid({
  className,
  cols,
  gap,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  );
}

export default Grid;