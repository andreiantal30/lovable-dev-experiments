
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
    "objectives": ["Objective 1"],
    "emotionalAppeal": ["Emotional Appeal 1"]
  }
]`}
      </pre>
    </div>
  );
};

export default JsonFormatExample;
