
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getNewsApiKey } from "@/lib/fetchNewsTrends.client";

export default function ApiKeyDebugger() {
  const [apiKeyStatus, setApiKeyStatus] = useState<"loading" | "available" | "missing">("loading");
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  useEffect(() => {
    const key = getNewsApiKey();
    setApiKey(key);
    setApiKeyStatus(key ? "available" : "missing");
  }, []);
  
  return (
    <div className="p-4 bg-muted/50 rounded-lg text-sm">
      <div className="flex items-center justify-between">
        <div>
          <strong>API Key Status:</strong>{" "}
          {apiKeyStatus === "loading" ? (
            "Checking..."
          ) : apiKeyStatus === "available" ? (
            <span className="text-green-500 font-medium">Available</span>
          ) : (
            <span className="text-red-500 font-medium">Missing</span>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowKey(!showKey)}
        >
          {showKey ? "Hide Key" : "Show Key"}
        </Button>
      </div>
      
      {showKey && apiKey && (
        <div className="mt-2 font-mono text-xs overflow-hidden text-ellipsis">
          <div className="flex gap-2">
            <div className="flex-shrink-0">Key:</div>
            <div className="overflow-hidden text-ellipsis">{apiKey}</div>
          </div>
          <div className="text-muted-foreground mt-1">
            From: {localStorage.getItem("news_api_key") ? "localStorage" : "environment variable"}
          </div>
        </div>
      )}
    </div>
  );
}
