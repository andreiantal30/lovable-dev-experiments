
import React from 'react';

const JsonFormatExample: React.FC = () => {
  return (
    <div className="text-sm text-muted-foreground">
      <h3 className="font-medium mb-1">JSON Format Example:</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
{`[
  {
    "name": "Campaign Name",
    "brand": "Brand Name",
    "industry": "Industry",
    "targetAudience": ["Audience 1", "Audience 2"],
    "objectives": ["Objective 1", "Objective 2"],
    "emotionalAppeal": ["Emotional Appeal 1", "Emotional Appeal 2"],
    "year": 2023,
    "keyMessage": "Your key message here",
    "features": ["Feature 1", "Feature 2"],
    "outcomes": ["Outcome 1", "Outcome 2"],
    "strategy": "Your strategy description",
    "viralElement": "Viral element description",
    "creativeActivation": "Creative activation description"
  }
]`}
      </pre>
      <p className="mt-2 text-xs">
        <span className="font-semibold">Required fields:</span> name, brand, industry
        <br />
        <span className="font-semibold">Arrays:</span> targetAudience, objectives, features, emotionalAppeal, outcomes
        <br />
        <span className="font-semibold">Optional fields:</span> year, keyMessage, strategy, viralElement, creativeActivation
      </p>
    </div>
  );
};

export default JsonFormatExample;
