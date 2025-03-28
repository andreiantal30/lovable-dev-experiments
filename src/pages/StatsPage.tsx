
import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarInset } from "@/components/ui/sidebar";
import CampaignSidebar from "@/components/CampaignSidebar";
import SidebarToggle from "@/components/SidebarToggle";
import ThemeToggle from "@/components/ThemeToggle";
import CampaignStats from '@/components/CampaignStats';

const StatsPage: React.FC = () => {
  return (
    <>
      <CampaignSidebar onCampaignSelect={() => {}} />
      <SidebarInset className="bg-gradient-to-b from-[#0d0d15] to-[#111827] overflow-hidden relative">
        <SidebarToggle />
        <ThemeToggle />
        <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="mb-6">
            <Link to="/" className="text-primary hover:underline flex items-center gap-2">
              &larr; Back to home
            </Link>
          </div>
          <CampaignStats />
        </div>
      </SidebarInset>
    </>
  );
};

export default StatsPage;
