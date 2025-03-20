
import React, { useState } from 'react';
import { Star, ThumbsUp as ThumbsUpIcon, ThumbsDown as ThumbsDownIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface FeedbackSystemProps {
  onSubmitFeedback: (rating: number, comments: string) => void;
  isSubmitting?: boolean;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ 
  onSubmitFeedback,
  isSubmitting = false
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(rating, comments);
  };
  
  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Rate this campaign</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">How would you rate this campaign?</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
              >
                <Star 
                  className={cn(
                    "h-6 w-6", 
                    rating >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  )} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating}/5` : 'Select rating'}
            </span>
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
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSystem;
