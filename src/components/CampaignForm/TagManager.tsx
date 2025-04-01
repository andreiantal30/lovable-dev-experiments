
import React from "react";
import { Button } from "@/components/ui/button";
import TransitionElement from "@/components/TransitionElement";
import AutoSuggestInput from '@/components/AutoSuggestInput';
import { XCircle } from "lucide-react";
import { industries, emotionalAppeals, objectives, targetAudiences } from "@/lib/campaignData";

interface TagManagerProps {
  title: string;
  required?: boolean;
  delay?: number;
  keyName: 'targetAudience' | 'objectives' | 'emotionalAppeal';
  selectedItems: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addItem: (value: string) => void;
  removeItem: (index: number) => void;
  error?: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  title,
  required = false,
  delay = 0,
  keyName,
  selectedItems,
  inputValue,
  setInputValue,
  addItem,
  removeItem,
  error
}) => {
  const getSuggestions = () => {
    switch (keyName) {
      case 'targetAudience':
        return targetAudiences;
      case 'objectives':
        return objectives;
      case 'emotionalAppeal':
        return emotionalAppeals;
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();
  
  return (
    <TransitionElement delay={delay}>
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center justify-between text-foreground dark:text-white/90">
          <span className="flex items-center">
            {title}
            {required && (
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
                Required
              </span>
            )}
          </span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const randomItem = suggestions[Math.floor(Math.random() * suggestions.length)];
              if (!selectedItems.includes(randomItem)) {
                addItem(randomItem);
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white h-7 px-2"
          >
            Add Random
          </Button>
        </label>
        
        <div className="flex flex-wrap gap-2 mb-4 min-h-10 p-1">
          {selectedItems.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-primary/15 text-primary dark:bg-primary/30 dark:text-white flex items-center gap-2 rounded-md text-sm border border-primary/20 dark:border-primary/40 shadow-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-primary/80 hover:text-primary dark:text-white/80 dark:hover:text-white"
              >
                <XCircle size={16} />
              </button>
            </span>
          ))}
        </div>
        
        <AutoSuggestInput
          suggestions={suggestions}
          value={inputValue}
          onChange={setInputValue}
          onSelect={(value) => addItem(value)}
          placeholder={`Type or select ${keyName === 'emotionalAppeal' ? 'emotion' : keyName === 'objectives' ? 'objective' : 'audience'}`}
          error={!!error}
        />
        
        {error && (
          <p className="text-xs text-destructive dark:text-red-400 mt-2">{error}</p>
        )}
        {selectedItems.length === 0 && !error && (
          <p className="text-xs text-muted-foreground dark:text-white/60 mt-2">
            At least one {keyName === 'emotionalAppeal' ? 'emotional appeal' : keyName === 'objectives' ? 'objective' : 'target audience'} is required
          </p>
        )}
      </div>
    </TransitionElement>
  );
};

export default TagManager;
