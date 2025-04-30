import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

// Add custom props for thumb and track styling
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  thumbClassName?: string;
  trackClassName?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, thumbClassName, trackClassName, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className={cn("absolute h-full bg-primary", trackClassName)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-5 w-5 rounded-full border-2 border-white bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        thumbClassName
      )} 
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
