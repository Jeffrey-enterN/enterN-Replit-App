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
    <div className="slider-with-labels space-y-5 mb-8 pb-2">
      <div className="flex justify-between items-start relative">
        <div className="w-[47%] text-left text-sm text-gray-600 leading-tight">
          {leftLabel}
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center">
          {isAdjusted && (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
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
                    <HelpCircle className={`h-5 w-5 ${accentColor} hover:opacity-80 transition-opacity`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="max-w-sm bg-white text-gray-800 p-3 shadow-lg border-gray-200 text-sm"
                >
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="w-[47%] text-right text-sm text-gray-600 leading-tight">
          {rightLabel}
        </div>
      </div>
      
      <div className="px-1">
        <Slider
          name={name}
          min={0}
          max={100}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          className={`h-3 ${isAdjusted ? 'bg-gray-100' : 'bg-gray-200'} rounded-lg`}
          thumbClassName={`h-6 w-6 border-2 border-white ${isAdjusted ? accentColor.replace('text-', 'bg-') : 'bg-gray-400'}`}
          trackClassName={isAdjusted ? accentColor.replace('text-', 'bg-') : 'bg-gray-300'}
        />
      </div>
      
      {/* Value indicator */}
      <div className="text-center text-xs font-medium -mt-1">
        <span className={`${isAdjusted ? 'text-primary font-bold' : 'text-gray-400'}`}>
          {isAdjusted ? value : 'Adjust me'}
        </span>
      </div>
    </div>
  );
}

export default SliderWithLabels;
