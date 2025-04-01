
import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

interface AutoSuggestInputProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder: string;
  className?: string;
  error?: boolean;
}

const AutoSuggestInput = ({
  suggestions,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  error
}: AutoSuggestInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else if (showAllSuggestions) {
      setFilteredSuggestions(suggestions); // Show all suggestions when button is clicked
    } else {
      setFilteredSuggestions([]);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions, showAllSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowAllSuggestions(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Show suggestions immediately on focus
    if (!value && !showAllSuggestions) {
      setShowAllSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicks to register
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowAllSuggestions(false);
      }
    }, 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    setIsFocused(false);
    setShowAllSuggestions(false);
    inputRef.current?.focus();
  };

  const handleShowAllSuggestions = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to maintain focus
    e.stopPropagation(); // Stop propagation to prevent immediate blur
    setShowAllSuggestions(true);
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        // If an item is highlighted, select it
        onSelect(filteredSuggestions[highlightedIndex]);
      } else if (value.trim()) {
        // If nothing is highlighted but there's text, use the input value
        onSelect(value.trim());
      }
      setIsFocused(false);
      setShowAllSuggestions(false);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setShowAllSuggestions(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="font-semibold text-primary">{part}</span> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md transition-all duration-200",
            "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "text-foreground dark:text-white dark:placeholder:text-white/50",
            error
              ? "border-destructive/50 focus:ring-destructive/20"
              : "border-input dark:border-gray-700",
            className
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleShowAllSuggestions}
          className="absolute right-1 top-1 h-8 w-8 p-0"
          title="Show all suggestions"
        >
          +
        </Button>
      </div>
      
      {(isFocused && filteredSuggestions.length > 0) && (
        <ul 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={cn(
                "cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700",
                highlightedIndex === index ? "bg-gray-100 dark:bg-gray-700" : ""
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {highlightMatch(suggestion, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggestInput;
