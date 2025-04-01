
import React from 'react';
import { ChevronDown, Award } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { CampaignEvaluation, FeedbackCriterion } from '@/lib/campaign/types';

interface CreativeDirectorFeedbackProps {
  feedback: CampaignEvaluation;
  isLoading?: boolean;
}

const CreativeDirectorFeedback: React.FC<CreativeDirectorFeedbackProps> = ({ 
  feedback,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!feedback && !isLoading) return null;

  return (
    <div className="mt-6 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-amber-50/50 dark:bg-amber-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left bg-amber-100/70 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-medium text-lg">Creative Director Feedback</h3>
          </div>
          <ChevronDown className={`h-5 w-5 text-amber-600 dark:text-amber-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 py-3 space-y-4">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-5 bg-amber-200/50 dark:bg-amber-800/30 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-1/2"></div>
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-1/2"></div>
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-1/2"></div>
                  <div className="h-4 bg-amber-200/50 dark:bg-amber-800/30 rounded w-full"></div>
                </div>
                <div className="h-5 bg-amber-200/50 dark:bg-amber-800/30 rounded w-2/3"></div>
              </div>
            ) : feedback && (
              <>
                <div className="space-y-4">
                  <CriterionScore 
                    name="Insight Sharpness" 
                    score={feedback.insightSharpness.score} 
                    comment={feedback.insightSharpness.comment} 
                  />
                  
                  <CriterionScore 
                    name="Originality of the Idea" 
                    score={feedback.ideaOriginality.score} 
                    comment={feedback.ideaOriginality.comment} 
                  />
                  
                  <CriterionScore 
                    name="Execution Potential" 
                    score={feedback.executionPotential.score} 
                    comment={feedback.executionPotential.comment} 
                  />
                  
                  <CriterionScore 
                    name="Award Potential" 
                    score={feedback.awardPotential.score} 
                    comment={feedback.awardPotential.comment} 
                  />
                </div>
                
                <Separator className="my-3 border-amber-200 dark:border-amber-800" />
                
                <div className="bg-amber-100/80 dark:bg-amber-900/40 p-3 rounded-md">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 flex items-center">
                    <Award className="h-4 w-4 mr-1" /> Final Verdict
                  </h4>
                  <p className="text-amber-900 dark:text-amber-100 italic mt-1">
                    {feedback.finalVerdict}
                  </p>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface CriterionScoreProps {
  name: string;
  score: number;
  comment: string;
}

const CriterionScore: React.FC<CriterionScoreProps> = ({ name, score, comment }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-amber-800 dark:text-amber-200">{name}</h4>
        <div className="flex items-center">
          <ScoreBar score={score} />
          <span className="ml-2 font-medium">{score}/10</span>
        </div>
      </div>
      <p className="text-sm text-amber-700 dark:text-amber-300">{comment}</p>
    </div>
  );
};

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  // Calculate color based on score
  const getColorClass = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-amber-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const colorClass = getColorClass(score);
  const percentage = (score / 10) * 100;
  
  return (
    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default CreativeDirectorFeedback;
