
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedCampaign, CampaignVersion } from '@/lib/campaign/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Bookmark, BookmarkCheck, Save, Tag } from 'lucide-react';

interface CampaignVersionsProps {
  currentCampaign: GeneratedCampaign;
  versions: CampaignVersion[];
  onSaveVersion: (tag: string) => void;
  onLoadVersion: (version: CampaignVersion) => void;
}

const CampaignVersions: React.FC<CampaignVersionsProps> = ({
  currentCampaign,
  versions,
  onSaveVersion,
  onLoadVersion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState('');
  const [isTaggingOpen, setIsTaggingOpen] = useState(false);

  const handleSaveVersion = () => {
    if (!newVersionTag.trim()) {
      toast.error("Please enter a tag for this version");
      return;
    }
    
    onSaveVersion(newVersionTag.trim());
    setNewVersionTag('');
    setIsTaggingOpen(false);
    toast.success(`Campaign version saved as "${newVersionTag}"`);
  };

  const handleLoadVersion = (version: CampaignVersion) => {
    onLoadVersion(version);
    setIsOpen(false);
    toast.success(`Loaded campaign version: "${version.versionTag}"`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      {/* Save Version Dialog */}
      <Dialog open={isTaggingOpen} onOpenChange={setIsTaggingOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Version</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Campaign Version</DialogTitle>
            <DialogDescription>
              Enter a descriptive tag for this version of your campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tag" className="text-right text-sm font-medium">
                Version Tag
              </label>
              <Input
                id="tag"
                placeholder="edgy, safe, platform-led..."
                className="col-span-3"
                value={newVersionTag}
                onChange={(e) => setNewVersionTag(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveVersion}>Save Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Browse Versions Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2" disabled={versions.length === 0}>
            <Bookmark className="h-4 w-4" />
            <span>Browse Versions</span>
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
                {versions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Saved Campaign Versions</DialogTitle>
            <DialogDescription>
              Select a previous version to load
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-4">
              {versions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No saved versions yet</p>
              ) : (
                versions.map((version) => (
                  <div 
                    key={version.id} 
                    className="border rounded-md p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleLoadVersion(version)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {version.versionTag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(version.timestamp)}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium">{version.campaign.campaignName}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {version.campaign.keyMessage}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampaignVersions;
