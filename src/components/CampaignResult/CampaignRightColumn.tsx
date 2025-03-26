
import React from 'react';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import { Separator } from '@/components/ui/separator';
import ElementRating from './ElementRating';

interface CampaignRightColumnProps {
  campaign: GeneratedCampaign;
  showFeedbackForm: boolean;
  feedbackSubmitted: boolean;
  elementRatings: Record<string, number>;
  onRateElement: (element: string, value: number) => void;
}

const CampaignRightColumn: React.FC<CampaignRightColumnProps> = ({
  campaign,
  showFeedbackForm,
  feedbackSubmitted,
  elementRatings,
  onRateElement
}) => {
  return (
    <div className="md:col-span-7 space-y-6 pl-0 md:pl-6">
      {/* Creative Strategy Section - The How */}
      <div className="space-y-2">
        <ElementRating
          element="The How"
          elementKey="creativeStrategy"
          rating={elementRatings.creativeStrategy}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
        />
        <ul className="list-disc pl-5 space-y-2">
          {Array.isArray(campaign.creativeStrategy) ? 
            campaign.creativeStrategy.map((strategy, index) => (
              <li key={index}>{strategy}</li>
            )) : 
            <li>{campaign.creativeStrategy}</li>
          }
        </ul>
      </div>
      
      <Separator />
      
      {/* Execution Plan Section */}
      <div className="space-y-2">
        <ElementRating
          element="Execution Plan"
          elementKey="executionPlan"
          rating={elementRatings.executionPlan}
          onRate={onRateElement}
          showFeedback={showFeedbackForm}
          feedbackSubmitted={feedbackSubmitted}
        />
        <ol className="list-decimal pl-5 space-y-2">
          {Array.isArray(campaign.executionPlan) ? 
            campaign.executionPlan.map((execution, index) => (
              <li key={index} className="pl-1">
                <span className="ml-1">{execution}</span>
              </li>
            )) : 
            <li>{campaign.executionPlan}</li>
          }
        </ol>
      </div>
      
      {/* Expected Outcomes Section */}
      {campaign.expectedOutcomes && campaign.expectedOutcomes.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-primary">Expected Outcomes</h3>
            <ul className="list-disc pl-5 space-y-2">
              {Array.isArray(campaign.expectedOutcomes) ? 
                campaign.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="pl-1">
                    <span className="ml-1">{outcome}</span>
                  </li>
                )) : 
                <li>{campaign.expectedOutcomes}</li>
              }
            </ul>
          </div>
        </>
      )}
      
      {/* Reference Campaigns Section */}
      {campaign.referenceCampaigns && campaign.referenceCampaigns.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-medium text-lg text-primary">Reference Campaigns</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.referenceCampaigns.map((refCampaign, index) => (
                <div key={index} className="bg-muted/40 p-3 rounded-lg border border-muted">
                  <h4 className="font-medium">{refCampaign.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{refCampaign.brand}</span>
                    {refCampaign.industry && (
                      <> · {refCampaign.industry}</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignRightColumn;
