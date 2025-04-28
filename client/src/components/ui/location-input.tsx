import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LOCATIONS } from '@/lib/constants';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter locations based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = LOCATIONS.filter(
        location => location.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 7); // Limit to 7 suggestions
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [inputValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addLocation = (location: string) => {
    const standardizedLocation = standardizeLocation(location.trim());
    
    if (
      standardizedLocation &&
      !value.includes(standardizedLocation) &&
      value.length < maxLocations
    ) {
      onChange([...value, standardizedLocation]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  // Function to standardize location format (City, State)
  const standardizeLocation = (location: string): string => {
    // Check if it's already in our approved list
    const exactMatch = LOCATIONS.find(
      loc => loc.toLowerCase() === location.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Format is likely not standard, but we'll add it with a warning
    return location;
  };

  const removeLocation = (location: string) => {
    onChange(value.filter(l => l !== location));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredLocations.length > 0) {
        // If we have suggestions and Enter is pressed, use the first suggestion
        addLocation(filteredLocations[0]);
      } else {
        // Otherwise use the raw input
        addLocation(inputValue);
      }
    } else if (e.key === 'Tab' && showSuggestions && filteredLocations.length > 0) {
      e.preventDefault();
      addLocation(filteredLocations[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      // Focus the first suggestion if available
      const firstSuggestion = document.querySelector('.location-suggestion') as HTMLElement;
      if (firstSuggestion) firstSuggestion.focus();
    }
  };

  return (
    <div className={cn("space-y-3 relative", className)}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing a US city, state or 'Remote'"
            disabled={value.length >= maxLocations}
            className="flex-1"
          />
          {showSuggestions && filteredLocations.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-muted rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredLocations.map((location, index) => (
                <button
                  key={location}
                  className="location-suggestion w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none transition-colors"
                  onClick={() => addLocation(location)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLocation(location);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const nextSuggestion = document.querySelectorAll('.location-suggestion')[index + 1] as HTMLElement;
                      if (nextSuggestion) nextSuggestion.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      if (index === 0) {
                        inputRef.current?.focus();
                      } else {
                        const prevSuggestion = document.querySelectorAll('.location-suggestion')[index - 1] as HTMLElement;
                        if (prevSuggestion) prevSuggestion.focus();
                      }
                    }
                  }}
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (inputValue.trim()) {
              addLocation(inputValue);
            } else {
              // Show all options when button is clicked with empty input
              setShowSuggestions(true);
              setFilteredLocations(LOCATIONS.slice(0, 10));
            }
          }}
          disabled={value.length >= maxLocations}
        >
          {inputValue.trim() ? 'Add' : <ChevronDown className="h-4 w-4" />}
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