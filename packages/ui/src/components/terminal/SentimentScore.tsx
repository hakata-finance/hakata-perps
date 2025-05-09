
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SentimentScoreProps {
  score: number; // -100 to 100, negative is bearish, positive is bullish
  confidence: number; // 0 to 100
}

const SentimentScore: React.FC<SentimentScoreProps> = ({ score, confidence }) => {
  // Determine sentiment and strength
  const getSentiment = () => {
    if (score > 30) return { 
      label: 'Bullish', 
      color: 'bg-green-500/20 text-green-400',
      icon: <TrendingUp size={14} className="text-green-400" />
    };
    if (score < -30) return { 
      label: 'Bearish', 
      color: 'bg-red-500/20 text-red-400',
      icon: <TrendingDown size={14} className="text-red-400" />
    };
    return { 
      label: 'Neutral', 
      color: 'bg-gray-500/20 text-gray-400',
      icon: null
    };
  };

  const sentiment = getSentiment();
  
  // Format the score to remove negative sign and add + for positive
  const formattedScore = score > 0 ? `+${score}` : `${Math.abs(score)}`;

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            {sentiment.icon || null}
            <span>Sentiment</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Market sentiment indicator based on news and social signals</p>
          <p className="text-xs mt-1">Confidence: {confidence}%</p>
        </TooltipContent>
      </Tooltip>
      <Badge className={`${sentiment.color} ml-1`}>
        {sentiment.label} ({formattedScore})
      </Badge>
    </div>
  );
};

export default SentimentScore;
