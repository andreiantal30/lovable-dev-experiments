
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
      <Card className="p-6 mt-8 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">Campaign Story</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
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
          <p className="leading-relaxed">{storytelling.storyNarrative}</p>
          
          {isExpanded && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left column */}
              <div className="md:col-span-5 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Protagonist</h4>
                  <p>{storytelling.protagonistDescription}</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2">Conflict</h4>
                  <p>{storytelling.conflictDescription}</p>
                </div>
              </div>
              
              {/* Right column */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Resolution</h4>
                  <p>{storytelling.resolutionDescription}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Brand Connection</h4>
                    <p>{storytelling.brandValueConnection}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Audience Relevance</h4>
                    <p>{storytelling.audienceRelevance}</p>
                  </div>
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
