import React, { useState } from 'react';
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
}

export function SliderWithLabels({
  leftLabel,
  rightLabel,
  value,
  onChange,
  name,
  hasValue = false,
  tooltipContent
}: SliderWithLabelsProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="slider-with-labels space-y-4 mb-6">
      <div className="flex justify-between items-start">
        <div className="w-5/12 text-left text-sm text-gray-600">
          {leftLabel}
        </div>
        
        <div className="flex items-center px-2">
          {hasValue && (
            <CheckCircle className="h-4 w-4 text-green-500 mx-1 flex-shrink-0" />
          )}
          
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="w-5/12 text-right text-sm text-gray-600">
          {rightLabel}
        </div>
      </div>
      
      <Slider
        name={name}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={handleValueChange}
        className={`h-2.5 ${hasValue ? 'bg-gray-100' : 'bg-gray-200'} rounded-lg`}
      />
    </div>
  );
}

export default SliderWithLabels;
