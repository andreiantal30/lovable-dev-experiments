
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
      {/* The Insight / Key Message */}
      <div className="space-y-2">
        <ElementRating
          element="The Insight"
          elementKey="keyMessage"
          rating={elementRatings.keyMessage}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
        />
        <p>{campaign.keyMessage}</p>
      </div>
      
      <Separator />
      
      {/* The Idea / Campaign Name */}
      <div className="space-y-2">
        <ElementRating
          element="The Idea"
          elementKey="campaignName"
          rating={elementRatings.campaignName}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
        />
        <p className="font-medium">{campaign.campaignName}</p>
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
      
      {/* Call to Action Section */}
      {(campaign.callToAction || campaign.consumerInteraction) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-primary">Call to Action</h3>
            <p>{campaign.callToAction || campaign.consumerInteraction}</p>
          </div>
        </>
      )}

      {/* Viral Element Section if available */}
      {(campaign.viralElement || campaign.viralHook) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-primary">Viral Element</h3>
            <p>{campaign.viralElement || campaign.viralHook}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignLeftColumn;
