
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAaplSentimentScore } from '@/hooks/useAaplSentimentScore';
import { TrendingUp, TrendingDown, LucideTrendingUpDown } from "lucide-react";

const SentimentScore: React.FC = () => {
  const { score, confidence, loading } = useAaplSentimentScore();

  if (loading || score === null || confidence === null) {
    return <div>Loading sentiment...</div>;
  }

  // Determine sentiment and strength
  const getSentiment = () => {
    if (score > 15) return { 
      label: 'Bullish', 
      color: 'bg-green-500/20 text-green-400',
      icon: <TrendingUp size={14} className="text-green-400" />
    };

    if (score < -15) return { 
      label: 'Bearish', 
      color: 'bg-red-500/20 text-red-400',
      icon: <TrendingDown size={14} className="text-red-400" />
    };
    
    return { 
      label: 'Neutral', 
      color: 'bg-gray-500/20 text-gray-400',
      icon: <LucideTrendingUpDown size={14} className="text-gray-400" />
    };
  };

  const sentiment = getSentiment();
  
  // Format the score to remove negative sign and add + for positive
  const formattedScore = score > 0 ? `+${score?.toFixed()}` : `${Math.abs(score).toFixed()}`;

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
