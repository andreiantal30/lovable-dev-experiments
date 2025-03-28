
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

const StatsPageLink: React.FC = () => {
  return (
    <Link 
      to="/stats" 
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <BarChart2 className="h-4 w-4" />
      <span>Campaign Stats</span>
    </Link>
  );
};

export default StatsPageLink;
