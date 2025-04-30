import React from 'react';
import SliderWithLabels from '@/components/ui/slider-with-labels';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Circle } from 'lucide-react';

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
  // Calculate completion percentage for each category - only consider the first 5 visible sliders
  const getCategoryCompletion = (category: SliderCategory) => {
    // Only consider the first 5 sliders for completion calculation
    const visibleSliders = category.sliders.slice(0, 5);
    const totalSliders = visibleSliders.length;
    const completedSliders = visibleSliders.filter(slider => 
      slider.id in values
    ).length;
    
    return {
      completed: completedSliders,
      total: totalSliders,
      percentage: Math.round((completedSliders / totalSliders) * 100)
    };
  };

  return (
    <div>
      <Accordion type="multiple" className="space-y-4">
        {categories.map((category) => {
          const completion = getCategoryCompletion(category);
          const isComplete = completion.completed === completion.total;
          
          return (
            <AccordionItem 
              key={category.id} 
              value={category.id} 
              className={`border ${isComplete ? 'border-green-200' : 'border-gray-200'} rounded-md`}
            >
              <AccordionTrigger className="px-4 hover:no-underline group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <span className="text-lg font-medium text-gray-900">{category.title}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:block text-sm text-gray-500">
                      {completion.completed} of {completion.total} complete
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${completion.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-6 py-2">
                  {/* Only show the first 5 sliders in each category */}
                  {category.sliders.slice(0, 5).map((slider) => (
                    <SliderWithLabels
                      key={slider.id}
                      leftLabel={slider.left}
                      rightLabel={slider.right}
                      value={values[slider.id] ?? 50}
                      onChange={(value) => onChange(slider.id, value)}
                      name={slider.id}
                      hasValue={slider.id in values}
                      tooltipContent={`${slider.left} vs ${slider.right}: Adjust the slider to indicate your preference`}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}