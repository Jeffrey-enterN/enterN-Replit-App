import React from 'react';
import SliderWithLabels from '@/components/ui/slider-with-labels';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SliderData {
  id: string;
  left: string;
  right: string;
}

interface SliderCategory {
  id: string;
  title: string;
  sliders: SliderData[];
}

interface CollapsibleSliderSectionProps {
  categories: SliderCategory[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

export default function CollapsibleSliderSection({
  categories,
  values,
  onChange
}: CollapsibleSliderSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Organizational Fit</h2>
      <p className="text-sm text-gray-600 mb-6">
        These sliders help employers understand your preferences and work style, leading to better matches.
      </p>
      
      <Accordion type="multiple" className="space-y-4">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border border-gray-200 rounded-md">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="text-lg font-medium text-gray-900">{category.title}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-6 py-2">
                {category.sliders.map((slider) => (
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}