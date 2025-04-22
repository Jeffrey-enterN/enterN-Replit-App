import React from 'react';
import SliderWithLabels from '@/components/ui/slider-with-labels';

interface SliderData {
  id: string;
  left: string;
  right: string;
}

interface SliderSectionProps {
  title: string;
  sliders: SliderData[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

export default function SliderSection({
  title,
  sliders,
  values,
  onChange
}: SliderSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      {sliders.map((slider) => (
        <SliderWithLabels
          key={slider.id}
          leftLabel={slider.left}
          rightLabel={slider.right}
          value={values[slider.id] ?? 50}
          onChange={(value) => onChange(slider.id, value)}
          name={slider.id}
        />
      ))}
    </div>
  );
}
