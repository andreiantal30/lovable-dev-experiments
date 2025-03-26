
import React from 'react';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import { Separator } from '@/components/ui/separator';
import ElementRating from './ElementRating';

interface CampaignLeftColumnProps {
  campaign: GeneratedCampaign;
  showFeedbackForm: boolean;
  feedbackSubmitted: boolean;
  elementRatings: Record<string, number>;
  onRateElement: (element: string, value: number) => void;
}

const CampaignLeftColumn: React.FC<CampaignLeftColumnProps> = ({
  campaign,
  showFeedbackForm,
  feedbackSubmitted,
  elementRatings,
  onRateElement
}) => {
  return (
    <div className="md:col-span-5 space-y-6 border-r-0 md:border-r border-dashed border-gray-200 dark:border-gray-700 pr-0 md:pr-6">
      {/* The Insight & The Idea Section - combined for better coherence */}
      <div className="space-y-4">
        <ElementRating
          element="The Insight"
          elementKey="keyMessage"
          rating={elementRatings.keyMessage}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
        />
        <p className="text-muted-foreground italic mb-2">{campaign.keyMessage}</p>
        
        <ElementRating
          element="The Idea"
          elementKey="campaignName"
          rating={elementRatings.campaignName}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
          hideIfNoFeedback={true}
        />
        <p className="font-semibold text-lg text-primary">{campaign.campaignName}</p>
      </div>
      
      {/* Emotional Appeal Section */}
      {campaign.emotionalAppeal && campaign.emotionalAppeal.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-primary">Emotional & Strategic Hooks</h3>
            <ul className="list-disc list-inside space-y-2 pl-2">
              {Array.isArray(campaign.emotionalAppeal) ? 
                campaign.emotionalAppeal.map((appeal, index) => (
                  <li key={index} className="pl-1"><span className="ml-1">{appeal}</span></li>
                )) : 
                <li className="pl-1"><span className="ml-1">{campaign.emotionalAppeal}</span></li>
              }
            </ul>
          </div>
        </>
      )}
      
      {/* Call to Action Section - enhanced with better styling */}
      {(campaign.callToAction || campaign.consumerInteraction) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-primary">Call to Action</h3>
            <p className="font-medium text-base border-l-4 border-primary pl-3 py-1 bg-primary/5 italic">
              "{campaign.callToAction || campaign.consumerInteraction}"
            </p>
          </div>
        </>
      )}

      {/* Viral Element moved to RightColumn */}
    </div>
  );
};

export default CampaignLeftColumn;
