
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity } from "lucide-react";

interface VolatilityScoreProps {
  score: number; // 0 to 100
}

const VolatilityScore: React.FC<VolatilityScoreProps> = ({ score }) => {
  // Determine volatility level
  const getVolatilityLevel = () => {
    if (score < 30) return { label: 'Low', color: 'bg-green-500/20 text-green-400' };
    if (score < 70) return { label: 'Moderate', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'High', color: 'bg-red-500/20 text-red-400' };
  };

  const volatility = getVolatilityLevel();

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <Activity size={14} className={score > 70 ? 'text-red-400' : score > 30 ? 'text-orange-400' : 'text-green-400'} />
            <span>Volatility</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Market volatility indicator based on price movements and trading volume</p>
        </TooltipContent>
      </Tooltip>
      <Badge className={`${volatility.color} ml-1`}>
        {volatility.label} ({score}%)
      </Badge>
    </div>
  );
};

export default VolatilityScore;
