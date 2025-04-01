
import React, { useState } from 'react';
import { Star, ThumbsUp as ThumbsUpIcon, ThumbsDown as ThumbsDownIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

export interface ElementRating {
  campaignName: number;
  keyMessage: number;
  creativeStrategy: number;
  executionPlan: number;
}

export interface CampaignFeedbackData {
  overallRating: number;
  elementRatings: ElementRating;
  comments: string;
  timestamp: string;
}

interface FeedbackSystemProps {
  onSubmitFeedback: (feedback: CampaignFeedbackData) => void;
  isSubmitting?: boolean;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ 
  onSubmitFeedback,
  isSubmitting = false
}) => {
  const [overallRating, setOverallRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  
  // Element-specific ratings (1 = positive, 0 = neutral, -1 = negative)
  const [elementRatings, setElementRatings] = useState<ElementRating>({
    campaignName: 0,
    keyMessage: 0,
    creativeStrategy: 0,
    executionPlan: 0
  });
  
  const handleElementRating = (element: keyof ElementRating, value: number) => {
    setElementRatings(prev => ({
      ...prev,
      [element]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedback: CampaignFeedbackData = {
      overallRating,
      elementRatings,
      comments,
      timestamp: new Date().toISOString()
    };
    
    onSubmitFeedback(feedback);
  };
  
  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Rate this campaign</h3>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Overall rating</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setOverallRating(star)}
                className="text-2xl focus:outline-none"
              >
                <Star 
                  className={cn(
                    "h-6 w-6", 
                    overallRating >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  )} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {overallRating > 0 ? `${overallRating}/5` : 'Select rating'}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm font-medium">Rate specific elements</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ElementRatingItem 
              label="Campaign Name" 
              value={elementRatings.campaignName}
              onChange={(value) => handleElementRating('campaignName', value)}
            />
            
            <ElementRatingItem 
              label="Key Message" 
              value={elementRatings.keyMessage}
              onChange={(value) => handleElementRating('keyMessage', value)}
            />
            
            <ElementRatingItem 
              label="Creative Strategy" 
              value={elementRatings.creativeStrategy}
              onChange={(value) => handleElementRating('creativeStrategy', value)}
            />
            
            <ElementRatingItem 
              label="Execution Plan" 
              value={elementRatings.executionPlan}
              onChange={(value) => handleElementRating('executionPlan', value)}
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">What could be improved?</p>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share your thoughts on how to make this campaign better..."
            className="resize-none"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={overallRating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper component for thumbs up/down rating
const ElementRatingItem = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(value === 1 ? 0 : 1)}
          className={cn(
            "p-1 rounded-md transition-colors",
            value === 1 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : 
                         "text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
          )}
        >
          <ThumbsUpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(value === -1 ? 0 : -1)}
          className={cn(
            "p-1 rounded-md transition-colors",
            value === -1 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : 
                          "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
          )}
        >
          <ThumbsDownIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FeedbackSystem;
