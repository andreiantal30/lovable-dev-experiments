import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeneratedCampaign } from "@/lib/generateCampaign";
import TransitionElement from "./TransitionElement";
import { Campaign } from "@/lib/campaignData";
import { Check, Copy, MessageSquare, RefreshCw, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface CampaignResultProps {
  campaign: GeneratedCampaign;
  onGenerateAnother: () => void;
  showFeedbackForm?: boolean;
  onRefine?: (feedback: CampaignFeedback) => Promise<void>;
}

export interface CampaignFeedback {
  campaignId: string;
  overallRating: number;
  elementRatings: {
    campaignName: number;
    keyMessage: number;
    creativeStrategy: number;
    executionPlan: number;
  };
  comments: string;
}

const CampaignResult: React.FC<CampaignResultProps> = ({ 
  campaign, 
  onGenerateAnother, 
  showFeedbackForm = true,
  onRefine 
}) => {
  const [copied, setCopied] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [elementRatings, setElementRatings] = useState({
    campaignName: 0,
    keyMessage: 0,
    creativeStrategy: 0,
    executionPlan: 0,
  });
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [refinementRequested, setRefinementRequested] = useState(false);

  const handleCopy = () => {
    const campaignText = `
Campaign Name: ${campaign.campaignName}

Key Message: ${campaign.keyMessage}

Creative Strategy:
${campaign.creativeStrategy.map(strategy => `- ${strategy}`).join('\n')}

Execution Plan:
${campaign.executionPlan.map(plan => `- ${plan}`).join('\n')}

Expected Outcomes:
${campaign.expectedOutcomes.map(outcome => `- ${outcome}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(campaignText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleElementRating = (element: keyof typeof elementRatings, rating: number) => {
    setElementRatings(prev => ({
      ...prev,
      [element]: rating
    }));
  };

  const handleSubmitFeedback = async () => {
    if (!onRefine) {
      toast.error("Refinement functionality is not available");
      return;
    }

    setSubmittingFeedback(true);
    
    try {
      const feedback: CampaignFeedback = {
        campaignId: campaign.campaignName, // Using campaign name as an ID for now
        overallRating,
        elementRatings,
        comments
      };
      
      await onRefine(feedback);
      toast.success("Thanks for your feedback! We're refining your campaign.");
      setRefinementRequested(true);
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error("Feedback submission error:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <TransitionElement animation="fade" className="w-full max-w-4xl mx-auto">
      <div className="bg-white/50 backdrop-blur-lg border border-border rounded-2xl shadow-subtle p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-medium">Generated Campaign</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-sm"
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-sm"
              onClick={onGenerateAnother}
            >
              <RefreshCw size={16} />
              Regenerate
            </Button>
          </div>
        </div>
        
        {showFeedbackForm && !feedbackOpen && !refinementRequested && (
          <div className="mb-6">
            <Button 
              variant="secondary" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setFeedbackOpen(true)}
            >
              <MessageSquare size={16} />
              Rate & Refine This Campaign
            </Button>
          </div>
        )}

        {showFeedbackForm && feedbackOpen && !refinementRequested && (
          <TransitionElement animation="fade" className="mb-8">
            <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Rate This Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Overall Rating</div>
                  <StarRating value={overallRating} onChange={setOverallRating} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Campaign Name</div>
                    <ThumbRating 
                      value={elementRatings.campaignName} 
                      onChange={(v) => handleElementRating('campaignName', v)} 
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Key Message</div>
                    <ThumbRating 
                      value={elementRatings.keyMessage} 
                      onChange={(v) => handleElementRating('keyMessage', v)} 
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Creative Strategy</div>
                    <ThumbRating 
                      value={elementRatings.creativeStrategy} 
                      onChange={(v) => handleElementRating('creativeStrategy', v)} 
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Execution Plan</div>
                    <ThumbRating 
                      value={elementRatings.executionPlan} 
                      onChange={(v) => handleElementRating('executionPlan', v)} 
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Comments or Refinement Suggestions</div>
                  <textarea
                    className="w-full rounded-md border border-input bg-white/90 p-3 text-sm"
                    rows={3}
                    placeholder="What would you like to improve or change?"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setFeedbackOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || overallRating === 0}
                  >
                    {submittingFeedback ? "Submitting..." : "Submit & Refine"}
                  </Button>
                </div>
              </div>
            </div>
          </TransitionElement>
        )}

        {refinementRequested && (
          <TransitionElement animation="fade" className="mb-6">
            <Alert>
              <AlertTitle>Refining your campaign</AlertTitle>
              <AlertDescription>
                We're analyzing your feedback to improve the campaign. A refined version will be available soon.
              </AlertDescription>
            </Alert>
          </TransitionElement>
        )}
        
        <div className="space-y-8">
          <TransitionElement delay={100} animation="slide-up">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Campaign Name</h3>
              <div className="text-3xl md:text-4xl font-medium text-primary">{campaign.campaignName}</div>
            </div>
          </TransitionElement>
          
          <TransitionElement delay={200} animation="slide-up">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Key Message</h3>
              <div className="text-xl md:text-2xl italic">"{campaign.keyMessage}"</div>
            </div>
          </TransitionElement>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TransitionElement delay={300} animation="slide-up">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Creative Strategy</h3>
                <ul className="space-y-3">
                  {campaign.creativeStrategy.map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                        <Check size={16} />
                      </span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TransitionElement>
            
            <TransitionElement delay={400} animation="slide-up">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Execution Plan</h3>
                <ul className="space-y-3">
                  {campaign.executionPlan.map((plan, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                        <Check size={16} />
                      </span>
                      <span>{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TransitionElement>
          </div>
          
          <TransitionElement delay={500} animation="slide-up">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Expected Outcomes</h3>
              <ul className="space-y-3">
                {campaign.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                      <Check size={16} />
                    </span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TransitionElement>
          
          <TransitionElement delay={600} animation="slide-up">
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Inspired by These Award-Winning Campaigns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaign.referenceCampaigns.map((ref, index) => (
                  <InspirationCard key={index} campaign={ref} index={index} />
                ))}
              </div>
            </div>
          </TransitionElement>
        </div>
      </div>
    </TransitionElement>
  );
};

const StarRating: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-1 rounded-full hover:bg-primary/10 transition-colors ${
            star <= value ? "text-primary" : "text-muted-foreground/40"
          }`}
        >
          <Star size={20} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
};

const ThumbRating: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(value === -1 ? 0 : -1)}
        className={`p-1.5 rounded-full hover:bg-destructive/10 transition-colors ${
          value === -1 ? "bg-destructive/20 text-destructive" : "text-muted-foreground"
        }`}
      >
        <ThumbsDown size={18} />
      </button>
      
      <button
        type="button"
        onClick={() => onChange(value === 1 ? 0 : 1)}
        className={`p-1.5 rounded-full hover:bg-primary/10 transition-colors ${
          value === 1 ? "bg-primary/20 text-primary" : "text-muted-foreground"
        }`}
      >
        <ThumbsUp size={18} />
      </button>
    </div>
  );
};

interface InspirationCardProps {
  campaign: Campaign;
  index: number;
}

const InspirationCard: React.FC<InspirationCardProps> = ({ campaign, index }) => {
  return (
    <TransitionElement 
      delay={700 + index * 100} 
      animation="slide-up" 
      className="bg-white/70 backdrop-blur-sm border rounded-lg p-4 hover:shadow-subtle transition-shadow duration-300"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {campaign.year}
          </div>
          <div className="text-xs text-muted-foreground">{campaign.industry}</div>
        </div>
        
        <h4 className="font-medium text-lg">{campaign.name}</h4>
        <div className="text-sm text-muted-foreground">by {campaign.brand}</div>
        
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Key Message:</div>
          <div className="text-sm italic">"{campaign.keyMessage}"</div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {campaign.emotionalAppeal.slice(0, 3).map((emotion, i) => (
            <span
              key={i}
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                i === 0 ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
              )}
            >
              {emotion}
            </span>
          ))}
        </div>
      </div>
    </TransitionElement>
  );
};

export default CampaignResult;
