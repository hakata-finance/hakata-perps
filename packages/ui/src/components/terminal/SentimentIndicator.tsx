
import React from 'react';
import { cn } from "@/lib/utils";

type SentimentLevel = 'extremely-bearish' | 'bearish' | 'neutral' | 'bullish' | 'extremely-bullish';

interface SentimentIndicatorProps {
  sentiment: SentimentLevel;
  className?: string;
}

const SentimentIndicator = ({ sentiment, className }: SentimentIndicatorProps) => {
  const getColor = () => {
    switch (sentiment) {
      case 'extremely-bearish': return 'bg-red-600';
      case 'bearish': return 'bg-red-400';
      case 'neutral': return 'bg-gray-400';
      case 'bullish': return 'bg-green-400';
      case 'extremely-bullish': return 'bg-green-600';
      default: return 'bg-gray-400';
    }
  };

  const getSentimentText = () => {
    switch (sentiment) {
      case 'extremely-bearish': return 'Extremely Bearish';
      case 'bearish': return 'Bearish';
      case 'neutral': return 'Neutral';
      case 'bullish': return 'Bullish';
      case 'extremely-bullish': return 'Extremely Bullish';
      default: return 'Neutral';
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="text-xs text-gray-400 mb-1">Market Sentiment</div>
      <div className="flex items-center space-x-2">
        <div className={cn("h-2.5 rounded-full w-full overflow-hidden bg-gray-700")}>
          <div 
            className={cn("h-full rounded-full", getColor())}
            style={{ 
              width: sentiment === 'extremely-bearish' ? '20%' :
                     sentiment === 'bearish' ? '40%' :
                     sentiment === 'neutral' ? '50%' :
                     sentiment === 'bullish' ? '70%' :
                     '90%' 
            }}
          />
        </div>
        <span className="text-xs whitespace-nowrap">{getSentimentText()}</span>
      </div>
    </div>
  );
};

export default SentimentIndicator;
