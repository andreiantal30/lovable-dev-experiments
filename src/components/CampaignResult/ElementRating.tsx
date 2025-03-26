
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsDown as ThumbsDownIcon, ThumbsUp as ThumbsUpIcon } from 'lucide-react';

interface ElementRatingProps {
  element: string;
  elementKey: string;
  rating: number;
  onRate: (element: string, value: number) => void;
  showFeedback: boolean;
  feedbackSubmitted: boolean;
}

const ElementRating: React.FC<ElementRatingProps> = ({
  element,
  elementKey,
  rating,
  onRate,
  showFeedback,
  feedbackSubmitted
}) => {
  if (!showFeedback || feedbackSubmitted) {
    return <h3 className="font-medium text-lg text-primary">{element}</h3>;
  }

  return (
    <h3 className="font-medium text-lg text-primary flex items-center justify-between">
      {element}
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onRate(elementKey, -1)}
          className={rating === -1 ? "bg-red-100 dark:bg-red-900/20" : ""}
        >
          <ThumbsDownIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onRate(elementKey, 1)}
          className={rating === 1 ? "bg-green-100 dark:bg-green-900/20" : ""}
        >
          <ThumbsUpIcon className="h-4 w-4" />
        </Button>
      </div>
    </h3>
  );
};

export default ElementRating;
