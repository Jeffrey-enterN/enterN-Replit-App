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
  name: string;
  leftLabel: string;
  rightLabel: string;
}

interface SliderCategory {
  id: string;
  name: string;
  description: string;
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
  // Calculate completion percentage for each category
  // Track whether a slider has been adjusted by the user (not just set to default 50)
  const isSliderAdjusted = (sliderId: string): boolean => {
    // If the slider doesn't exist in values object, it hasn't been adjusted
    if (!(sliderId in values)) return false;
    
    // Consider the slider adjusted only if it's not at the default value of 50
    return values[sliderId] !== 50;
  };
  
  const getCategoryCompletion = (category: SliderCategory) => {
    // Consider all sliders for completion calculation
    const totalSliders = category.sliders.length;
    const completedSliders = category.sliders.filter(slider => 
      isSliderAdjusted(slider.id)
    ).length;
    
    return {
      completed: completedSliders,
      total: totalSliders,
      percentage: Math.round((completedSliders / totalSliders) * 100)
    };
  };
  
  // Initialize default values for missing sliders to prevent issues
  React.useEffect(() => {
    let newValues: Record<string, number> = {};
    let hasNewValues = false;
    
    // For all sliders in all categories
    categories.forEach(category => {
      category.sliders.forEach(slider => {
        // If this slider has no value yet, collect it to set later
        if (!(slider.id in values)) {
          newValues[slider.id] = 50;
          hasNewValues = true;
        }
      });
    });
    
    // Only update if we have new values to prevent infinite loop
    if (hasNewValues) {
      console.log('Initializing values for sliders:', Object.keys(newValues));
      // Initialize all missing values at once
      Object.entries(newValues).forEach(([id, value]) => {
        onChange(id, value);
      });
    }
  }, [categories, values, onChange]);

  // Generic tooltip descriptions for different preference types
  const getTooltipText = (slider: SliderData) => {
    return `This slider lets you indicate where you fall on the spectrum between "${slider.leftLabel}" and "${slider.rightLabel}". Move the slider to reflect your preference.`;
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
                  <div className="flex items-center gap-3 flex-shrink-0 min-w-[30%]">
                    {isComplete ? (
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </div>
                    ) : (
                      <div className={`p-1.5 rounded-full ${colorScheme.background}`}>
                        <Circle className={`h-5 w-5 ${colorScheme.iconColor} flex-shrink-0`} />
                      </div>
                    )}
                    <span className="text-lg font-semibold text-gray-900 truncate">{category.name}</span>
                    {isComplete && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 ml-auto">
                    <div className="hidden md:flex items-center gap-2 text-sm">
                      <span className={`font-medium ${isComplete ? 'text-green-600' : colorScheme.iconColor}`}>
                        {completion.completed}/{completion.total}
                      </span>
                      <span className="text-gray-500">sliders adjusted</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-3 flex-shrink-0 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ease-in-out ${
                          isComplete 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : `bg-gradient-to-r ${colorScheme.progressBackground.replace('bg-', 'from-')}-400 to-${colorScheme.progressBackground.replace('bg-', '')}-500`
                        }`}
                        style={{ width: `${completion.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 sm:px-4">
                <div className="py-2 sm:py-3">
                  {category.description && (
                    <div className="mb-3 bg-white bg-opacity-70 p-2 sm:p-3 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 py-2">
                    {/* Show all sliders in each category */}
                    {category.sliders.map((slider, index) => (
                      <div 
                        key={slider.id} 
                        className={`${
                          index < category.sliders.length - 1 ? 'border-b border-gray-50 pb-3' : ''
                        }`}
                      >
                        <div className="mb-1">
                          <h4 className="font-medium text-gray-800 text-sm sm:text-base">{slider.name}</h4>
                        </div>
                        <SliderWithLabels
                          leftLabel={slider.leftLabel}
                          rightLabel={slider.rightLabel}
                          value={values[slider.id] ?? 50}
                          onChange={(value) => onChange(slider.id, value)}
                          name={slider.id}
                          hasValue={slider.id in values}
                          isAdjusted={isSliderAdjusted(slider.id)}
                          tooltipContent={getTooltipText(slider)}
                          accentColor={colorScheme.progressBackground.replace('bg-', 'text-')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}