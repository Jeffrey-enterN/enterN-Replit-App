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
}

export function SliderWithLabels({
  leftLabel,
  rightLabel,
  value,
  onChange,
  name,
  hasValue = false,
  tooltipContent,
  accentColor = 'text-primary'
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
          {hasValue && (
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
          className={`h-3 ${hasValue ? 'bg-gray-100' : 'bg-gray-200'} rounded-lg`}
          thumbClassName={`h-6 w-6 border-2 border-white ${accentColor.replace('text-', 'bg-')}`}
          trackClassName={accentColor.replace('text-', 'bg-')}
        />
      </div>
      
      {/* Value indicator */}
      <div className="text-center text-xs font-medium -mt-1">
        {value < 30 && (
          <span className="text-gray-700">Leans Left</span>
        )}
        {value >= 30 && value <= 70 && (
          <span className="text-gray-700">Balanced</span>
        )}
        {value > 70 && (
          <span className="text-gray-700">Leans Right</span>
        )}
      </div>
    </div>
  );
}

export default SliderWithLabels;
