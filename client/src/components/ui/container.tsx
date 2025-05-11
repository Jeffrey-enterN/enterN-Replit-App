import React from "react";
import { cn } from "@/lib/utils";
import { containerVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Container component that centers content horizontally with controlled max-width
 * Easily create responsive layouts that maintain consistent spacing
 */
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({
  className,
  size,
  padding,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  );
}

export default Container;