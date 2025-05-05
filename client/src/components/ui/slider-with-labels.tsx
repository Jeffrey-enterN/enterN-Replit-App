import React from 'react';
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
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="slider-with-labels space-y-2 mb-2 pb-0">
      {/* Compact mobile-first label display */}
      <div className="flex justify-between items-start relative px-0">
        <div className="w-[45%] text-left text-xs sm:text-sm font-medium text-gray-700 leading-tight transition-colors duration-300">
          {leftLabel}
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center">
          {isAdjusted && (
            <div className="bg-green-50 p-1 rounded-full flex-shrink-0 border border-green-100">
              <CheckCircle className="h-3 w-3 text-green-500" />
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
                    <HelpCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${accentColor} hover:opacity-80 transition-opacity`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="max-w-[90vw] sm:max-w-sm bg-white text-gray-800 p-3 shadow-lg border border-gray-100 text-sm rounded-md"
                >
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="w-[45%] text-right text-xs sm:text-sm font-medium text-gray-700 leading-tight transition-colors duration-300">
          {rightLabel}
        </div>
      </div>
      
      <div className="px-0">
        <Slider
          name={name}
          min={0}
          max={100}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          className={`h-2.5 sm:h-3 ${isAdjusted ? 'bg-gray-100' : 'bg-gray-200'} rounded-lg shadow-inner`}
          thumbClassName={`h-6 w-6 sm:h-7 sm:w-7 border-2 border-white ${isAdjusted 
            ? accentColor.replace('text-', 'bg-') 
            : 'bg-gray-400'} shadow-md hover:scale-110 transition-transform`}
          trackClassName={isAdjusted 
            ? `bg-gradient-to-r from-primary to-[#5CE1E6]` 
            : 'bg-gray-300'}
        />
      </div>
      
      {/* Value indicator - Shows "Adjusted" instead of numeric value for more intuitive experience */}
      <div className="text-center text-xs font-medium -mt-1 h-4">
        {isAdjusted ? (
          <span className="text-primary font-bold flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" /> Adjusted
          </span>
        ) : (
          <span className="text-gray-400 animate-pulse hover:text-primary transition-colors duration-300">
            Adjust me
          </span>
        )}
      </div>
    </div>
  );
}

export default SliderWithLabels;
