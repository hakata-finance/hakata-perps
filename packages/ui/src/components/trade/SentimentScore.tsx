import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSentimentScore } from '@/hooks/useAaplSentimentScore';
import { TrendingUp, TrendingDown, LucideTrendingUpDown, AlertCircle } from "lucide-react";

/**
 * Sentiment classification with corresponding display properties
 */
interface SentimentClassification {
  label: string;
  color: string;
  icon: React.ReactNode;
}

/**
 * Props for the SentimentScore component
 */
interface SentimentScoreProps {
  /** The financial symbol to display sentiment for (default: 'AAPL') */
  symbol?: string;
  /** Whether to show the confidence percentage (default: true) */
  showConfidence?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Size of the icons (default: 14) */
  iconSize?: number;
}

/**
 * SentimentScore component
 * 
 * Displays the market sentiment score for a given financial symbol with visual indicators.
 * Shows sentiment classification (Bullish/Bearish/Neutral) along with confidence level.
 * 
 * @param {SentimentScoreProps} props - Component props
 * @returns {JSX.Element} Rendered sentiment score component
 * 
 * @example
 * ```tsx
 * <SentimentScore symbol="AAPL" />
 * <SentimentScore symbol="BTC" showConfidence={false} />
 * ```
 */
const SentimentScore: React.FC<SentimentScoreProps> = React.memo(({
  symbol = 'AAPL',
  showConfidence = true,
  className = '',
  iconSize = 14
}) => {
  const { score, confidence, loading, error } = useSentimentScore(symbol);

  /**
   * Determines sentiment classification based on score
   */
  const getSentiment = React.useCallback((sentimentScore: number): SentimentClassification => {
    if (sentimentScore > 15) {
      return { 
        label: 'Bullish', 
        color: 'bg-green-500/20 text-green-400',
        icon: <TrendingUp size={iconSize} className="text-green-400" />
      };
    }

    if (sentimentScore < -15) {
      return { 
        label: 'Bearish', 
        color: 'bg-red-500/20 text-red-400',
        icon: <TrendingDown size={iconSize} className="text-red-400" />
      };
    }
    
    return { 
      label: 'Neutral', 
      color: 'bg-gray-500/20 text-gray-400',
      icon: <LucideTrendingUpDown size={iconSize} className="text-gray-400" />
    };
  }, [iconSize]);

  /**
   * Formats score for display
   */
  const formatScore = React.useCallback((scoreValue: number): string => {
    return scoreValue > 0 
      ? `+${scoreValue.toFixed()}` 
      : `${Math.abs(scoreValue).toFixed()}`;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm text-gray-500">Loading sentiment...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help text-red-400">
              <AlertCircle size={iconSize} />
              <span className="text-sm">Sentiment Error</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Failed to load sentiment data</p>
            <p className="text-xs mt-1 text-red-300">{error}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // No data state
  if (score === null || confidence === null) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-500">No sentiment data</span>
      </div>
    );
  }

  const sentiment = getSentiment(score);
  const formattedScore = formatScore(score);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            {sentiment.icon}
            <span className="text-sm">Sentiment</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Market sentiment indicator for {symbol.toUpperCase()} based on news and social signals
          </p>
          {showConfidence && (
            <p className="text-xs mt-1">Confidence: {confidence}%</p>
          )}
        </TooltipContent>
      </Tooltip>
      <Badge className={`${sentiment.color} ml-1 text-xs`}>
        {sentiment.label} ({formattedScore})
      </Badge>
    </div>
  );
});

SentimentScore.displayName = 'SentimentScore';

export default SentimentScore;
