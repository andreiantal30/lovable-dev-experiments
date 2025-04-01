
import React from "react";
import CampaignStyleSelector, { CampaignStyle } from '@/components/CampaignStyleSelector';

interface StyleSelectionProps {
  value: CampaignStyle | undefined;
  onChange: (style: CampaignStyle) => void;
}

const StyleSelection: React.FC<StyleSelectionProps> = ({
  value,
  onChange
}) => {
  return (
    <CampaignStyleSelector
      value={value}
      onChange={onChange}
    />
  );
};

export default StyleSelection;
