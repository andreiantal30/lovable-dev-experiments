
import React, { useState } from 'react';
import { StorytellingOutput } from '@/lib/storytellingGenerator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import TransitionElement from './TransitionElement';

interface StorytellingNarrativeProps {
  storytelling?: StorytellingOutput;
}

const StorytellingNarrative: React.FC<StorytellingNarrativeProps> = ({ storytelling }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!storytelling) return null;

  return (
    <TransitionElement animation="slide-up" delay={300}>
      <Card className="p-6 mt-8 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Campaign Story</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{storytelling.storyNarrative}</p>
          
          {isExpanded && (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Protagonist</h4>
                <p className="text-gray-700 dark:text-gray-300">{storytelling.protagonistDescription}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Conflict</h4>
                <p className="text-gray-700 dark:text-gray-300">{storytelling.conflictDescription}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Resolution</h4>
                <p className="text-gray-700 dark:text-gray-300">{storytelling.resolutionDescription}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Brand Connection</h4>
                  <p className="text-gray-700 dark:text-gray-300">{storytelling.brandValueConnection}</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Audience Relevance</h4>
                  <p className="text-gray-700 dark:text-gray-300">{storytelling.audienceRelevance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </TransitionElement>
  );
};

export default StorytellingNarrative;
