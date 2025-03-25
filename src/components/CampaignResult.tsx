
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowUpRight, RefreshCw, Sparkles, ThumbsDown as ThumbsDownIcon, ThumbsUp as ThumbsUpIcon } from 'lucide-react';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import FeedbackSystem, { CampaignFeedbackData } from './FeedbackSystem';

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

const CampaignResult: React.FC<CampaignResultProps> = ({ 
  campaign, 
  onGenerateAnother, 
  showFeedbackForm = false, 
  onRefine 
}: CampaignResultProps) => {
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
      // Convert the FeedbackSystem's data format to our component's format
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
  
  return (
    <div className="space-y-6 mb-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
          <CardTitle className="text-2xl md:text-3xl">{campaign.campaignName}</CardTitle>
          <CardDescription className="text-lg md:text-xl font-medium text-foreground/90">
            {campaign.keyMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Campaign Name Section */}
          <div>
            <h3 className="font-medium text-lg mb-2 flex items-center justify-between">
              Campaign Name
              {showFeedbackForm && !feedbackSubmitted && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("campaignName", -1)}
                    className={elementRatings.campaignName === -1 ? "bg-red-100 dark:bg-red-900/20" : ""}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("campaignName", 1)}
                    className={elementRatings.campaignName === 1 ? "bg-green-100 dark:bg-green-900/20" : ""}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </h3>
            <p>{campaign.campaignName}</p>
          </div>
          
          <Separator />
          
          {/* Key Message Section */}
          <div>
            <h3 className="font-medium text-lg mb-2 flex items-center justify-between">
              Key Message
              {showFeedbackForm && !feedbackSubmitted && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("keyMessage", -1)}
                    className={elementRatings.keyMessage === -1 ? "bg-red-100 dark:bg-red-900/20" : ""}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("keyMessage", 1)}
                    className={elementRatings.keyMessage === 1 ? "bg-green-100 dark:bg-green-900/20" : ""}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </h3>
            <p>{campaign.keyMessage}</p>
          </div>
          
          <Separator />
          
          {/* Creative Strategy Section */}
          <div>
            <h3 className="font-medium text-lg mb-2 flex items-center justify-between">
              Creative Strategy
              {showFeedbackForm && !feedbackSubmitted && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("creativeStrategy", -1)}
                    className={elementRatings.creativeStrategy === -1 ? "bg-red-100 dark:bg-red-900/20" : ""}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("creativeStrategy", 1)}
                    className={elementRatings.creativeStrategy === 1 ? "bg-green-100 dark:bg-green-900/20" : ""}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </h3>
            <ul className="list-disc list-inside space-y-2">
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
          <div>
            <h3 className="font-medium text-lg mb-2 flex items-center justify-between">
              Execution Plan
              {showFeedbackForm && !feedbackSubmitted && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("executionPlan", -1)}
                    className={elementRatings.executionPlan === -1 ? "bg-red-100 dark:bg-red-900/20" : ""}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleElementRating("executionPlan", 1)}
                    className={elementRatings.executionPlan === 1 ? "bg-green-100 dark:bg-green-900/20" : ""}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </h3>
            <ol className="list-decimal list-inside space-y-2">
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
              <div>
                <h3 className="font-medium text-lg mb-2">Expected Outcomes</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {Array.isArray(campaign.expectedOutcomes) ? 
                    campaign.expectedOutcomes.map((outcome, index) => (
                      <li key={index} className="pl-1">
                        <span className="ml-1">{outcome}</span>
                      </li>
                    )) : 
                    <li>{campaign.expectedOutcomes}</li>
                  }
                </ol>
              </div>
            </>
          )}
          
          {/* Viral Element Section */}
          {(campaign.viralElement || campaign.viralHook) && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-lg mb-2">Viral Element</h3>
                <p>{campaign.viralElement || campaign.viralHook}</p>
              </div>
            </>
          )}
          
          {/* Call to Action Section */}
          {(campaign.callToAction || campaign.consumerInteraction) && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-lg mb-2">Call to Action</h3>
                <p>{campaign.callToAction || campaign.consumerInteraction}</p>
              </div>
            </>
          )}
          
          {/* Emotional Appeal Section */}
          {campaign.emotionalAppeal && campaign.emotionalAppeal.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-lg mb-2">Emotional Appeal</h3>
                <ul className="list-disc list-inside space-y-2">
                  {Array.isArray(campaign.emotionalAppeal) ? 
                    campaign.emotionalAppeal.map((appeal, index) => (
                      <li key={index}>{appeal}</li>
                    )) : 
                    <li>{campaign.emotionalAppeal}</li>
                  }
                </ul>
              </div>
            </>
          )}
          
          {/* Reference Campaigns Section */}
          {campaign.referenceCampaigns && campaign.referenceCampaigns.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-lg mb-2">Reference Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {campaign.referenceCampaigns.map((refCampaign, index) => (
                    <div key={index} className="bg-muted/40 p-4 rounded-lg">
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
