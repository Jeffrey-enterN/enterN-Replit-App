import React from 'react';
import { Slider } from "@/components/ui/slider";
import { CheckCircle } from 'lucide-react';

interface SliderWithLabelsProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  name?: string;
  hasValue?: boolean;
}

export function SliderWithLabels({
  leftLabel,
  rightLabel,
  value,
  onChange,
  name,
  hasValue = false
}: SliderWithLabelsProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="slider-with-labels space-y-2">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{leftLabel}</span>
        {hasValue && (
          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
        )}
        <span>{rightLabel}</span>
      </div>
      <Slider
        name={name}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={handleValueChange}
        className={`h-2 ${hasValue ? 'bg-gray-100' : 'bg-gray-200'} rounded-lg`}
      />
    </div>
  );
}

export default SliderWithLabels;
