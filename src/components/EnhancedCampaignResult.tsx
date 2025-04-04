import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneratedCampaign } from "@/lib/campaign/types";
import { Lightbulb } from "lucide-react";
import { CampaignFeedback } from "@/components/CampaignResult";
import { Button } from "@/components/ui/button";
import CreativeDirectorFeedback from "./CampaignResult/CreativeDirectorFeedback";

// Helper component to safely render complex data
const RenderField = ({ value }: { value: any }) => {
  if (typeof value === 'string') return <span>{value}</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {value.map((item, i) => (
          <li key={i}>
            <RenderField value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <pre className="text-sm bg-muted/50 p-2 rounded overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return <span>{String(value)}</span>;
};

export interface EnhancedCampaignResultProps {
  campaign: GeneratedCampaign;
  onGenerateAnother?: () => void;
  showFeedbackForm?: boolean;
  onRefine?: (feedback: CampaignFeedback) => Promise<void>;
}

const EnhancedCampaignResult: React.FC<EnhancedCampaignResultProps> = ({ 
  campaign,
  onGenerateAnother,
  showFeedbackForm = false,
  onRefine 
}) => {
  // Safely check for evaluation
  const hasEvaluation = campaign?.evaluation && 
  typeof campaign.evaluation === 'object' &&
  'insightSharpness' in campaign.evaluation &&
  'ideaOriginality' in campaign.evaluation;

  // Safely access all fields with fallbacks
  const safeCampaign = {
    ...campaign,
    campaignName: campaign.campaignName || 'Untitled Campaign',
    keyMessage: campaign.keyMessage || '',
    creativeInsights: Array.isArray(campaign.creativeInsights) ? campaign.creativeInsights : [],
    emotionalAppeal: Array.isArray(campaign.emotionalAppeal) ? campaign.emotionalAppeal : [],
    creativeStrategy: Array.isArray(campaign.creativeStrategy) ? campaign.creativeStrategy : [],
    executionPlan: Array.isArray(campaign.executionPlan) ? campaign.executionPlan : [],
    expectedOutcomes: Array.isArray(campaign.expectedOutcomes) ? campaign.expectedOutcomes : [],
    referenceCampaigns: Array.isArray(campaign.referenceCampaigns) ? campaign.referenceCampaigns : [],
  };

  return (
    <Card className="border shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-b">
        <CardTitle className="text-xl font-bold text-center">
          <RenderField value={safeCampaign.campaignName} />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-6 border-r-0 md:border-r border-dashed border-gray-200 dark:border-gray-700 pr-0 md:pr-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The Insight</h3>
              <p className="text-md">
                <RenderField value={safeCampaign.keyMessage} />
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The Idea</h3>
              <p className="text-md font-medium">
                <RenderField value={safeCampaign.campaignName} />
              </p>
            </div>

            // Replace the creativeInsights rendering section with:
{safeCampaign.creativeInsights.length > 0 && (
  <>
    <Separator className="my-4" />
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-primary">Creative Insights</h3>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {safeCampaign.creativeInsights.map((insight, index) => (
          <li key={index} className="text-md italic">
            {typeof insight === 'string' ? insight : (
              <>
                <p><strong>Insight:</strong> {insight.surfaceInsight}</p>
                {insight.emotionalUndercurrent && (
                  <p><strong>Emotion:</strong> {insight.emotionalUndercurrent}</p>
                )}
                {insight.creativeUnlock && (
                  <p><strong>Creative Unlock:</strong> {insight.creativeUnlock}</p>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  </>
)}

            {safeCampaign.emotionalAppeal.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Emotional & Strategic Hooks</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {safeCampaign.emotionalAppeal.map((appeal, index) => (
                      <li key={index} className="text-md">
                        <RenderField value={appeal} />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {(safeCampaign.callToAction || safeCampaign.consumerInteraction) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Call to Action</h3>
                  <p className="text-md">
                    <RenderField value={safeCampaign.callToAction || safeCampaign.consumerInteraction} />
                  </p>
                </div>
              </>
            )}

            {safeCampaign.prHeadline && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">PR Headline</h3>
                  <p className="text-md italic text-muted-foreground">
                    <RenderField value={safeCampaign.prHeadline} />
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6 pl-0 md:pl-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The How</h3>
              <div className="space-y-4">
                <p className="text-md">Implementation strategy to bring the idea to life:</p>
                <ul className="list-decimal pl-5 space-y-2">
                  {safeCampaign.creativeStrategy.map((strategy, index) => (
                    <li key={index} className="text-md">
                      <RenderField value={strategy} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Execution Plan</h3>
              <ol className="list-decimal pl-5 space-y-2">
                {safeCampaign.executionPlan.map((execution, index) => (
                  <li key={index} className="text-md">
                    <RenderField value={execution} />
                  </li>
                ))}
              </ol>
            </div>

            {safeCampaign.expectedOutcomes.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Expected Outcomes</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {safeCampaign.expectedOutcomes.map((outcome, index) => (
                      <li key={index} className="text-md">
                        <RenderField value={outcome} />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {safeCampaign.referenceCampaigns.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Reference Campaigns</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {safeCampaign.referenceCampaigns.map((refCampaign, index) => (
                      <div key={index} className="bg-muted/40 p-3 rounded-lg border border-muted">
                        <h4 className="font-medium text-sm">
                          <RenderField value={refCampaign.name} />
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">
                            <RenderField value={refCampaign.brand} />
                          </span>
                          {refCampaign.year && <> · <RenderField value={refCampaign.year} /></>}
                          {refCampaign.industry && <> · <RenderField value={refCampaign.industry} /></>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Creative Director Feedback */}
        {hasEvaluation && (
          <div className="mt-6">
            <CreativeDirectorFeedback feedback={campaign.evaluation} />
          </div>
        )}

        {onGenerateAnother && (
          <div className="flex justify-center mt-8">
            <Button onClick={onGenerateAnother} variant="outline">
              Generate Another Campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCampaignResult;