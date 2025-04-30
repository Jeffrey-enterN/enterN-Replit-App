import React from 'react';
import SliderWithLabels from '@/components/ui/slider-with-labels';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Circle } from 'lucide-react';

// Accessible color palette for category sections
const CATEGORY_COLORS = [
  {
    border: 'border-blue-200',
    background: 'bg-blue-50',
    progressBackground: 'bg-blue-500',
    iconColor: 'text-blue-500'
  },
  {
    border: 'border-purple-200',
    background: 'bg-purple-50',
    progressBackground: 'bg-purple-500',
    iconColor: 'text-purple-500'
  },
  {
    border: 'border-teal-200',
    background: 'bg-teal-50',
    progressBackground: 'bg-teal-500',
    iconColor: 'text-teal-500'
  },
  {
    border: 'border-amber-200',
    background: 'bg-amber-50',
    progressBackground: 'bg-amber-600',
    iconColor: 'text-amber-600'
  },
  {
    border: 'border-rose-200',
    background: 'bg-rose-50',
    progressBackground: 'bg-rose-500',
    iconColor: 'text-rose-500'
  },
  {
    border: 'border-emerald-200',
    background: 'bg-emerald-50',
    progressBackground: 'bg-emerald-500',
    iconColor: 'text-emerald-500'
  },
  {
    border: 'border-indigo-200',
    background: 'bg-indigo-50',
    progressBackground: 'bg-indigo-500',
    iconColor: 'text-indigo-500'
  },
  {
    border: 'border-orange-200',
    background: 'bg-orange-50',
    progressBackground: 'bg-orange-500',
    iconColor: 'text-orange-500'
  },
  {
    border: 'border-cyan-200',
    background: 'bg-cyan-50',
    progressBackground: 'bg-cyan-500',
    iconColor: 'text-cyan-500'
  }
];

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

  // Generic tooltip descriptions for different preference types
  const getTooltipText = (slider: SliderData) => {
    return `This slider lets you indicate where you fall on the spectrum between "${slider.left}" and "${slider.right}". Move the slider to reflect your preference.`;
  };

  return (
    <div>
      <Accordion type="multiple" className="space-y-4">
        {categories.map((category, index) => {
          const completion = getCategoryCompletion(category);
          const isComplete = completion.completed === completion.total;
          const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          
          return (
            <AccordionItem 
              key={category.id} 
              value={category.id} 
              className={`border ${isComplete ? 'border-green-300' : colorScheme.border} rounded-md ${colorScheme.background} transition-all duration-200`}
            >
              <AccordionTrigger className="px-4 hover:no-underline group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 flex-shrink-0 min-w-[30%]">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className={`h-5 w-5 ${colorScheme.iconColor} flex-shrink-0`} />
                    )}
                    <span className="text-lg font-medium text-gray-900 truncate">{category.title}</span>
                  </div>
                  <div className="flex items-center space-x-4 ml-auto">
                    <div className="hidden md:block text-sm text-gray-600">
                      {completion.completed} of {completion.total} complete
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5 flex-shrink-0">
                      <div 
                        className={`h-2.5 rounded-full ${isComplete ? 'bg-green-500' : colorScheme.progressBackground}`}
                        style={{ width: `${completion.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-6 py-4">
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
                      tooltipContent={getTooltipText(slider)}
                      accentColor={colorScheme.progressBackground.replace('bg-', 'text-')}
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