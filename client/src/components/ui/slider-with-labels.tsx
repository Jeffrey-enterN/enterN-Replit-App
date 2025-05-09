import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { CheckCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SliderWithLabelsProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  name?: string;
  hasValue?: boolean;
  tooltipContent?: string;
  accentColor?: string;
  isAdjusted?: boolean; // Whether the user has moved this slider from the default 50
}

export function SliderWithLabels({
  leftLabel,
  rightLabel,
  value,
  onChange,
  name,
  hasValue = false,
  tooltipContent,
  accentColor = 'text-primary',
  isAdjusted = false
}: SliderWithLabelsProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 640);
    
    // Add window resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="slider-with-labels space-y-2 mb-2 pb-0">
      {/* Mobile: Stacked labels (top/bottom) | Desktop: Side-by-side labels (left/right) */}
      
      {/* LEFT LABEL - Only visible on desktop */}
      <div className="hidden sm:flex justify-between items-start relative px-0">
        <div className="w-[45%] text-left text-sm font-medium text-foreground leading-tight transition-colors duration-300">
          {leftLabel}
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center">
          {isAdjusted && (
            <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded-full flex-shrink-0 border border-green-100 dark:border-green-800">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
            </div>
          )}
          
          {tooltipContent && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    className="inline-flex items-center justify-center ml-1 focus:outline-none"
                    aria-label="Help"
                  >
                    <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="max-w-sm bg-popover text-popover-foreground p-3 shadow-lg border border-border text-sm rounded-md"
                >
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="w-[45%] text-right text-sm font-medium text-foreground leading-tight transition-colors duration-300">
          {rightLabel}
        </div>
      </div>
      
      {/* Mobile-only stacked view: Top label */}
      <div className="sm:hidden flex items-center justify-between mb-1">
        <div className="text-left text-xs font-medium text-foreground leading-tight pr-1">
          {leftLabel}
        </div>
        
        {tooltipContent && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="inline-flex items-center justify-center focus:outline-none flex-shrink-0"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                align="center" 
                className="max-w-[90vw] bg-popover text-popover-foreground p-2 shadow-lg border border-border text-xs rounded-md"
              >
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="px-0">
        <Slider
          name={name}
          min={0}
          max={100}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          className={`h-2.5 sm:h-3 ${isAdjusted ? 'bg-muted/70' : 'bg-muted'} rounded-lg shadow-inner`}
          thumbClassName={`h-6 w-6 sm:h-7 sm:w-7 border-2 border-background ${isAdjusted 
            ? accentColor.replace('text-', 'bg-') 
            : 'bg-muted-foreground'} shadow-md hover:scale-110 transition-transform`}
          trackClassName={isAdjusted 
            ? `bg-gradient-to-r from-primary to-[#5CE1E6]` 
            : 'bg-muted-foreground/30'}
        />
      </div>
      
      {/* Mobile-only stacked view: Bottom label */}
      <div className="sm:hidden text-right text-xs font-medium text-foreground leading-tight mt-1">
        {rightLabel}
      </div>
      
      {/* Value indicator - Shows "Adjusted" instead of numeric value for more intuitive experience */}
      <div className="text-center text-xs font-medium -mt-1 h-4">
        {isAdjusted ? (
          <span className="text-primary font-bold flex items-center justify-center gap-0.5">
            <CheckCircle className="h-3 w-3 sm:block hidden" /> 
            <span className="sm:inline hidden">Adjusted</span>
            <span className="sm:hidden inline">✓</span>
          </span>
        ) : (
          <span className="text-muted-foreground animate-pulse hover:text-primary transition-colors duration-300 text-[10px] sm:text-xs">
            {isMobile ? 'Tap to adjust' : 'Adjust me'}
          </span>
        )}
      </div>
    </div>
  );
}

export default SliderWithLabels;
