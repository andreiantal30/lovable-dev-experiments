
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Home } from 'lucide-react';
import { CampaignFeedback } from '@/components/CampaignResult';

interface CampaignActionsProps {
  onGenerateAnother?: () => void;
  onRefine?: (feedback: CampaignFeedback) => Promise<void>;
  feedbackSubmitted: boolean;
  elementRatings: Record<string, number>;
  isSubmittingFeedback: boolean;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({
  onGenerateAnother,
  onRefine,
  feedbackSubmitted,
  elementRatings,
  isSubmittingFeedback
}) => {
  if (!onGenerateAnother) return null;
  
  const handleReturnHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div>
      {feedbackSubmitted && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
          <p className="flex items-center text-green-700 dark:text-green-400 font-medium">
            <Sparkles className="h-5 w-5 mr-2" />
            Thanks for your feedback! Your refined campaign is being generated.
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button onClick={handleReturnHome} variant="outline" className="flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Button>
        
        <Button onClick={onGenerateAnother} variant="outline">
          Generate Another Campaign
        </Button>
        
        {onRefine && !feedbackSubmitted && (
          <Button onClick={() => {
            const defaultFeedback: CampaignFeedback = {
              overallRating: 4,
              comments: "Please refine this campaign",
              elementRatings: {
                campaignName: elementRatings.campaignName || 0,
                keyMessage: elementRatings.keyMessage || 0,
                creativeStrategy: elementRatings.creativeStrategy || 0,
                executionPlan: elementRatings.executionPlan || 0
              },
              timestamp: new Date().toISOString()
            };
            onRefine(defaultFeedback);
          }}
          disabled={isSubmittingFeedback}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refine This Campaign
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignActions;
