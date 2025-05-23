
import React from "react";
import TransitionElement from "@/components/TransitionElement";
import { OpenAIConfig } from "@/lib/openai";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ApiKeyFormProps {
  openAIConfig: OpenAIConfig;
  setOpenAIConfig: React.Dispatch<React.SetStateAction<OpenAIConfig>>;
  onSubmit: (e: React.FormEvent) => void;
  hasGeneratedCampaign?: boolean;
  onCancel?: () => void;
}

const ApiKeyForm = ({ 
  openAIConfig, 
  setOpenAIConfig, 
  onSubmit, 
  hasGeneratedCampaign,
  onCancel 
}: ApiKeyFormProps) => {
  return (
    <TransitionElement animation="fade">
      <div className="max-w-md mx-auto mb-10 bg-white/70 dark:bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 shadow-subtle">
        <h2 className="text-lg font-medium mb-3">Enter your OpenAI API Key</h2>
        
        <Alert className="mb-4 bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Secure API Key Storage</AlertTitle>
          <AlertDescription className="text-sm">
            Your API key will be stored securely in your browser's localStorage and never sent to our servers.
            It will only be used for direct API calls from your browser to OpenAI.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-1.5 mb-4">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={openAIConfig.apiKey}
              onChange={(e) => setOpenAIConfig({...openAIConfig, apiKey: e.target.value})}
              placeholder="sk-..."
              className="w-full px-3 py-2 border rounded-md bg-white/90 dark:bg-gray-800/60"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div className="space-y-1.5 mb-4">
            <label htmlFor="model" className="text-sm font-medium">
              OpenAI Model
            </label>
            <select
              id="model"
              value={openAIConfig.model}
              onChange={(e) => setOpenAIConfig({...openAIConfig, model: e.target.value})}
              className="w-full px-3 py-2 border rounded-md bg-white/90 dark:bg-gray-800/60"
            >
              <option value="gpt-4o">GPT-4o (Best quality)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Faster, cheaper)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest, cheapest)</option>
            </select>
          </div>

          <div className="flex justify-end">
            {hasGeneratedCampaign && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="mr-2 px-3 py-1.5 text-sm border rounded-md"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Save API Key
            </button>
          </div>
        </form>
      </div>
    </TransitionElement>
  );
};

export default ApiKeyForm;
