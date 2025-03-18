
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeneratedCampaign } from "@/lib/generateCampaign";
import TransitionElement from "./TransitionElement";
import { Campaign } from "@/lib/campaignData";
import { Check, Copy, MessageSquare, RefreshCw, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";

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
    <TransitionElement animation="fade" className="w-full max-w-5xl mx-auto">
      <div className="bg-white/30 backdrop-blur-xl border border-white/20 dark:bg-gray-900/40 dark:border-gray-800/50 rounded-xl shadow-subtle overflow-hidden">
        {/* Header section */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-md border-b border-white/10 dark:border-gray-800/50 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-white tracking-tight">Generated Campaign</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-sm bg-white/20 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-800/40"
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-sm bg-white/20 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-800/40"
                onClick={onGenerateAnother}
              >
                <RefreshCw size={16} />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {showFeedbackForm && !feedbackOpen && !refinementRequested && (
            <div className="mb-6">
              <Button 
                variant="secondary" 
                className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none"
                onClick={() => setFeedbackOpen(true)}
              >
                <MessageSquare size={16} />
                Rate & Refine This Campaign
              </Button>
            </div>
          )}

          {showFeedbackForm && feedbackOpen && !refinementRequested && (
            <TransitionElement animation="fade" className="mb-8">
              <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/10">
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
                      className="w-full rounded-md border border-input bg-white/90 dark:bg-gray-800/60 p-3 text-sm"
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
          
          <div className="space-y-10">
            {/* Campaign Name */}
            <TransitionElement delay={100} animation="slide-up">
              <div className="border-b border-gray-100 dark:border-gray-800/50 pb-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Campaign Name</h3>
                <div className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-primary to-blue-500 dark:from-primary dark:to-blue-400 bg-clip-text text-transparent">
                  {campaign.campaignName}
                </div>
              </div>
            </TransitionElement>
            
            {/* Key Message */}
            <TransitionElement delay={200} animation="slide-up">
              <div className="border-b border-gray-100 dark:border-gray-800/50 pb-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Key Message</h3>
                <div className="text-xl md:text-2xl italic text-gray-700 dark:text-gray-200 leading-relaxed">{campaign.keyMessage}</div>
              </div>
            </TransitionElement>
            
            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Creative Strategy */}
              <TransitionElement delay={300} animation="slide-up">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Creative Strategy</h3>
                  <ul className="space-y-4">
                    {campaign.creativeStrategy.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <span className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <Check size={14} />
                        </span>
                        <span className="text-gray-700 dark:text-gray-200">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TransitionElement>
              
              {/* Execution Plan */}
              <TransitionElement delay={400} animation="slide-up">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Execution Plan</h3>
                  <ul className="space-y-4">
                    {campaign.executionPlan.map((plan, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <span className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <Check size={14} />
                        </span>
                        <span className="text-gray-700 dark:text-gray-200">{plan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TransitionElement>
            </div>
            
            {/* Expected Outcomes */}
            <TransitionElement delay={500} animation="slide-up">
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Expected Outcomes</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50">
                  <ul className="space-y-4">
                    {campaign.expectedOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <span className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <Check size={14} />
                        </span>
                        <span className="text-gray-700 dark:text-gray-200">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TransitionElement>
            
            {/* Inspiration */}
            <TransitionElement delay={600} animation="slide-up">
              <div className="pt-4">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
      className="h-full"
    >
      <Card className="h-full bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-100 dark:border-gray-800/50 transition-all duration-300 hover:shadow-md hover:bg-white/70 dark:hover:bg-gray-800/40">
        <CardContent className="p-4">
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
            
            <div className="flex flex-wrap gap-1 pt-1">
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
        </CardContent>
      </Card>
    </TransitionElement>
  );
};

export default CampaignResult;
