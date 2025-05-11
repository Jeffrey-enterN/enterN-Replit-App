import React from "react";
import { cn } from "@/lib/utils";
import { sectionVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";

/**
 * Section component for consistently styled page sections
 * Controls padding, background color, and other styling
 */
export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export function Section({
  className,
  padding,
  background,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ padding, background }), className)}
      {...props}
    />
  );
}

export default Section;