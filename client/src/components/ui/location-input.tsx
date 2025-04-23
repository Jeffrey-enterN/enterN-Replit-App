import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value: string[];
  onChange: (locations: string[]) => void;
  maxLocations?: number;
  className?: string;
}

export function LocationInput({
  value = [],
  onChange,
  maxLocations = 10,
  className
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addLocation = (location: string) => {
    const trimmedLocation = location.trim();
    if (
      trimmedLocation &&
      !value.includes(trimmedLocation) &&
      value.length < maxLocations
    ) {
      onChange([...value, trimmedLocation]);
    }
    setInputValue('');
  };

  const removeLocation = (location: string) => {
    onChange(value.filter(l => l !== location));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addLocation(inputValue);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type location and press Enter"
          disabled={value.length >= maxLocations}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addLocation(inputValue)}
          disabled={!inputValue.trim() || value.length >= maxLocations}
        >
          Add
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((location) => (
            <div
              key={location}
              className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
            >
              <span>{location}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeLocation(location)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {location}</span>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {value.length >= maxLocations && (
        <p className="text-xs text-amber-600">
          Maximum of {maxLocations} locations reached
        </p>
      )}
    </div>
  );
}