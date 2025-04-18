// src/components/CampaignResult.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, Sparkles } from 'lucide-react';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import FeedbackSystem, { CampaignFeedbackData } from './FeedbackSystem';
import CreativeDirectorEvaluation from './CreativeDirectorEvaluation';

export interface CampaignFeedback {
  overallRating: number;
  elementRatings: {
    campaignName: number;
    keyMessage: number;
    creativeStrategy: number;
    executionPlan: number;
  };
  comments: string;
  timestamp: string;
}

export interface CampaignResultProps {
  campaign: GeneratedCampaign;
  onGenerateAnother?: () => void;
  showFeedbackForm?: boolean;
  onRefine?: (feedback: CampaignFeedback) => Promise<void>;
}

type MultiLayeredInsight = {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
};

const CampaignResult: React.FC<CampaignResultProps> = ({ 
  campaign, 
  onGenerateAnother, 
  showFeedbackForm = false, 
  onRefine 
}) => {
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [elementRatings, setElementRatings] = useState<CampaignFeedback["elementRatings"]>({
    campaignName: 0,
    keyMessage: 0,
    creativeStrategy: 0,
    executionPlan: 0,
  });

  const handleElementRating = (element: keyof CampaignFeedback["elementRatings"], value: number) => {
    setElementRatings(prev => ({
      ...prev,
      [element]: value
    }));
  };

  const handleSubmitFeedback = async (feedback: CampaignFeedbackData) => {
    if (!onRefine) return;
    setIsSubmittingFeedback(true);
    try {
      const campaignFeedback: CampaignFeedback = {
        overallRating: feedback.overallRating,
        comments: feedback.comments,
        elementRatings: feedback.elementRatings,
        timestamp: feedback.timestamp
      };
      await onRefine(campaignFeedback);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    console.log("Generated Campaign:", campaign);
  }, [campaign]);

  if (!campaign || !campaign.campaignName || !campaign.keyMessage) {
    return <div>Loading...</div>;
  }

  const isMultiLayeredInsight = (insight: any): insight is MultiLayeredInsight =>
    insight && typeof insight === 'object' && 'surfaceInsight' in insight;

  return (
    <div className="space-y-6 mb-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
          <CardTitle className="text-2xl md:text-3xl">{campaign.campaignName}</CardTitle>
          <CardDescription className="text-lg md:text-xl font-medium text-foreground/90">
            {campaign.keyMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="md:col-span-5 space-y-6">
            {campaign.insight && (
  <div>
    <h3 className="font-medium text-lg text-primary">The Insight</h3>
    <p className="text-foreground/90">
      {typeof campaign.insight === 'string'
        ? campaign.insight
        : typeof campaign.insight === 'object' && 'surfaceInsight' in campaign.insight
          ? (campaign.insight as any).surfaceInsight
          : '—'}
    </p>
  </div>
)}

              {campaign.idea && (
                <div>
                  <h3 className="font-medium text-lg text-primary">The Idea</h3>
                  <p className="text-foreground/90">{campaign.idea}</p>
                </div>
              )}

              {/* Creative Insights */}
              {(campaign.creativeInsights && (Array.isArray(campaign.creativeInsights) || typeof campaign.creativeInsights === 'object')) && (
                <div>
                  <h3 className="font-medium text-lg text-primary">💡 Creative Insights</h3>
                  <ul className="pl-1 space-y-4">
                    {(Array.isArray(campaign.creativeInsights)
                      ? campaign.creativeInsights
                      : [campaign.creativeInsights]
                    ).map((insight, index) => (
                      <li key={index} className="bg-muted/40 p-3 rounded-md border">
                        {isMultiLayeredInsight(insight) ? (
                          <>
                            <p><strong>Surface Insight:</strong> {insight.surfaceInsight}</p>
                            <p><strong>Emotional Undercurrent:</strong> {insight.emotionalUndercurrent}</p>
                            <p><strong>Creative Unlock:</strong> {insight.creativeUnlock}</p>
                          </>
                        ) : (
                          <p>{insight}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {campaign.callToAction && (
                <div>
                  <h3 className="font-medium text-lg text-primary">Call to Action</h3>
                  <p>{campaign.callToAction}</p>
                </div>
              )}

              {campaign.viralElement && (
                <div>
                  <h3 className="font-medium text-lg text-primary">Viral Element</h3>
                  <p>{campaign.viralElement}</p>
                </div>
              )}

              {campaign.prHeadline && (
                <div>
                  <h3 className="font-medium text-lg text-primary">PR Headline</h3>
                  <p className="italic">{campaign.prHeadline}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="md:col-span-7 space-y-6 pl-0 md:pl-6">
              {campaign.creativeStrategy?.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg text-primary">The How</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {campaign.creativeStrategy.map((strat, index) => (
                      <li key={index}>{strat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {campaign.executionPlan?.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg text-primary">Execution Plan</h3>
                  <ul className="list-decimal pl-5 space-y-1">
                    {campaign.executionPlan.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {campaign.expectedOutcomes?.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg text-primary">Expected Outcomes</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {campaign.expectedOutcomes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {campaign.referenceCampaigns?.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg text-primary">Reference Campaigns</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.referenceCampaigns.map((ref, index) => (
                      <div key={index} className="text-sm bg-muted px-3 py-1 rounded-full">
                        <strong>{ref.name}</strong> – {ref.brand}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaign.evaluation && (
                <CreativeDirectorEvaluation evaluation={campaign.evaluation} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showFeedbackForm && !feedbackSubmitted && onRefine && (
        <div className="mt-6">
          <FeedbackSystem 
            onSubmitFeedback={handleSubmitFeedback}
            isSubmitting={isSubmittingFeedback}
          />
        </div>
      )}

      {feedbackSubmitted && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="flex items-center text-green-700 dark:text-green-400 font-medium">
            <Sparkles className="h-5 w-5 mr-2" />
            Thanks for your feedback! Your refined campaign is being generated.
          </p>
        </div>
      )}

      {onGenerateAnother && (
        <div className="flex justify-center mt-8">
          <Button onClick={onGenerateAnother} variant="outline" className="mr-4">
            Generate Another Campaign
          </Button>
          {onRefine && !feedbackSubmitted && (
            <Button onClick={() => {
              const defaultFeedback: CampaignFeedback = {
                overallRating: 4,
                comments: "Please refine this campaign",
                elementRatings,
                timestamp: new Date().toISOString()
              };
              onRefine(defaultFeedback);
              setFeedbackSubmitted(true);
              setIsSubmittingFeedback(true);
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine This Campaign
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignResult;