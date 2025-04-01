
import React from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 absolute top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export default SidebarToggle;
