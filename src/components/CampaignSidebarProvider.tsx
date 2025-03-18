
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface CampaignSidebarProviderProps {
  children: React.ReactNode;
}

export function CampaignSidebarProvider({ children }: CampaignSidebarProviderProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        {children}
      </div>
    </SidebarProvider>
  );
}
