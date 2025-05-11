import React from "react";
import { cn } from "@/lib/utils";
import { cardVariants } from "@/components/ui/variants";
import { type VariantProps } from "class-variance-authority";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Extended Card component that builds on the existing Card component
 * but adds support for variant styles through the cardVariants function
 */
export interface CardExtendedProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof cardVariants> {}

export function CardExtended({
  className,
  variant,
  padding,
  ...props
}: CardExtendedProps) {
  return (
    <Card
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

/**
 * Re-export the original Card subcomponents for use with CardExtended
 */
export {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};