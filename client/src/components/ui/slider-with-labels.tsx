import React from 'react';
import { Slider } from "@/components/ui/slider";

interface SliderWithLabelsProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  name?: string;
}

export function SliderWithLabels({
  leftLabel,
  rightLabel,
  value,
  onChange,
  name
}: SliderWithLabelsProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="slider-with-labels">
      <div className="slider-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <Slider
        name={name}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={handleValueChange}
        className="h-2 bg-gray-200 rounded-lg"
      />
    </div>
  );
}

export default SliderWithLabels;
